import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postcode = searchParams.get('q')?.replace(/\s/g, '').toUpperCase()

  if (!postcode || !/^\d{4}[A-Z]{2}$/.test(postcode)) {
    return NextResponse.json({ error: 'Ongeldige postcode' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode}&rows=1&fl=woonplaatsnaam`,
      { next: { revalidate: 86400 } } // cache 24u
    )
    const json = await res.json()
    const city: string = json?.response?.docs?.[0]?.woonplaatsnaam ?? ''
    if (!city) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json({ city })
  } catch {
    return NextResponse.json({ error: 'Lookup mislukt' }, { status: 502 })
  }
}
