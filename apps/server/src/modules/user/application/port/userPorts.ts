// Input/Output Ports

export interface InputPort<T> {
  execute(request: T): Promise<void>
}

export interface OutputPort {
  failure(error: Error): void
}

export type CreateUserRequest = {
  name: string
  email: string
}

export interface CreateUserInputPort extends InputPort<CreateUserRequest> {}

export interface UserOutputPort extends OutputPort {
  successCreateUser(response: { user: { id: number; name: string; email: string } }): void
}
