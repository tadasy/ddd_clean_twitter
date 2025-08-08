import { SignJWT, jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret')

export async function signToken(payload: { sub: string | number; email: string }, expiresIn = '7d') {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + parseExpiry(expiresIn)
  return await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}

function parseExpiry(exp: string): number {
  const m = /^([0-9]+)([smhd])$/.exec(exp)
  if (!m) return 60 * 60 * 24 * 7
  const n = Number(m[1])
  const unit = m[2]
  switch (unit) {
    case 's':
      return n
    case 'm':
      return n * 60
    case 'h':
      return n * 60 * 60
    case 'd':
      return n * 60 * 60 * 24
    default:
      return 60 * 60 * 24 * 7
  }
}
