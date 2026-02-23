import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function run(label: string, query: string) {
  process.stdout.write(`  ${label}... `)
  try {
    await sql.query(query)
    console.log('✓')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('already exists')) {
      console.log('(already exists)')
    } else {
      console.log('✗ ' + msg)
      throw e
    }
  }
}

async function migrate() {
  console.log('\n🗄  Migratie naar Neon PostgreSQL\n')

  await run('enum checkpoint_type', `CREATE TYPE checkpoint_type AS ENUM('kennismaking', 'samenwerking', 'reflectie', 'actie', 'feest')`)
  await run('enum session_status', `CREATE TYPE session_status AS ENUM('draft', 'lobby', 'active', 'paused', 'completed', 'cancelled')`)
  await run('enum submission_status', `CREATE TYPE submission_status AS ENUM('pending', 'approved', 'rejected')`)
  await run('enum tour_variant', `CREATE TYPE tour_variant AS ENUM('wijktocht', 'impactsprint', 'familietocht', 'jeugdtocht', 'voetbalmissie')`)

  await run('table users', `
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text,
      email text NOT NULL UNIQUE,
      email_verified timestamp,
      image text,
      role text DEFAULT 'spelleider' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('table accounts', `
    CREATE TABLE IF NOT EXISTS accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      provider text NOT NULL,
      provider_account_id text NOT NULL,
      refresh_token text,
      access_token text,
      expires_at integer,
      token_type text,
      scope text,
      id_token text,
      session_state text
    )
  `)

  await run('table sessions', `
    CREATE TABLE IF NOT EXISTS sessions (
      session_token text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires timestamp NOT NULL
    )
  `)

  await run('table verification_tokens', `
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier text NOT NULL,
      token text NOT NULL,
      expires timestamp NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `)

  await run('table tours', `
    CREATE TABLE IF NOT EXISTS tours (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      variant tour_variant DEFAULT 'wijktocht' NOT NULL,
      created_by_id uuid REFERENCES users(id),
      is_published boolean DEFAULT false NOT NULL,
      estimated_duration_min integer DEFAULT 120,
      max_teams integer DEFAULT 20,
      ai_config jsonb,
      price_in_cents integer DEFAULT 0,
      stripe_product_id text,
      stripe_price_id text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('table checkpoints', `
    CREATE TABLE IF NOT EXISTS checkpoints (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      order_index integer NOT NULL,
      name text NOT NULL,
      description text,
      type checkpoint_type DEFAULT 'samenwerking' NOT NULL,
      latitude real NOT NULL,
      longitude real NOT NULL,
      unlock_radius_meters integer DEFAULT 50 NOT NULL,
      mission_title text NOT NULL,
      mission_description text NOT NULL,
      mission_type text DEFAULT 'opdracht' NOT NULL,
      gms_connection integer DEFAULT 0 NOT NULL,
      gms_meaning integer DEFAULT 0 NOT NULL,
      gms_joy integer DEFAULT 0 NOT NULL,
      gms_growth integer DEFAULT 0 NOT NULL,
      hint1 text,
      hint2 text,
      hint3 text,
      is_kids_friendly boolean DEFAULT true NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('index checkpoint_tour_order_idx', `CREATE INDEX IF NOT EXISTS checkpoint_tour_order_idx ON checkpoints(tour_id, order_index)`)

  await run('table game_sessions', `
    CREATE TABLE IF NOT EXISTS game_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tour_id uuid NOT NULL REFERENCES tours(id),
      spelleider_id uuid REFERENCES users(id),
      status session_status DEFAULT 'draft' NOT NULL,
      join_code text NOT NULL UNIQUE,
      scheduled_at timestamp,
      started_at timestamp,
      completed_at timestamp,
      variant tour_variant DEFAULT 'wijktocht' NOT NULL,
      geofence_polygon jsonb,
      stripe_session_id text,
      paid_at timestamp,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('table teams', `
    CREATE TABLE IF NOT EXISTS teams (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      game_session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      name text NOT NULL,
      team_token text NOT NULL UNIQUE,
      last_latitude real,
      last_longitude real,
      last_position_at timestamp,
      current_checkpoint_index integer DEFAULT 0 NOT NULL,
      completed_checkpoints jsonb DEFAULT '[]',
      total_gms_score integer DEFAULT 0 NOT NULL,
      bonus_points integer DEFAULT 0 NOT NULL,
      is_active boolean DEFAULT true NOT NULL,
      is_outside_geofence boolean DEFAULT false NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('index team_session_idx', `CREATE INDEX IF NOT EXISTS team_session_idx ON teams(game_session_id)`)
  await run('index team_token_idx', `CREATE INDEX IF NOT EXISTS team_token_idx ON teams(team_token)`)

  await run('table submissions', `
    CREATE TABLE IF NOT EXISTS submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      checkpoint_id uuid NOT NULL REFERENCES checkpoints(id),
      answer text,
      photo_url text,
      video_url text,
      status submission_status DEFAULT 'pending' NOT NULL,
      ai_score integer,
      ai_feedback text,
      ai_evaluation jsonb,
      gms_earned integer DEFAULT 0 NOT NULL,
      scheduled_delete_at timestamp,
      submitted_at timestamp DEFAULT now() NOT NULL
    )
  `)

  await run('index submission_team_checkpoint_idx', `CREATE INDEX IF NOT EXISTS submission_team_checkpoint_idx ON submissions(team_id, checkpoint_id)`)

  console.log('\n✅ Alle tabellen aangemaakt\n')
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
