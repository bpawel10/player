import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/tauri';
import {
  Component,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import 'video.js/dist/video-js.css';

export interface IPlayerProps {
  url: URL;
  options: VideoJsPlayerOptions;
}

export const Player: Component<IPlayerProps> = (props) => {
  let videoRef: HTMLVideoElement | undefined;

  const [player, setPlayer] = createSignal<VideoJsPlayer>();
  const [isFullscreen, { refetch: refetchFullscreen }] = createResource(() =>
    appWindow.isFullscreen(),
  );

  onMount(() => {
    videojs.use('*', () => ({
      setSource: async ({ src, type }, next) => {
        const sourceUrl = new URL(src);
        const filename = sourceUrl.pathname.split('/').pop()!;
        const newUrl = new URL(props.url.toString());
        const split = newUrl.pathname.split('/');
        split.pop();
        split.push(filename);
        newUrl.pathname = split.join('/');
        return next(null, {
          src: await invoke('proxify', { url: newUrl.toString() }),
          type,
        });
      },
    }));
    setPlayer(videojs(videoRef || '', props.options));
    const fullscreenToggle: any =
      player()?.controlBar.getChild('fullscreenToggle');
    fullscreenToggle.handleClick = async () => {
      await appWindow.setFullscreen(!isFullscreen());
      await refetchFullscreen();
    };
  });

  onCleanup(() => {
    player()?.dispose();
    setPlayer(undefined);
  });

  return (
    <div data-vjs-player class="vjs-fluid">
      <video
        ref={videoRef}
        id="player"
        class="video-js vjs-fluid"
        autoplay={true}
        controls
        data-setup={JSON.stringify(props.options)}
      >
        <source
          src={props.url.toString()}
          type="application/x-mpegURL"
        ></source>
      </video>
    </div>
  );
};
