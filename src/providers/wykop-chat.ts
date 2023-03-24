import { Body, fetch, ResponseType } from '@tauri-apps/api/http';
import { format, isAfter, parse } from 'date-fns';
import { UnrecognizedUrlException } from '../constants';
import { interval, mergeMap, Observable, throwError } from 'rxjs';
import { IChat, IMessage } from '../interfaces';

export enum WykopChatFeedType {
  BEST = 'best',
  ALL = 'all',
}

export class WykopChat implements IChat {
  private static FETCH_MESSAGES_INTERVAL_BEST = 10 * 1000;
  private static FETCH_MESSAGES_INTERVAL_ALL = 1 * 1000;
  private static DOMAINS = ['wykop.pl', 'www.wykop.pl'];
  private static API_KEYS_FILE_URL =
    'https://wykop.pl/static/js/vendor.62eaf5fdda64ac237769.js';
  private static API_V3_AUTH_URL = 'https://wykop.pl/api/v3/auth';
  private static API_V3_GET_MESSAGES_URL = (
    tag: string,
    feedType: WykopChatFeedType,
  ) => `https://wykop.pl/api/v3/tags/${tag}/stream?sort=${feedType}`;
  private static API_V3_GET_NEW_MESSAGES_COUNT_URL = (
    tag: string,
    feedType: WykopChatFeedType,
    date: string,
  ) =>
    `https://wykop.pl/api/v3/tags/${tag}/newer?type=${feedType}&date=${date}`;

  async getAccessToken(): Promise<string> {
    const { data } = await fetch<string>(WykopChat.API_KEYS_FILE_URL, {
      method: 'GET',
      responseType: ResponseType.Text,
    });

    const [, , base64EncodedKey, base64EncodedSecret] = data.match(
      /(apiClientId:"(.+?)",apiClientSecret:"(.+?)")/,
    )!;

    const key = window.atob(base64EncodedKey);
    const secret = window.atob(base64EncodedSecret);

    const {
      data: {
        data: { token },
      },
    } = await fetch<{ data: { token: string } }>(WykopChat.API_V3_AUTH_URL, {
      method: 'POST',
      body: Body.json({ data: { key, secret } }),
      responseType: ResponseType.JSON,
    });

    return token;
  }

  async parse({ hostname, pathname }: URL): Promise<Observable<IMessage>> {
    if (!WykopChat.DOMAINS.includes(hostname)) {
      throw new UnrecognizedUrlException();
    }

    const [, tag, feedTypeString] =
      pathname.match(/\/tag\/([a-zA-Z0-9]*)\/?(najlepsze|wszystkie)?/) || [];

    let feedType = feedTypeString as WykopChatFeedType;

    if (!Object.values(WykopChatFeedType).includes(feedType)) {
      feedType = WykopChatFeedType.ALL;
    }

    const token = await this.getAccessToken();

    let lastMessage = await WykopChat.getLastMessage(tag, feedType, token);

    return interval(
      feedType === WykopChatFeedType.BEST
        ? WykopChat.FETCH_MESSAGES_INTERVAL_BEST
        : WykopChat.FETCH_MESSAGES_INTERVAL_ALL,
    ).pipe(
      mergeMap(async () => {
        try {
          let messages = await WykopChat.fetchMessages(
            tag,
            feedType,
            lastMessage,
            token,
          );

          if (messages.length) {
            lastMessage = messages.at(0)!;
          }

          return messages;
        } catch (err) {
          return throwError(() => err);
        }
      }),
      mergeMap((messages) => messages),
    );
  }

  static async getLastMessage(
    tag: string,
    feedType: WykopChatFeedType,
    token: string,
  ): Promise<IMessage> {
    const messages = await this.getMessages(tag, feedType, token);
    return messages.at(0)!;
  }

  static async getMessages(
    tag: string,
    feedType: WykopChatFeedType,
    token: string,
  ): Promise<IMessage[]> {
    const url = WykopChat.API_V3_GET_MESSAGES_URL(tag, feedType);
    const {
      data: { data },
    } = await fetch<{ data: Record<string, any>[] }>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: ResponseType.JSON,
    });

    return data
      .filter(({ content }) => content)
      .map(this.parseEntry)
      .filter(({ text, imageUrl }) => text?.length || imageUrl);
  }

  static async fetchMessages(
    tag: string,
    feedType: WykopChatFeedType,
    lastMessage: IMessage,
    token: string,
  ): Promise<IMessage[]> {
    const date = format(lastMessage.date!, 'yyyy-MM-dd+HH:mm:ss');
    const url = WykopChat.API_V3_GET_NEW_MESSAGES_COUNT_URL(
      tag,
      feedType,
      date,
    );
    const {
      data: {
        data: { count },
      },
    } = await fetch<{ data: { count: string } }>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: ResponseType.JSON,
    });

    if (!count) {
      return [];
    }

    const messages = await this.getMessages(tag, feedType, token);

    return messages.filter(({ date }) => isAfter(date!, lastMessage.date!));
  }

  static parseEntry(entry: Record<string, any>): IMessage {
    return {
      id: entry.id,
      date: parse(entry.created_at, 'yyyy-MM-dd HH:mm:ss', new Date()),
      author: entry.author.username,
      text: entry.content
        .replaceAll('(\n)+', ' ')
        .replaceAll(/#[a-z0-9]+/g, '')
        .replaceAll(/\[\*\*(LINK|MIRROR)\*\*\]\(.+?\)/g, '')
        .replaceAll(/\[.+?\]\((.+?)\)/g, '$1')
        .replaceAll(/\*\*(.+?)\*\*/g, '$1') // TODO: handle bold text better
        .trim(),
      imageUrl: entry?.media?.photo?.url,
    };
  }
}
