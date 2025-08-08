import type { CreatePostRequest, PostOutputPort } from '../port/postPorts'
import type { PostRepository } from '../../domain/repository/postRepository'
import { Post } from '../../domain/entity/post'

export class CreatePostUseCase {
  private output?: PostOutputPort
  constructor(private readonly deps: { postRepository: PostRepository }) {}

  setOutputPort(output: PostOutputPort) {
    this.output = output
  }

  async execute(request: CreatePostRequest): Promise<void> {
    try {
      const post = new Post(0, request.userId, request.message)
      await this.deps.postRepository.save(post)
      this.output?.successCreatePost({ post: { id: post.getID(), userId: post.getUserId(), message: post.getMessage() } })
    } catch (e) {
      this.output?.failure(e as Error)
    }
  }
}
