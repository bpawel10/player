import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Tvp } from './providers/tvp';
import { Watch } from './watch';

export const App: Component = () => {
  const [videoUrl, setVideoUrl] = createSignal('');
  const [chatUrl, setChatUrl] = createSignal('');
  const [video, setVideo] = createSignal<URL | null>();
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
                <div class="relative">
                  <input
                    type="text"
                    class="w-full px-2 py-1 rounded-sm"
                    placeholder="Video url"
                    value={videoUrl()}
                    onInput={async ({ currentTarget: { value } }) => {
                      setVideoUrl(() => value);
                      try {
                        const video = await new Tvp().parse(new URL(value));
                        setVideo(video);
                      } catch (_) {
                        setVideo(null);
                      }
                    }}
                  />
                  <div class="absolute -right-7" style={{ top: '1px' }}>
                    <Show when={video() !== undefined}>
                      <Show
                        when={video()}
                        fallback={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-6 h-6 text-red-600"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-6 h-6 text-green-600"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </Show>
                    </Show>
                  </div>
                </div>
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
      <Watch videoUrl={video()!} chatUrl={new URL(chatUrl())} />
    </Show>
  );
};
