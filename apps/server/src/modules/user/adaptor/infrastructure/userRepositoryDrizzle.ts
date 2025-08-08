import { db } from '../../../../db/client'
import { users } from '../../../../db/schema'
import type { UserRepository } from '../../domain/repository/userRepository'
import { Email } from '../../domain/valueObject/email'
import { User } from '../../domain/entity/user'
import { eq } from 'drizzle-orm'

type UserRow = typeof users.$inferSelect

export class UserRepositoryDrizzle implements UserRepository {
  async save(user: User): Promise<void> {
    if (user.getID() && user.getID() !== 0) {
      await db.update(users).set({ name: user.getName(), email: user.getEmail().getValue() }).where(eq(users.id, user.getID()))
    } else {
      await db.insert(users).values({ name: user.getName(), email: user.getEmail().getValue() })
    }
  }

  async findOneByID(id: number): Promise<User | null> {
    const rows: UserRow[] = await db.select().from(users).where(eq(users.id, id))
    const r = rows[0]
    if (!r) return null
    return new User(r.id, r.name, new Email(r.email))
  }

  async findAll(): Promise<User[]> {
    const rows: UserRow[] = await db.select().from(users)
    return rows.map((r) => new User(r.id, r.name, new Email(r.email)))
  }

  async findByEmail(email: Email): Promise<User | null> {
    const rows: UserRow[] = await db.select().from(users).where(eq(users.email, email.getValue()))
    const r = rows[0]
    if (!r) return null
    return new User(r.id, r.name, new Email(r.email))
  }
}
