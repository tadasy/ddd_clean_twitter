import { Email } from '../valueObject/email.js'
import { User } from '../entity/user.js'

export class UserFactory {
  createNew(id: number, name: string, email: string): User {
    return new User(id, name, new Email(email))
  }
}
