import { Component, Show } from 'solid-js';
import { IChatSettings } from '.';
import { IMessage } from '../interfaces';

export interface IChatMessageProps {
  message: IMessage;
  settings: IChatSettings;
}

export const ChatMessage: Component<IChatMessageProps> = (props) => {
  return (
    <div class="flex flex-col rounded-md">
      <div class="p-1 pr-3 relative left-1 right-3">
        <Show when={props.settings.showAuthors && props.message.author}>
          <p
            style={{
              '-webkit-text-fill-color': props.settings.authorColor,
              'text-shadow': `0px 0px ${props.settings.authorShadowSize}px ${props.settings.authorShadowColor}`,
              'font-size': `${props.settings.authorSize}px`,
            }}
          >
            {props.message.author}
          </p>
        </Show>
        <Show when={props.message.text}>
          <p
            class={`relative font-bold leading-tight ${
              props.settings.showTextBorder ? 'chat-message-outline' : ''
            }`}
            style={{
              'font-size': `${props.settings.textSize}px`,
              color: props.settings.textColor,
              'text-shadow': `0px 0px ${props.settings.textShadowSize}px ${props.settings.textShadowColor}`,
            }}
            data-text={props.message.text}
          >
            {props.message.text}
          </p>
        </Show>
      </div>
      <Show when={props.settings.showImages && props.message.imageUrl}>
        <div class="flex p-1 pr-2 relative left-1 right-2">
          <img
            class="flex-1 rounded-md justify-center"
            style={{
              border: `${props.settings.imageBorderSize}px ${props.settings.imageBorderColor}`,
              'box-shadow': `0px 0px ${props.settings.imageShadowSize}px ${props.settings.imageShadowColor}`,
            }}
            src={props.message.imageUrl}
          />
        </div>
      </Show>
    </div>
  );
};
