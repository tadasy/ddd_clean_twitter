import { Entity } from 'shared/domain/entity'

export type FavoriteID = number

export class Favorite extends Entity<FavoriteID> {
  constructor(
    readonly id: FavoriteID,
    private userId: number,
    private postId: number,
  ) {
    super(id)
  }

  getUserId(): number {
    return this.userId
  }
  getPostId(): number {
    return this.postId
  }
}
