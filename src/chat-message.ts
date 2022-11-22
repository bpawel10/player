export interface IChatMessageData {
  id: string;
  createdAt: Date;
  showAt: Date;
  hideAt: Date;
  author: string;
  text?: string;
  imageUrl?: string;
}

export class ChatMessage {
  constructor(
    readonly id: string,
    readonly createdAt: Date,
    readonly showAt: Date,
    readonly hideAt: Date,
    readonly author: string,
    readonly text?: string,
    readonly imageUrl?: string,
  ) {}
}
