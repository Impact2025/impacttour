import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const allowed = await checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000) // 3 per uur
  if (!allowed) {
    return NextResponse.json({ error: 'Te veel berichten. Probeer het later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  const { name, email, organization, message, variant } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Naam, e-mail en bericht zijn verplicht' }, { status: 400 })
  }

  // Eenvoudige e-mail validatie
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
  }

  try {
    // Lazy import om build-time problemen te vermijden
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const to = process.env.CONTACT_EMAIL || process.env.GMAIL_USER || 'info@teambuildingmetimpact.nl'

    await transporter.sendMail({
      from: `IctusGo Contact <${process.env.GMAIL_USER || 'weareimpactnl@gmail.com'}>`,
      to,
      replyTo: `${name} <${email}>`,
      subject: `[IctusGo Contact] ${name}${variant ? ` · ${variant}` : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0F172A; margin-bottom: 4px;">Nieuw contactbericht</h2>
          <p style="color: #64748B; font-size: 12px; margin-bottom: 24px;">Via IctusGo contactformulier</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; width: 120px;">Naam</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px;">E-mail</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><a href="mailto:${email}" style="color: #00C853;">${email}</a></td>
            </tr>
            ${organization ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px;">Organisatie</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px;">${organization}</td>
            </tr>` : ''}
            ${variant ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px;">Interesse in</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px;">${variant}</td>
            </tr>` : ''}
          </table>

          <div style="background: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Bericht</p>
            <p style="color: #0F172A; font-size: 14px; line-height: 1.7; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <p style="color: #94A3B8; font-size: 11px;">
            Ontvangen op ${new Date().toLocaleString('nl-NL')} · IP: ${ip}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] mail error:', err)
    return NextResponse.json({ error: 'Versturen mislukt. Probeer het later.' }, { status: 500 })
  }
}
