import { fetch, ResponseType } from '@tauri-apps/api/http';
import { IVideo } from '../interfaces';

export class Tvp implements IVideo {
  async parse(url: URL): Promise<URL> {
    const { data } = await fetch<string>(url.toString(), {
      method: 'GET',
      responseType: ResponseType.Text,
    });

    const dataWithoutWhitespaces = data.replace(/\s+/g, '');

    const [, videoId] =
      dataWithoutWhitespaces.match(/"video_id":(\d+)/) ||
      dataWithoutWhitespaces.match(/"_id":(\d+)/)!;

    const { data: json } = await fetch<Record<string, any>>(
      `https://api.tvp.pl/tokenizer/token/${videoId}`,
    );
    return new URL(
      json.formats.find(
        ({ mimeType }: { mimeType: string }) =>
          mimeType === 'application/x-mpegurl',
      ).url,
    );
  }
}
