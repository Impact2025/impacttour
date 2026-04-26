import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'IctusGo <hello@ictusgo.nl>'

async function withEmailRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < 3) {
        console.warn(`[email] ${label} poging ${attempt} mislukt, opnieuw over ${2 ** (attempt - 1)}s`, err)
        await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 1000))
      }
    }
  }
  console.error(`[email] ${label} definitief mislukt na 3 pogingen`, lastError)
  throw lastError
}

function shell(content: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #F1F5F9; margin: 0; padding: 48px 16px;">
  <div style="max-width: 580px; margin: 0 auto;">

    <div style="background: #ffffff; border-top: 3px solid #00E676; border-radius: 8px 8px 0 0; padding: 24px 40px;">
      <table style="width: 100%; border-collapse: collapse;"><tr>
        <td><span style="font-size: 17px; font-weight: 800; color: #0F172A; letter-spacing: 0.5px;">ICTUS</span><span style="font-size: 17px; font-weight: 800; color: #00E676; letter-spacing: 0.5px;">GO</span></td>
        <td style="text-align: right;"><span style="font-size: 11px; color: #94A3B8; letter-spacing: 0.5px; text-transform: uppercase;">GPS Teambuilding</span></td>
      </tr></table>
    </div>

    <div style="height: 1px; background: #E2E8F0;"></div>

    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px;">
      ${content}
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
        <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.8;">
          Vragen? Mail naar <a href="mailto:info@weareimpact.nl" style="color: #0F172A; text-decoration: none; font-weight: 600;">info@weareimpact.nl</a><br>
          &copy; ${year} IctusGo &middot; <a href="https://ictusgo.nl" style="color: #94A3B8; text-decoration: none;">ictusgo.nl</a>
        </p>
      </div>
    </div>

  </div>
</body>
</html>`
}

function cta(href: string, label: string): string {
  return `<table style="margin: 32px auto; border-collapse: collapse;"><tr>
    <td style="background: #0F172A; border-radius: 6px;">
      <a href="${href}" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;">${label}</a>
    </td>
  </tr></table>`
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `<table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 6px; margin: 24px 0;">
    ${rows.map((r, i) => `<tr>
      <td style="padding: 11px 16px; color: #64748B; font-size: 13px; white-space: nowrap; width: 1%; ${i > 0 ? 'border-top: 1px solid #E2E8F0;' : ''}">${r.label}</td>
      <td style="padding: 11px 16px; color: #0F172A; font-size: 14px; font-weight: 600; ${i > 0 ? 'border-top: 1px solid #E2E8F0;' : ''}">${r.value}</td>
    </tr>`).join('')}
  </table>`
}

function list(items: string[]): string {
  return `<ul style="margin: 16px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
    ${items.map(i => `<li>${i}</li>`).join('')}
  </ul>`
}

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Inloggen bij IctusGo',
      html: shell(`
        <h2 style="margin: 0 0 8px; color: #0F172A; font-size: 22px; font-weight: 700;">Inloggen</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
          Klik op de knop hieronder om in te loggen bij IctusGo. De link is 24 uur geldig.
        </p>
        ${cta(url, 'Inloggen bij IctusGo')}
        <p style="margin: 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
          Heb je dit niet aangevraagd? Je kunt deze e-mail negeren.
        </p>
      `),
    })
    if (error) throw error
  }, 'magic-link')
}

export async function sendBookingConfirmationEmail({
  to,
  customerName,
  tourName,
  setupUrl,
  loginUrl,
  isPaid,
  amountFormatted,
  accountEmail,
  credentials,
}: {
  to: string
  customerName: string
  tourName: string
  setupUrl: string
  loginUrl?: string
  isPaid: boolean
  amountFormatted?: string
  accountEmail: string
  credentials?: { email: string; password: string }
}) {
  const infoRows: { label: string; value: string }[] = [
    { label: 'Tocht', value: tourName },
    { label: 'Account', value: accountEmail },
  ]
  if (isPaid && amountFormatted) {
    infoRows.push({ label: 'Betaling', value: amountFormatted })
  }
  if (credentials) {
    infoRows.push({ label: 'Wachtwoord', value: credentials.password })
  }

  const loginNote = credentials
    ? `Bewaar je wachtwoord goed. Je kunt altijd opnieuw inloggen op <a href="${loginUrl || '#'}" style="color: #0F172A; font-weight: 600; text-decoration: none;">de loginpagina</a>.`
    : `Je hebt al een account. Log opnieuw in via <a href="${loginUrl || '#'}" style="color: #0F172A; font-weight: 600; text-decoration: none;">de loginpagina</a>.`

  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: isPaid
        ? `Betaling ontvangen — ${tourName}`
        : `Tocht gereserveerd — ${tourName}`,
      html: shell(`
        <h2 style="margin: 0 0 8px; color: #0F172A; font-size: 22px; font-weight: 700;">
          ${isPaid ? 'Betaling ontvangen' : 'Tocht gereserveerd'}
        </h2>
        <p style="margin: 0 0 8px; color: #475569; font-size: 15px; line-height: 1.6;">
          Hoi ${customerName}, je tocht staat klaar om in te richten.
        </p>
        ${infoTable(infoRows)}
        <p style="margin: 0 0 24px; font-size: 13px; color: #64748B;">${loginNote}</p>
        ${cta(setupUrl, 'Tocht inrichten')}
        <p style="margin: 0; font-size: 13px; color: #94A3B8;">Eenmalige directe link &middot; 24 uur geldig</p>
        <p style="margin: 20px 0 0; font-size: 13px; color: #64748B; line-height: 1.6;">
          Wat je kunt instellen: sessienaam, welkomstbericht, teams aanmaken en datum bevestigen.
        </p>
      `),
    })
    if (error) throw error
  }, 'booking-confirmation')
}

export async function sendDebriefingEmail({
  to,
  organizerName,
  tourName,
  sessionName,
  resultsUrl,
}: {
  to: string
  organizerName: string
  tourName: string
  sessionName?: string | null
  resultsUrl: string
}) {
  const reviewUrl = process.env.GOOGLE_REVIEWS_URL ?? 'https://g.page/r/review'
  const displayName = sessionName || tourName

  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: `Impactrapport beschikbaar — ${displayName}`,
      html: shell(`
        <h2 style="margin: 0 0 8px; color: #0F172A; font-size: 22px; font-weight: 700;">Tocht afgerond</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
          Hoi ${organizerName}, <strong style="color: #0F172A;">${displayName}</strong> is succesvol afgerond.
          Het impactrapport staat klaar.
        </p>
        ${cta(resultsUrl, 'Bekijk het impactrapport')}
        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">In het rapport</p>
        ${list([
          'Geluksmomenten Score (GMS) per team',
          'Dimensie-analyse: verbinding, betekenis, plezier, groei',
          'Coach Inzicht per team',
          'PDF download voor intern gebruik',
        ])}
        <div style="margin-top: 32px; padding: 20px; border: 1px solid #E2E8F0; border-radius: 6px;">
          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0F172A;">Was het een goede ervaring?</p>
          <p style="margin: 0 0 16px; font-size: 13px; color: #475569; line-height: 1.6;">
            Andere organisatoren zoeken naar eerlijke reviews. Een minuut van jouw tijd helpt ons enorm.
          </p>
          <a href="${reviewUrl}" style="font-size: 13px; font-weight: 600; color: #0F172A; text-decoration: underline;">Schrijf een Google Review</a>
        </div>
      `),
    })
    if (error) throw error
  }, 'debriefing-email')
}

export async function sendSessionInviteEmail({
  to,
  teamName,
  joinCode,
  tourName,
  joinUrl,
}: {
  to: string
  teamName: string
  joinCode: string
  tourName: string
  joinUrl: string
}) {
  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: `Jullie tocht staat klaar — ${tourName}`,
      html: shell(`
        <h2 style="margin: 0 0 8px; color: #0F172A; font-size: 22px; font-weight: 700;">${tourName}</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
          Team <strong style="color: #0F172A;">${teamName}</strong>, jullie tocht staat klaar. Gebruik de code hieronder om in te checken.
        </p>
        <div style="border: 1px solid #E2E8F0; border-radius: 6px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <p style="margin: 0 0 8px; font-size: 11px; color: #94A3B8; letter-spacing: 1px; text-transform: uppercase;">Teamcode</p>
          <p style="margin: 0; font-size: 40px; font-weight: 800; color: #0F172A; letter-spacing: 10px;">${joinCode}</p>
        </div>
        ${cta(joinUrl, 'Start de tocht')}
        <p style="margin: 0; font-size: 13px; color: #94A3B8;">
          Of open de app en voer de teamcode handmatig in.
        </p>
      `),
    })
    if (error) throw error
  }, 'session-invite')
}
