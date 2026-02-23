/**
 * Wachtwoord hashing + verificatie via Node's ingebouwde crypto.scrypt
 * Geen externe dependencies nodig.
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

const KEYLEN = 64

/** Hash een plain-text wachtwoord → "salt:hash" string */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEYLEN).toString('hex')
  return `${salt}:${hash}`
}

/** Verifieer plain-text wachtwoord tegen opgeslagen "salt:hash" */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(':')
  if (!salt || !storedHash) return false
  try {
    const storedBuf = Buffer.from(storedHash, 'hex')
    const testBuf = scryptSync(password, salt, KEYLEN)
    return timingSafeEqual(storedBuf, testBuf)
  } catch {
    return false
  }
}

/** Genereer een leesbaar willekeurig wachtwoord (bijv. "Groen-847-Blauw") */
export function generatePassword(): string {
  const woorden = ['Groen', 'Blauw', 'Rood', 'Goud', 'Zwart', 'Wit', 'Oranje', 'Paars']
  const w1 = woorden[Math.floor(Math.random() * woorden.length)]
  const w2 = woorden[Math.floor(Math.random() * woorden.length)]
  const num = Math.floor(100 + Math.random() * 900)
  return `${w1}-${num}-${w2}`
}
