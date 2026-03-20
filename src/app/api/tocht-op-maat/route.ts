import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tochtAanvragen } from '@/lib/db/schema'

export const maxDuration = 30

interface TochtMissie {
  number: number
  title: string
  location: string
  description: string
  type: 'actie' | 'quiz' | 'creatief' | 'sociaal' | 'impact'
  points: number
}

interface GeneratedTocht {
  title: string
  tagline: string
  description: string
  gms_prediction: number
  difficulty: 'Makkelijk' | 'Middel' | 'Uitdagend'
  highlights: string[]
  missions: TochtMissie[]
  impact_moment: string
  tips: string[]
}

export async function POST(req: Request) {
  const body = await req.json()
  const { group, vibe, duration, city, participants, extra } = body as {
    group?: string
    vibe?: string
    duration?: string
    city?: string
    participants?: string
    extra?: string
  }

  if (!group || !vibe || !duration || !city || !participants) {
    return NextResponse.json(
      { error: 'Verplichte velden ontbreken: group, vibe, duration, city, participants' },
      { status: 400 }
    )
  }

  const duurMinuten = parseInt(duration, 10)
  const deelnemers = parseInt(participants, 10)

  if (isNaN(duurMinuten) || isNaN(deelnemers)) {
    return NextResponse.json(
      { error: 'duration en participants moeten geldige getallen zijn' },
      { status: 400 }
    )
  }

  const groepLabels: Record<string, string> = {
    bedrijf: 'zakelijk team / bedrijf',
    vriendengroep: 'vriendengroep',
    stel: 'romantisch koppel',
    familie: 'gezin met kinderen',
    sportclub: 'sportteam / vereniging',
    school: 'schoolklas / educatieve groep',
  }

  const sfeerLabels: Record<string, string> = {
    fun: 'luchtig en speels, veel lachen',
    actie: 'uitdagend en avontuurlijk',
    liefde: 'romantisch en verbindend',
    impact: 'maatschappelijk bewust en betekenisvol',
    cultuur: 'cultureel verrijkend en historisch',
    sportief: 'fysiek actief en competitief',
  }

  const systemPrompt = `Je bent een expert tocht-ontwerper voor IctusGo GPS teambuilding.
Genereer een maatwerk GPS-tocht op basis van de opgegeven parameters.

Geef precies 5 missies terug, elk op een andere locatie in de genoemde stad.
Antwoord UITSLUITEND in dit JSON formaat:
{
  "title": "pakkende tochtnaam",
  "tagline": "korte tagline van max 10 woorden",
  "description": "beschrijving van 2-3 zinnen over de tocht",
  "gms_prediction": 0-100,
  "difficulty": "Makkelijk|Middel|Uitdagend",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "missions": [
    {
      "number": 1,
      "title": "missienaam",
      "location": "specifieke locatie in de stad",
      "description": "beschrijving van de opdracht in 2-3 zinnen",
      "type": "actie|quiz|creatief|sociaal|impact",
      "points": 100
    }
  ],
  "impact_moment": "omschrijving van het meest impactvolle moment",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
Taal: Nederlands. Wees creatief en specifiek voor de genoemde stad.`

  const userPrompt = `Groepstype: ${groepLabels[group] ?? group}
Sfeer/thema: ${sfeerLabels[vibe] ?? vibe}
Duur: ${duurMinuten} minuten
Stad: ${city}
Deelnemers: ${deelnemers} personen
${extra ? `Extra wensen: ${extra}` : ''}`

  let result: GeneratedTocht
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://ictusgo.nl',
        'X-Title': 'IctusGo',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_DEFAULT_MODEL ?? 'anthropic/claude-sonnet-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    if (!orRes.ok) {
      const errText = await orRes.text()
      console.error('[tocht-op-maat] OpenRouter fout:', orRes.status, errText)
      return NextResponse.json(
        { error: 'De AI kon geen tocht genereren. Probeer het opnieuw.', _debug: `${orRes.status}: ${errText}` },
        { status: 503 }
      )
    }

    const orJson = await orRes.json()
    const content: string = orJson.choices?.[0]?.message?.content ?? '{}'
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = match ? match[1].trim() : content.trim()
    result = JSON.parse(jsonStr) as GeneratedTocht
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[tocht-op-maat] Fetch fout:', msg)
    return NextResponse.json(
      { error: 'De AI kon geen tocht genereren. Probeer het opnieuw.', _debug: msg },
      { status: 503 }
    )
  }

  // Log aanvraag naar database
  try {
    await db.insert(tochtAanvragen).values({
      groepType: group,
      sfeer: vibe,
      stad: city,
      deelnemers,
      duurMinuten,
      extraWensen: extra || null,
      gegenereerdeJson: result as unknown as Record<string, unknown>,
    })
  } catch {
    // Logging mag de response niet blokkeren
    console.error('Fout bij opslaan tocht aanvraag in database')
  }

  return NextResponse.json(result, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
