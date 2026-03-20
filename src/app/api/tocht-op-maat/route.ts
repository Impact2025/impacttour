import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tochtAanvragen } from '@/lib/db/schema'
import { aiCompleteJSON } from '@/lib/ai'

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

  let result: GeneratedTocht
  try {
    result = await aiCompleteJSON<GeneratedTocht>(
      [
        {
          role: 'system',
          content: `Je bent een expert tocht-ontwerper voor IctusGo GPS teambuilding.
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
Taal: Nederlands. Wees creatief en specifiek voor de genoemde stad.`,
        },
        {
          role: 'user',
          content: `Groepstype: ${groepLabels[group] ?? group}
Sfeer/thema: ${sfeerLabels[vibe] ?? vibe}
Duur: ${duurMinuten} minuten
Stad: ${city}
Deelnemers: ${deelnemers} personen
${extra ? `Extra wensen: ${extra}` : ''}`,
        },
      ],
      { maxTokens: 2048 }
    )
  } catch (err) {
    console.error('[tocht-op-maat] AI fout:', err)
    return NextResponse.json(
      { error: 'De AI kon geen tocht genereren. Probeer het opnieuw.' },
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
