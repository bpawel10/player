import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Watch } from './watch';

export const App: Component = () => {
  const [videoUrl, setVideoUrl] = createSignal('');
  const [chatUrl, setChatUrl] = createSignal('');
  const [play, setPlay] = createSignal(false);

  return (
    <Show
      when={play()}
      fallback={
        <div class="flex justify-center items-center h-screen">
          <div class="flex-1">
            <div class="flex flex-col w-full items-center gap-4">
              <div class="w-4/5">
                <label class="text-white">Video url</label>
                <input
                  type="text"
                  class="w-full px-2 py-1 rounded-sm"
                  placeholder="Video url"
                  value={videoUrl()}
                  onInput={({ currentTarget: { value } }) =>
                    setVideoUrl(() => value)
                  }
                />
              </div>
              <div class="w-4/5">
                <label class="text-white">Chat url</label>
                <input
                  type="text"
                  class="w-full px-2 py-1 rounded-sm"
                  placeholder="Chat url"
                  value={chatUrl()}
                  onInput={({ currentTarget: { value } }) =>
                    setChatUrl(() => value)
                  }
                />
              </div>
              <button
                class="px-2 py-1 rounded-md bg-blue-600"
                onClick={() => setPlay(true)}
              >
                <strong>Play</strong>
              </button>
            </div>
          </div>
        </div>
      }
    >
      <Watch videoUrl={new URL(videoUrl())} chatUrl={new URL(chatUrl())} />
    </Show>
  );
};
