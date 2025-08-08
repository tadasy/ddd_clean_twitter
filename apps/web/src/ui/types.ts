export type User = { id: number; name: string; email: string }
export type Post = { id: number; userId: number; message: string; count?: number }
export type LoginResponse = { token: string; user: User }
