import { Observable } from 'rxjs';
import { IMessage } from '.';

export interface IChat {
  parse(url: URL): Promise<Observable<IMessage>>;
}
