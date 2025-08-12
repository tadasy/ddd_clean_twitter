import type { components } from '@repo/api-types'

export type User = components['schemas']['Api.User']
export type Post = components['schemas']['Api.Post'] & { count?: number }
export type LoginResponse = components['schemas']['Api.LoginResponse']
