export abstract class Entity<ID> {
  protected constructor(protected readonly id: ID) {}
  getID(): ID {
    return this.id
  }
  equals(entity: Entity<ID>): boolean {
    return this.id === entity.getID()
  }
}
