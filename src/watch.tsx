import { Component, createSignal, Show } from 'solid-js';
import { DraggableResizable } from './draggable-resizable';
import { Chat, IChatSettings } from './chat';
import { Player } from './player';

export interface IWatchProps {
  videoUrl: URL;
  chatUrl?: URL;
}

export const Watch: Component<IWatchProps> = ({ videoUrl, chatUrl }) => {
  const [chatSettings, setChatSettings] = createSignal<IChatSettings>({
    opacity: 0.7,
    showAuthors: true,
    showTextBorder: true,
    showImages: true,
    textSize: 16,
    textColor: 'white',
    textShadowSize: 0,
    textShadowColor: 'black',
    authorSize: 11,
    authorColor: 'black',
    authorShadowSize: 0,
    authorShadowColor: 'black',
    imageBorderSize: 0,
    imageBorderColor: 'black',
    imageShadowSize: 0,
    imageShadowColor: 'black',
  });

  const [chatSettingsOpen, setChatSettingsOpen] = createSignal(false);

  return (
    <>
      <div data-tauri-drag-region class="absolute ml-20 w-full h-10 z-50" />
      <div class="overflow-hidden bg-black">
        <div class="flex items-center w-screen h-screen">
          <Player
            url={videoUrl}
            options={{
              fluid: true,
              controlBar: {
                playbackRateMenuButton: false,
                chaptersButton: false,
                descriptionsButton: false,
                subsCapsButton: false,
                audioTrackButton: false,
              },
            }}
          />
        </div>
        <Show when={chatUrl}>
          <DraggableResizable
            initWidth={Math.min(screen.width * 0.8, 300)}
            initHeight={Math.min(screen.height * 0.8, 500)}
            initX={100}
            initY={100}
          >
            <div class="absolute top-1 right-1 w-6 h-6 invisible group-hover:visible z-30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="w-6 h-6 cursor-pointer"
                onClick={() => setChatSettingsOpen(!chatSettingsOpen())}
              >
                <path
                  fill-rule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="absolute top-10 right-2 z-40 invisible group-hover:visible no-scrollbar">
              <div class={chatSettingsOpen() ? '' : 'invisible'}>
                <div class="p-2 rounded-md bg-white bg-opacity-50">
                  <div class="text-center">
                    <div>
                      <label>
                        Opacity <b>{chatSettings().opacity}</b>
                      </label>
                    </div>
                    <input
                      class="px-2 py-1 rounded-md"
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={chatSettings().opacity}
                      onInput={({ currentTarget: { value } }) =>
                        setChatSettings({
                          ...chatSettings(),
                          opacity: Number(value),
                        })
                      }
                    />
                  </div>
                  <div class="text-center">
                    <label class="mr-2">
                      <input
                        type="checkbox"
                        checked={chatSettings().showAuthors}
                        onInput={({ currentTarget: { checked } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            showAuthors: checked,
                          })
                        }
                      />{' '}
                      Show authors
                    </label>
                  </div>
                  <div class="text-center">
                    <label class="mr-2">
                      <input
                        type="checkbox"
                        checked={chatSettings().showTextBorder}
                        onInput={({ currentTarget: { checked } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            showTextBorder: checked,
                          })
                        }
                      />{' '}
                      Show text border
                    </label>
                  </div>
                  <div class="text-center">
                    <label class="mr-2">
                      <input
                        type="checkbox"
                        checked={chatSettings().showImages}
                        onInput={({ currentTarget: { checked } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            showImages: checked,
                          })
                        }
                      />{' '}
                      Show images
                    </label>
                  </div>
                  <div class="text-right">
                    <p class="text-center font-bold mt-2">Author</p>
                    <div class="my-1">
                      <label class="mr-2">Text size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().authorSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            authorSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Text color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().authorColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            authorColor: value,
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().authorShadowSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            authorShadowSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().authorShadowColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            authorShadowColor: value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-center font-bold mt-2">Text</p>
                    <div class="my-1">
                      <label class="mr-2">Text size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().textSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            textSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Text color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().textColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            textColor: value,
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().textShadowSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            textShadowSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().textShadowColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            textShadowColor: value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-center font-bold mt-2">Image</p>
                    <div class="my-1">
                      <label class="mr-2">Border size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().imageBorderSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            imageBorderSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Border color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().imageBorderColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            imageBorderColor: value,
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow size</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="number"
                        value={chatSettings().imageShadowSize}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            imageShadowSize: Number(value),
                          })
                        }
                      />
                    </div>
                    <div class="my-1">
                      <label class="mr-2">Shadow color</label>
                      <input
                        class="w-14 px-2 py-1 rounded-md"
                        type="text"
                        value={chatSettings().imageShadowColor}
                        onInput={({ currentTarget: { value } }) =>
                          setChatSettings({
                            ...chatSettings(),
                            imageShadowColor: value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Chat url={chatUrl!} settings={chatSettings()} />
          </DraggableResizable>
        </Show>
      </div>
    </>
  );
};
