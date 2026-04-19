import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'ImpactTour <noreply@ictusgo.nl>'

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

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Inloggen bij ImpactTour',
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Inloggen ImpactTour</title>
        </head>
        <body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #00E676; margin: 0; font-size: 28px;">ImpactTour</h1>
              <p style="color: #6b7280; margin-top: 8px;">GPS Teambuilding met Sociale Impact</p>
            </div>

            <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">Inloggen als spelleider</h2>
            <p style="color: #374151; line-height: 1.6;">
              Klik op de knop hieronder om in te loggen. De link is 24 uur geldig.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${url}"
                 style="background: #00E676; color: #0F172A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                Inloggen bij ImpactTour
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              Als je niet om een inloglink hebt gevraagd, kun je deze e-mail negeren.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} TeambuildingMetImpact.nl
            </p>
          </div>
        </body>
        </html>
      `,
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
  const credentialsBlock = `
    <div style="background: #0F172A; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #94A3B8; font-weight: 600; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Jouw inloggegevens</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #64748B; font-size: 12px; padding: 6px 0; width: 90px;">E-mail</td>
          <td style="color: #F1F5F9; font-size: 14px; font-weight: 600;">${accountEmail}</td>
        </tr>
        ${credentials ? `
        <tr>
          <td style="color: #64748B; font-size: 12px; padding: 6px 0;">Wachtwoord</td>
          <td style="color: #00E676; font-size: 16px; font-weight: 800; letter-spacing: 1px;">${credentials.password}</td>
        </tr>` : ''}
      </table>
      <p style="margin: 12px 0 0; color: #475569; font-size: 11px;">
        ${credentials
          ? `Bewaar dit goed — je kunt hiermee altijd opnieuw inloggen op <a href="${loginUrl || '#'}" style="color: #00E676; text-decoration: none;">${loginUrl || 'de loginpagina'}</a>`
          : `Je hebt al een account. Log in op <a href="${loginUrl || '#'}" style="color: #00E676; text-decoration: none;">${loginUrl || 'de loginpagina'}</a> met je bestaande wachtwoord, of gebruik de knop hierboven.`
        }
      </p>
    </div>
  `

  await withEmailRetry(async () => {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: isPaid
        ? `Betaling ontvangen — ${tourName} staat klaar`
        : `Tocht gereserveerd — ${tourName}`,
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: system-ui, sans-serif; background: #f0fdf4; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

            <div style="background: #0F172A; padding: 32px; text-align: center;">
              <div style="display: inline-block; background: #00E676; border-radius: 12px; padding: 10px 20px; margin-bottom: 16px;">
                <span style="color: #0F172A; font-weight: 800; font-size: 18px; letter-spacing: 1px;">IMPACTTOUR</span>
              </div>
              <p style="color: #94A3B8; margin: 0; font-size: 13px;">GPS Teambuilding met Sociale Impact</p>
            </div>

            <div style="padding: 32px;">
              <h2 style="color: #0F172A; font-size: 22px; margin: 0 0 8px;">
                ${isPaid ? 'Betaling ontvangen' : 'Tocht gereserveerd'}
              </h2>
              <p style="color: #64748B; margin: 0 0 24px; line-height: 1.6;">
                Hoi ${customerName}, je tocht <strong style="color: #0F172A;">${tourName}</strong> staat klaar om in te stellen.
                ${isPaid && amountFormatted ? `Je betaling van <strong>${amountFormatted}</strong> is bevestigd.` : ''}
              </p>

              ${credentialsBlock}

              <div style="text-align: center; margin: 28px 0;">
                <a href="${setupUrl}"
                   style="background: #00E676; color: #0F172A; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; letter-spacing: 0.5px;">
                  → Tocht nu inrichten
                </a>
                <p style="margin: 10px 0 0; color: #94A3B8; font-size: 12px;">Eenmalige directe link · 24 uur geldig</p>
              </div>

              <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #166534; font-weight: 600; font-size: 13px;">WAT KUN JE INSTELLEN:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li>Sessienaam en welkomstbericht</li>
                  <li>Teams aanmaken en uitnodigingen sturen</li>
                  <li>Datum en starttijd bevestigen</li>
                  <li>Live monitoring op de dag zelf</li>
                </ul>
              </div>

              <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 0;">
                Heb je vragen? Mail naar <a href="mailto:info@weareimpact.nl" style="color: #00C853;">info@weareimpact.nl</a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 0;">
            <div style="padding: 16px 32px; text-align: center;">
              <p style="color: #CBD5E1; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} TeambuildingMetImpact.nl · weareimpact.nl
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
      subject: `Jullie tocht is afgerond — bekijk het impactrapport`,
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: system-ui, sans-serif; background: #f0fdf4; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

            <div style="background: #0F172A; padding: 32px; text-align: center;">
              <div style="display: inline-block; background: #00E676; border-radius: 12px; padding: 10px 20px; margin-bottom: 16px;">
                <span style="color: #0F172A; font-weight: 800; font-size: 18px; letter-spacing: 1px;">IMPACTTOUR</span>
              </div>
              <p style="color: #94A3B8; margin: 0; font-size: 13px;">GPS Teambuilding met Sociale Impact</p>
            </div>

            <div style="background: linear-gradient(135deg, #00E676 0%, #00C853 100%); padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 28px;">🏆</p>
              <p style="margin: 6px 0 0; color: #0F172A; font-weight: 800; font-size: 18px;">Tocht voltooid!</p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #374151; margin: 0 0 16px; line-height: 1.6;">
                Hoi ${organizerName}, <strong>${displayName}</strong> is afgerond.
                Het impactrapport staat klaar — inclusief GMS-scores, dimensie-analyse en persoonlijk Coach Inzicht per team.
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${resultsUrl}"
                   style="background: #00E676; color: #0F172A; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; letter-spacing: 0.5px;">
                  → Bekijk het impactrapport
                </a>
              </div>

              <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                <p style="margin: 0 0 10px; color: #166534; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">In het rapport:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
                  <li>Geluksmomenten Score (GMS) per team</li>
                  <li>Dimensie-analyse: verbinding, betekenis, plezier, groei</li>
                  <li>Persoonlijk Coach Inzicht per team</li>
                  <li>PDF downloaden voor intern gebruik</li>
                </ul>
              </div>

              <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 0 0 24px;">

              <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 20px;">⭐️⭐️⭐️⭐️⭐️</p>
                <p style="margin: 0 0 10px; color: #92400E; font-weight: 700; font-size: 14px;">Was het een goede ervaring?</p>
                <p style="margin: 0 0 16px; color: #92400E; font-size: 13px; line-height: 1.6;">
                  Andere organisatoren zoeken naar eerlijke reviews. Een minuutje van jouw tijd helpt ons enorm.
                </p>
                <a href="${reviewUrl}"
                   style="background: #F59E0B; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
                  Schrijf een Google Review
                </a>
              </div>

              <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
                Vragen of feedback? Mail naar <a href="mailto:info@weareimpact.nl" style="color: #00C853;">info@weareimpact.nl</a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 0;">
            <div style="padding: 16px 32px; text-align: center;">
              <p style="color: #CBD5E1; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} TeambuildingMetImpact.nl · weareimpact.nl
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
      subject: `Jullie tocht begint: ${tourName}`,
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
            <h1 style="color: #00E676;">${tourName}</h1>
            <p>Team <strong>${teamName}</strong>, jullie tocht staat klaar!</p>

            <div style="background: #f0fdf4; border: 2px solid #00E676; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; color: #374151; font-size: 14px;">Jullie teamcode:</p>
              <p style="font-size: 36px; font-weight: 800; color: #00E676; letter-spacing: 6px; margin: 8px 0;">${joinCode}</p>
            </div>

            <div style="text-align: center;">
              <a href="${joinUrl}" style="background: #00E676; color: #0F172A; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">
                Start de tocht
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    if (error) throw error
  }, 'session-invite')
}
