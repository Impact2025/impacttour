import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organisatieNaam, type, naam, email, plaats, verhaal } = body

    if (!organisatieNaam || !naam || !email || !verhaal) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const to = process.env.GMAIL_USER || 'weareimpactnl@gmail.com'

    await getTransporter().sendMail({
      from: `IctusGo <${process.env.GMAIL_USER || 'weareimpactnl@gmail.com'}>`,
      to,
      replyTo: email,
      subject: `Nieuwe locatiepartner aanmelding: ${organisatieNaam}`,
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head><meta charset="utf-8"></head>
        <body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: #0F172A; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
              <p style="color: #00E676; font-weight: 700; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px;">Nieuwe aanmelding</p>
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">${organisatieNaam}</h1>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748B; padding: 8px 0; width: 140px; vertical-align: top;">Type organisatie</td>
                <td style="color: #0F172A; font-weight: 600; padding: 8px 0;">${type || 'Niet opgegeven'}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 8px 0; border-top: 1px solid #F1F5F9; vertical-align: top;">Contactpersoon</td>
                <td style="color: #0F172A; font-weight: 600; padding: 8px 0; border-top: 1px solid #F1F5F9;">${naam}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 8px 0; border-top: 1px solid #F1F5F9; vertical-align: top;">E-mail</td>
                <td style="padding: 8px 0; border-top: 1px solid #F1F5F9;">
                  <a href="mailto:${email}" style="color: #00C853; font-weight: 600; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 8px 0; border-top: 1px solid #F1F5F9; vertical-align: top;">Plaats</td>
                <td style="color: #0F172A; font-weight: 600; padding: 8px 0; border-top: 1px solid #F1F5F9;">${plaats || 'Niet opgegeven'}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 8px 0; border-top: 1px solid #F1F5F9; vertical-align: top;">Verhaal</td>
                <td style="color: #0F172A; padding: 8px 0; border-top: 1px solid #F1F5F9; line-height: 1.6;">${verhaal}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: #F0FDF4; border-radius: 8px;">
              <p style="color: #16a34a; font-size: 13px; margin: 0;">Beantwoord deze e-mail om direct contact op te nemen met ${naam}.</p>
            </div>

            <p style="color: #94A3B8; font-size: 11px; text-align: center; margin-top: 24px;">
              © ${new Date().getFullYear()} IctusGo — TeambuildingMetImpact.nl
            </p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Aanmelding email error:', err)
    return NextResponse.json({ error: 'Verzenden mislukt' }, { status: 500 })
  }
}
