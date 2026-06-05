import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { verifyPassword } from '../src/lib/auth/password'
dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL!)
const [user] = await sql`SELECT password FROM users WHERE email = 'admin@impacttocht.nl'`
const ok = verifyPassword('Demo2024!', user.password)
console.log('password ok:', ok)
process.exit(0)
