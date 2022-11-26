export interface IVideo {
  parse(url: URL): Promise<URL>;
}
