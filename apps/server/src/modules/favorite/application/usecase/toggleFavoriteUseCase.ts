import type { FavoriteRepository } from '../../domain/repository/favoriteRepository'
import { Favorite } from '../../domain/entity/favorite'
import type { FavoriteOutputPort, ToggleFavoriteRequest } from '../port/favoritePorts'

export class ToggleFavoriteUseCase {
  private output?: FavoriteOutputPort
  constructor(private readonly deps: { favoriteRepository: FavoriteRepository }) {}

  setOutputPort(output: FavoriteOutputPort) {
    this.output = output
  }

  async execute(request: ToggleFavoriteRequest): Promise<void> {
    try {
      const exists = await this.deps.favoriteRepository.isFavorited(request.userId, request.postId)
      if (exists) {
        await this.deps.favoriteRepository.remove(request.userId, request.postId)
        this.output?.successRemove()
      } else {
        const fav = new Favorite(0, request.userId, request.postId)
        await this.deps.favoriteRepository.add(fav)
        this.output?.successAdd()
      }
    } catch (e) {
      this.output?.failure(e as Error)
    }
  }
}
