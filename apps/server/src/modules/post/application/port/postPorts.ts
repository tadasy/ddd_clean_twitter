export interface InputPort<T> {
  execute(request: T): Promise<void>
}

export interface OutputPort {
  failure(error: Error): void
}

export type CreatePostRequest = {
  userId: number
  message: string
}

export interface PostOutputPort extends OutputPort {
  successCreatePost(response: { post: { id: number; userId: number; message: string } }): void
}
