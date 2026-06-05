import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL!)
const rows = await sql`SELECT session_token, user_id, expires FROM sessions ORDER BY expires DESC LIMIT 5`
console.log('Sessions in DB:', rows)
process.exit(0)
