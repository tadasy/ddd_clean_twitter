import { ValueObject } from 'shared/domain/valueObject.js'

export class Email extends ValueObject<string> {
  constructor(value: string) {
    super(value)
  }
  protected validate(value: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`Invalid Email: ${value}`)
    }
  }
}
