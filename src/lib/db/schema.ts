import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  real,
  pgEnum,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tourVariantEnum = pgEnum('tour_variant', [
  'wijktocht',
  'impactsprint',
  'familietocht',
  'jeugdtocht',
  'voetbalmissie', // Voetbal-thema JeugdTocht voor 9-12 jaar
])

export const sessionStatusEnum = pgEnum('session_status', [
  'draft',
  'lobby',
  'active',
  'paused',
  'completed',
  'cancelled',
])

export const checkpointTypeEnum = pgEnum('checkpoint_type', [
  'kennismaking',
  'samenwerking',
  'reflectie',
  'actie',
  'feest',
])

export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'approved',
  'rejected',
])

// ─── NextAuth tabellen (vereist voor Drizzle Adapter) ─────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  role: text('role').notNull().default('spelleider'), // 'spelleider' | 'admin'
  password: text('password'), // scrypt hash (salt:hash) — alleen voor marketplace klanten
  organizationName: text('organization_name'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  // Kolom-accessor namen in snake_case (vereist door @auth/drizzle-adapter)
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

// Sessions: sessionToken is primary key (vereist door @auth/drizzle-adapter)
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// VerificationTokens: samengestelde primary key (vereist door adapter)
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// ─── Tochten ──────────────────────────────────────────────────────────────────

export const tours = pgTable('tours', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  variant: tourVariantEnum('variant').notNull().default('wijktocht'),
  createdById: uuid('created_by_id').references(() => users.id),
  isPublished: boolean('is_published').notNull().default(false),
  estimatedDurationMin: integer('estimated_duration_min').default(120),
  maxTeams: integer('max_teams').default(20),
  // AI-gegenereerde config
  aiConfig: jsonb('ai_config'), // { difficulty, themes, targetGroup }
  // Verhaalframe (voor VoetbalMissie en andere thema-tochten)
  storyFrame: jsonb('story_frame'), // { introText: string, finaleReveal: string }
  // Prijs (Stripe)
  priceInCents: integer('price_in_cents').default(0),
  pricingModel: text('pricing_model').notNull().default('flat'), // 'flat' | 'per_person'
  pricePerPersonCents: integer('price_per_person_cents').notNull().default(0),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const checkpoints = pgTable(
  'checkpoints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tours.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    type: checkpointTypeEnum('type').notNull().default('samenwerking'),
    // GPS
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    unlockRadiusMeters: integer('unlock_radius_meters').notNull().default(50),
    // Missie
    missionTitle: text('mission_title').notNull(),
    missionDescription: text('mission_description').notNull(),
    missionType: text('mission_type').notNull().default('opdracht'), // 'opdracht' | 'foto' | 'quiz' | 'video'
    // GMS dimensies (0-25 per dimensie)
    gmsConnection: integer('gms_connection').notNull().default(0),
    gmsMeaning: integer('gms_meaning').notNull().default(0),
    gmsJoy: integer('gms_joy').notNull().default(0),
    gmsGrowth: integer('gms_growth').notNull().default(0),
    // Hints
    hint1: text('hint1'),
    hint2: text('hint2'),
    hint3: text('hint3'),
    // Tijdsbeperking (optioneel, bijv. 480 = 8 minuten voor klus-opdrachten)
    timeLimitSeconds: integer('time_limit_seconds'),
    // Bonus punten bij foto-inzending (bijv. 50 voor teamfoto met onbekende)
    bonusPhotoPoints: integer('bonus_photo_points').notNull().default(0),
    // Kids specifiek
    isKidsFriendly: boolean('is_kids_friendly').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tourOrderIdx: index('checkpoint_tour_order_idx').on(
      table.tourId,
      table.orderIndex
    ),
  })
)

// ─── Marketplace: Coupons ─────────────────────────────────────────────────────

