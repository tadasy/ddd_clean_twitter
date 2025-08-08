import type { User, UserID } from '../entity/user.js'
import type { Email } from '../valueObject/email.js'

export interface UserRepository {
  save(user: User): Promise<void>
  findOneByID(id: UserID): Promise<User | null>
  findAll(): Promise<User[]>
  findByEmail(email: Email): Promise<User | null>
}
