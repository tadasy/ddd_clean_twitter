export interface InputPort<T> {
  execute(request: T): Promise<void>
}

export interface OutputPort {
  failure(error: Error): void
}

export type ToggleFavoriteRequest = {
  userId: number
  postId: number
}

export interface FavoriteOutputPort extends OutputPort {
  successAdd(): void
  successRemove(): void
}