export const coupons = pgTable('coupons', {
  code: text('code').primaryKey(), // bijv. "GRATIS2024"
  discountType: text('discount_type').notNull().default('percent'), // 'percent' | 'fixed' | 'free'
  discountValue: integer('discount_value').notNull().default(0), // percent (0-100) of cents
  maxUses: integer('max_uses'), // null = onbeperkt
  usedCount: integer('used_count').notNull().default(0),
  expiresAt: timestamp('expires_at'),
  tourId: uuid('tour_id').references(() => tours.id), // null = geldig voor alle tours
  description: text('description'), // intern label
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Marketplace: Bestellingen ────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  sessionId: uuid('session_id').references(() => gameSessions.id),
  tourId: uuid('tour_id')
    .notNull()
    .references(() => tours.id),
  couponCode: text('coupon_code').references(() => coupons.code),
  amountCents: integer('amount_cents').notNull().default(0), // te betalen bedrag
  originalAmountCents: integer('original_amount_cents').notNull().default(0),
  participantCount: integer('participant_count'),
  status: text('status').notNull().default('pending'), // 'pending' | 'paid' | 'free' | 'refunded'
  mspOrderId: text('msp_order_id'), // MultiSafepay order ID
  paidAt: timestamp('paid_at'),
  organizationName: text('organization_name'),
  customerName: text('customer_name'),
  customerEmail: text('customer_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Game Sessies ─────────────────────────────────────────────────────────────

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tourId: uuid('tour_id')
    .notNull()
    .references(() => tours.id),
  spelleIderId: uuid('spelleider_id').references(() => users.id),
  status: sessionStatusEnum('status').notNull().default('draft'),
  joinCode: text('join_code').notNull().unique(), // 6-cijferige code
  // Timing
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  // Config voor deze sessie
  variant: tourVariantEnum('variant').notNull().default('wijktocht'),
  // Geofence polygoon (voor JeugdTocht)
  geofencePolygon: jsonb('geofence_polygon'), // Array van {lat, lng} punten
  // Klant aanpassing
  customSessionName: text('custom_session_name'), // bijv. "Teamdag Acme BV"
  welcomeMessage: text('welcome_message'),
  organizationName: text('organization_name'),
  // Stripe Checkout sessie ID (spelleider directe boeking)
  stripeSessionId: text('stripe_session_id'),
  // MultiSafepay order ID (marketplace boeking)
  mspOrderId: text('msp_order_id'),
  paidAt: timestamp('paid_at'),
  // Herkomst
  source: text('source').notNull().default('direct'), // 'direct' | 'marketplace'
  // Test mode: GPS-check overslaan (spelleider kan testen zonder te lopen)
  isTestMode: boolean('is_test_mode').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameSessionId: uuid('game_session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // Auth token voor team (geen individuele namen opslaan bij kids!)
    teamToken: text('team_token').notNull().unique(),
    // Huidige positie (GPS)
    lastLatitude: real('last_latitude'),
    lastLongitude: real('last_longitude'),
    lastPositionAt: timestamp('last_position_at'),
    // Voortgang
    currentCheckpointIndex: integer('current_checkpoint_index')
      .notNull()
      .default(0),
    completedCheckpoints: jsonb('completed_checkpoints').default('[]'), // array van checkpoint ids
    // Score
    totalGmsScore: integer('total_gms_score').notNull().default(0),
    bonusPoints: integer('bonus_points').notNull().default(0),
    // Status
    isActive: boolean('is_active').notNull().default(true),
    isOutsideGeofence: boolean('is_outside_geofence').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index('team_session_idx').on(table.gameSessionId),
    tokenIdx: index('team_token_idx').on(table.teamToken),
  })
)

// ─── Missie Inzendingen ───────────────────────────────────────────────────────

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    checkpointId: uuid('checkpoint_id')
      .notNull()
      .references(() => checkpoints.id),
    // Inzending
    answer: text('answer'),
    photoUrl: text('photo_url'), // Vercel Blob URL
    videoUrl: text('video_url'),
    // AI evaluatie
    status: submissionStatusEnum('status').notNull().default('pending'),
    aiScore: integer('ai_score'), // 0-100
    aiFeedback: text('ai_feedback'),
    aiEvaluation: jsonb('ai_evaluation'), // { connection, meaning, joy, growth, reasoning }
    // GMS punten verdiend
    gmsEarned: integer('gms_earned').notNull().default(0),
    // Kids foto cleanup
    scheduledDeleteAt: timestamp('scheduled_delete_at'),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  },
  (table) => ({
    teamCheckpointIdx: index('submission_team_checkpoint_idx').on(
      table.teamId,
      table.checkpointId
    ),
  })
)

