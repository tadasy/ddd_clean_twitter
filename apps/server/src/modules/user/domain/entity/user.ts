import { Entity } from 'shared/domain/entity.js'
import { Email } from '../valueObject/email.js'

export type UserID = number

export class User extends Entity<UserID> {
  constructor(
    readonly id: UserID,
    private name: string,
    private email: Email,
  ) {
    super(id)
  }

  getName(): string {
    return this.name
  }
  getEmail(): Email {
    return this.email
  }
  rename(newName: string): void {
    this.name = newName
  }
}
