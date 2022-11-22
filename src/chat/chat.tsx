import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { IMessage } from '../interfaces';
import { WykopChat } from '../providers/wykop-chat';
import { catchError, concatMap, delay, of, tap, Subscription } from 'rxjs';
import { ChatMessage } from '.';

export interface ChatProps {
  url: URL;
  settings: IChatSettings;
}

export interface IChatSettings {
  opacity: number;
  showAuthors: boolean;
  showTextBorder: boolean;
  showImages: boolean;
  textSize: number;
  textColor: string;
  textShadowSize: number;
  textShadowColor: string;
  authorSize: number;
  authorColor: string;
  authorShadowSize: number;
  authorShadowColor: string;
  imageBorderSize: number;
  imageBorderColor: string;
  imageShadowSize: number;
  imageShadowColor: string;
}

export const Chat: Component<ChatProps> = (props) => {
  let chatRef: HTMLDivElement | undefined;

  const [chat, setChat] = createSignal<IMessage[]>([]);
  const [error, setError] = createSignal(false);

  const [subscription, setSubscription] = createSignal<Subscription>();

  onMount(async () => {
    const messages = await new WykopChat().parse(props.url);
    const subscription = messages
      .pipe(
        catchError((_, caught) => {
          setError(true);
          chatRef?.scrollTo(0, chatRef.scrollHeight);
          return caught;
        }),
        tap(({ imageUrl }) => {
          if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;
          }
        }),
        concatMap((message) => of(message).pipe(delay(1000))),
      )
      .subscribe({
        next: (message) => {
          setError(false);
          setChat([...chat(), message]);
          chatRef?.scrollTo(0, chatRef.scrollHeight);
        },
      });
    setSubscription(subscription);
  });

  onCleanup(() => subscription()?.unsubscribe());

  return (
    <div
      ref={chatRef}
      class="h-full flex flex-col justify-start overflow-scroll scroll-smooth no-scrollbar"
      style={{ opacity: props.settings.opacity }}
    >
      <For each={chat()}>
        {(message) => (
          <ChatMessage message={message!} settings={props.settings} />
        )}
      </For>
      <Show when={error()}>
        <div class="bg-red-500 p-2 rounded-md text-center">
          <p class="font-bold text-lg">Failed to fetch new messages</p>
          <p class="text-sm">I'll keep trying</p>
        </div>
      </Show>
    </div>
  );
};