// ─── Session Scores (gedenormaliseerde GMS aggregatie per team per sessie) ────
// Wordt incrementeel bijgewerkt bij elke submission — vervangt live aggregatie in rapport.

export const sessionScores = pgTable(
  'session_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    // Cumulatieve GMS per dimensie (opgeteld over alle inzendingen)
    connection: integer('connection').notNull().default(0),
    meaning: integer('meaning').notNull().default(0),
    joy: integer('joy').notNull().default(0),
    growth: integer('growth').notNull().default(0),
    totalGms: integer('total_gms').notNull().default(0),
    checkpointsCount: integer('checkpoints_count').notNull().default(0),
    // Per-checkpoint breakdown voor de grafiek [{name, gmsEarned, orderIndex}]
    checkpointScores: jsonb('checkpoint_scores').notNull().default('[]'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionTeamUniq: index('session_scores_session_team_idx').on(
      table.sessionId,
      table.teamId
    ),
  })
)

// ─── Webhook Events (audit log voor externe betalings-webhooks) ───────────────

export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(), // 'multisafepay' | 'stripe'
    eventId: text('event_id').notNull(), // transactionId / MSP order ID
    rawPayload: jsonb('raw_payload'), // volledige MSP response voor audit
    status: text('status').notNull().default('pending'), // 'pending' | 'processed' | 'failed' | 'duplicate'
    errorMessage: text('error_message'),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    providerEventIdx: index('webhook_event_provider_event_idx').on(
      table.provider,
      table.eventId
    ),
  })
)

// ─── Relations ────────────────────────────────────────────────────────────────

export const toursRelations = relations(tours, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tours.createdById],
    references: [users.id],
  }),
  checkpoints: many(checkpoints),
  gameSessions: many(gameSessions),
}))

export const checkpointsRelations = relations(checkpoints, ({ one, many }) => ({
  tour: one(tours, {
    fields: [checkpoints.tourId],
    references: [tours.id],
  }),
  submissions: many(submissions),
}))

export const gameSessionsRelations = relations(
  gameSessions,
  ({ one, many }) => ({
    tour: one(tours, {
      fields: [gameSessions.tourId],
      references: [tours.id],
    }),
    spelleider: one(users, {
      fields: [gameSessions.spelleIderId],
      references: [users.id],
    }),
    teams: many(teams),
  })
)

export const teamsRelations = relations(teams, ({ one, many }) => ({
  gameSession: one(gameSessions, {
    fields: [teams.gameSessionId],
    references: [gameSessions.id],
  }),
  submissions: many(submissions),
}))

export const submissionsRelations = relations(submissions, ({ one }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  checkpoint: one(checkpoints, {
    fields: [submissions.checkpointId],
    references: [checkpoints.id],
  }),
}))

export const sessionScoresRelations = relations(sessionScores, ({ one }) => ({
  session: one(gameSessions, {
    fields: [sessionScores.sessionId],
    references: [gameSessions.id],
  }),
  team: one(teams, {
    fields: [sessionScores.teamId],
    references: [teams.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  tours: many(tours),
  gameSessions: many(gameSessions),
  orders: many(orders),
}))

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  tour: one(tours, {
    fields: [coupons.tourId],
    references: [tours.id],
  }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  session: one(gameSessions, {
    fields: [orders.sessionId],
    references: [gameSessions.id],
  }),
  tour: one(tours, {
    fields: [orders.tourId],
    references: [tours.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponCode],
    references: [coupons.code],
  }),
}))
