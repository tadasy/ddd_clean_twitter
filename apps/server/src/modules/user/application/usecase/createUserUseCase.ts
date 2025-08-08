export interface CreateUserDeps {
  userRepository: import('../../domain/repository/userRepository.js').UserRepository
  userFactory: import('../../domain/factory/userFactory.js').UserFactory
}

import type { CreateUserInputPort, CreateUserRequest, UserOutputPort } from '../port/userPorts.js'
import { Email } from '../../domain/valueObject/email.js'

export class CreateUserUseCase implements CreateUserInputPort {
  private outputPort?: UserOutputPort
  constructor(private readonly deps: CreateUserDeps) {}

  setOutputPort(outputPort: UserOutputPort) {
    this.outputPort = outputPort
  }

  async execute(request: CreateUserRequest): Promise<void> {
    try {
      const email = new Email(request.email)
      const existing = await this.deps.userRepository.findByEmail(email)
      if (existing) throw new Error('Email already in use')

      const user = this.deps.userFactory.createNew(0, request.name, request.email)
      await this.deps.userRepository.save(user)

      this.outputPort?.successCreateUser({ user: { id: user.getID(), name: user.getName(), email: email.getValue() } })
    } catch (e) {
      this.outputPort?.failure(e as Error)
    }
  }
}
