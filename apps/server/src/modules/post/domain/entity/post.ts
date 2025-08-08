import { Entity } from 'shared/domain/entity.js'

export type PostID = number

export class Post extends Entity<PostID> {
  constructor(
    readonly id: PostID,
    private userId: number,
    private message: string,
  ) {
    super(id)
    if (!message || message.length === 0) throw new Error('Message is required')
    if (message.length > 280) throw new Error('Message must be 280 characters or less')
  }

  getUserId(): number {
    return this.userId
  }
  getMessage(): string {
    return this.message
  }
  updateMessage(newMessage: string): void {
    if (!newMessage || newMessage.length === 0) throw new Error('Message is required')
    if (newMessage.length > 280) throw new Error('Message must be 280 characters or less')
    this.message = newMessage
  }
}
