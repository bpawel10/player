import { fetch, ResponseType } from '@tauri-apps/api/http';
import $ from 'jquery';
import { parseISO } from 'date-fns';
import { UnrecognizedUrlException } from '../constants';
import { interval, mergeMap, Observable, throwError } from 'rxjs';
import { IChat, IMessage } from '../interfaces';

export enum WykopChatFeedType {
  BEST = 'najlepsze',
  ALL = 'wszystkie',
}

export class WykopChat implements IChat {
  private static FETCH_MESSAGES_INTERVAL_BEST = 10 * 1000;
  private static FETCH_MESSAGES_INTERVAL_ALL = 1 * 1000;
  private static DOMAINS = ['wykop.pl', 'www.wykop.pl'];

  async parse({ hostname, pathname }: URL): Promise<Observable<IMessage>> {
    if (!WykopChat.DOMAINS.includes(hostname)) {
      throw new UnrecognizedUrlException();
    }

    const [, tag, feedTypeString] =
      pathname.match(/\/tag\/([a-zA-Z0-9]*)\/?(najlepsze|wszystkie)?/) || [];

    let feedType = feedTypeString as WykopChatFeedType;

    if (!Object.values(WykopChatFeedType).includes(feedType)) {
      feedType = WykopChatFeedType.BEST;
    }

    let lastMessage = await WykopChat.getLastMessage(tag, feedType);

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
          );

          if (messages.length) {
            lastMessage = messages.at(-1)!;
          }

          return messages;
        } catch (err) {
          return throwError(() => ({}));
        }
      }),
      mergeMap((messages) => messages),
    );
  }

  static async getLastMessage(
    tag: string,
    feedType: string,
  ): Promise<IMessage> {
    const { data } = await fetch<string>(
      `https://wykop.pl/tag/${tag}/${feedType}`,
      {
        method: 'GET',
        responseType: ResponseType.Text,
      },
    );

    const lastEntry = $(data)
      .find('.comments-stream')
      .children('.entry')
      .first();

    const lastMessage = this.parseEntry(lastEntry);

    return lastMessage;
  }

  static async fetchMessages(
    tag: string,
    feedType: string,
    lastMessage: IMessage,
  ): Promise<IMessage[]> {
    const url = `https://www.wykop.pl/ajax2/tag/recent/tag/${tag}/method/index/popular/${
      feedType === WykopChatFeedType.BEST ? '1' : '0'
    }/user/0/type/entry/id/${lastMessage.id}/html/1`;

    const { data } = await fetch<string>(url, {
      method: 'GET',
      responseType: ResponseType.Text,
    });

    const json: {
      operations: {
        type: string;
        method: string;
        data: { count?: number; html?: string };
      }[];
    } = JSON.parse(data.substring(8));

    const response = json.operations.find(
      ({ type, method }) =>
        type === 'callback' && method === 'handleDefaultAjaxRefresh',
    );

    const html = response?.data?.html;

    const messages = [];

    if (html) {
      messages.push(
        ...$(html)
          .children('.entry')
          .toArray()
          .map((entry) => this.parseEntry($(entry)))
          .filter(({ text, imageUrl }) => text || imageUrl)
          .reverse(),
      );
    }

    return messages;
  }

  static parseEntry(entry: JQuery<HTMLElement>): IMessage {
    const id = entry.find('div[data-type="entry"]').data('id');
    const date = entry
      .find('div > div > div.author > a > small > time')
      .first()
      .attr('datetime');
    const author = entry.find('div > div > div.author > a > b').first().text();
    const text = entry
      .find('div > div > div.text > p')
      .first()
      .children()
      .remove()
      .end()
      .text()
      .replaceAll('#', '')
      .trim();
    const imageUrl = entry
      .find('div > div > div.text div.media-content img')
      .first()
      .attr('src');

    return {
      id,
      date: date ? parseISO(date) : undefined,
      author,
      text,
      imageUrl,
    };
  }
}
