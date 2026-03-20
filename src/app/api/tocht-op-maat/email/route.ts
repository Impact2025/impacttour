import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const FROM = `IctusGo <${process.env.GMAIL_USER || 'weareimpactnl@gmail.com'}>`
const TEAM_EMAIL = process.env.GMAIL_USER || 'weareimpactnl@gmail.com'

interface TochtMissie {
  number: number
  title: string
  location: string
  description: string
  type: string
  points: number
}

interface GeneratedTocht {
  title: string
  tagline: string
  description: string
  gms_prediction: number
  difficulty: string
  highlights: string[]
  missions: TochtMissie[]
  impact_moment: string
  tips: string[]
}

interface WizardData {
  group: string
  vibe: string
  duration: string
  city: string
  participants: string
}

export async function POST(req: Request) {
  const body = await req.json() as { email: string; tocht: GeneratedTocht; wizardData: WizardData }
  const { email, tocht, wizardData } = body

  if (!email || !tocht) {
    return NextResponse.json({ error: 'email en tocht zijn verplicht' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
  }

  const missiesHtml = (tocht.missions ?? []).map((m) => `
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div style="background: #0F172A; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; text-align: center; line-height: 24px;">
          ${m.number}
        </div>
        <span style="font-weight: 700; color: #0F172A; font-size: 14px;">${m.title}</span>
        <span style="margin-left: auto; color: #00C853; font-weight: 800; font-size: 12px; white-space: nowrap;">+${m.points}pt</span>
      </div>
      <p style="margin: 0 0 6px; color: #64748B; font-size: 12px;">📍 ${m.location}</p>
      <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.5;">${m.description}</p>
    </div>
  `).join('')

  const highlightsHtml = (tocht.highlights ?? []).map((h) => `
    <li style="color: #374151; font-size: 14px; padding: 4px 0;">✓ ${h}</li>
  `).join('')

  const userHtml = `
    <!DOCTYPE html>
    <html lang="nl">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: system-ui, sans-serif; background: #F0FDF4; margin: 0; padding: 20px;">
      <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background: #0F172A; padding: 32px; text-align: center;">
          <div style="display: inline-block; background: #00E676; border-radius: 10px; padding: 8px 18px; margin-bottom: 14px;">
            <span style="color: #0F172A; font-weight: 800; font-size: 17px; letter-spacing: 1px;">ICTUSGO</span>
          </div>
          <p style="color: #94A3B8; margin: 0; font-size: 13px;">GPS Teambuilding met Sociale Impact</p>
        </div>

        <!-- Tocht header -->
        <div style="background: #0F172A; border-top: 3px solid #00E676; padding: 24px 32px; margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <div>
              <h1 style="color: white; font-size: 22px; font-weight: 900; margin: 0 0 6px;">${tocht.title}</h1>
              <p style="color: #00E676; font-size: 14px; margin: 0;">${tocht.tagline}</p>
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: 32px; font-weight: 900; color: #00E676; line-height: 1;">${tocht.gms_prediction}</div>
              <div style="color: #64748B; font-size: 11px;">GMS score</div>
            </div>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 12px 0 0;">${tocht.description}</p>
          <span style="display: inline-block; margin-top: 10px; background: rgba(255,255,255,0.1); color: #CBD5E1; font-size: 11px; padding: 4px 10px; border-radius: 20px;">${tocht.difficulty}</span>
        </div>

        <!-- Content -->
        <div style="padding: 28px 32px;">

          ${tocht.highlights?.length ? `
          <h3 style="color: #0F172A; font-size: 15px; font-weight: 700; margin: 0 0 12px;">Hoogtepunten</h3>
          <ul style="margin: 0 0 24px; padding-left: 0; list-style: none;">
            ${highlightsHtml}
          </ul>
          ` : ''}

          <h3 style="color: #0F172A; font-size: 15px; font-weight: 700; margin: 0 0 12px;">Jullie ${tocht.missions?.length ?? 5} missies</h3>
          ${missiesHtml}

          ${tocht.impact_moment ? `
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px; color: #166534; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Impact moment</p>
            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">${tocht.impact_moment}</p>
          </div>
          ` : ''}

          <!-- CTA -->
          <div style="background: #0F172A; border-radius: 12px; padding: 24px; text-align: center; margin-top: 24px;">
            <p style="color: #94A3B8; font-size: 13px; margin: 0 0 16px;">Klaar om dit concept te boeken of verder uit te werken?</p>
            <a href="https://www.ictusgo.nl/contact"
               style="background: #00E676; color: #0F172A; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 15px; display: inline-block;">
              Plan een gratis gesprek →
            </a>
            <p style="color: #475569; font-size: 11px; margin: 12px 0 0;">Of bekijk bestaande tochten op <a href="https://www.ictusgo.nl/tochten" style="color: #00E676; text-decoration: none;">ictusgo.nl/tochten</a></p>
          </div>

        </div>

        <div style="border-top: 1px solid #F1F5F9; padding: 16px 32px; text-align: center;">
          <p style="color: #CBD5E1; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} TeambuildingMetImpact.nl · <a href="https://www.ictusgo.nl" style="color: #CBD5E1;">ictusgo.nl</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const leadHtml = `
    <!DOCTYPE html>
    <html lang="nl">
    <body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 28px;">
        <h2 style="color: #0F172A; margin: 0 0 4px;">🎯 Nieuwe Tocht op Maat aanvraag</h2>
        <p style="color: #64748B; font-size: 13px; margin: 0 0 20px;">Iemand heeft het concept per email ontvangen — dit is een warme lead.</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="color: #94A3B8; padding: 6px 0; width: 120px;">E-mail</td><td style="color: #0F172A; font-weight: 700;"><a href="mailto:${email}" style="color: #00C853;">${email}</a></td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Groeptype</td><td style="color: #0F172A;">${wizardData?.group ?? '-'}</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Sfeer</td><td style="color: #0F172A;">${wizardData?.vibe ?? '-'}</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Stad</td><td style="color: #0F172A;">${wizardData?.city ?? '-'}</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Deelnemers</td><td style="color: #0F172A;">${wizardData?.participants ?? '-'}</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Duur</td><td style="color: #0F172A;">${wizardData?.duration ?? '-'} min</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">Tochtnaam</td><td style="color: #0F172A; font-weight: 700;">${tocht.title}</td></tr>
          <tr><td style="color: #94A3B8; padding: 6px 0;">GMS score</td><td style="color: #00C853; font-weight: 700;">${tocht.gms_prediction}</td></tr>
        </table>

        <div style="margin-top: 20px; padding: 14px; background: #F0FDF4; border-radius: 8px;">
          <a href="mailto:${email}?subject=Jouw IctusGo tocht: ${encodeURIComponent(tocht.title)}"
             style="color: #0F172A; background: #00E676; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
            Reageer op deze lead →
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  const transporter = getTransporter()

  await Promise.all([
    transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Jouw IctusGo concept: ${tocht.title}`,
      html: userHtml,
    }),
    transporter.sendMail({
      from: FROM,
      to: TEAM_EMAIL,
      subject: `🎯 Lead: Tocht op Maat — ${tocht.title} (${wizardData?.city ?? ''})`,
      html: leadHtml,
    }),
  ])

  return NextResponse.json({ ok: true })
}
