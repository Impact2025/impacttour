import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tochtAanvragen } from '@/lib/db/schema'

export const maxDuration = 60

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

  const isFamilieOfKoppel = group === 'familie' || group === 'stel'
  const impactRegel = isFamilieOfKoppel
    ? `\nVERPLICHT: 1 van de 5 missies moet een sociale impact-opdracht zijn waarbij deelnemers iets doen VOOR of MET een onbekende buiten hun gezelschap (bijv. compliment geven, foto laten maken, kleine vriendelijkheid). Dit maakt de GMS-score eerlijk.`
    : ''

  const systemPrompt = `Je bent een tocht-ontwerper voor IctusGo GPS teambuilding.
Genereer een GPS-tocht. Antwoord ALLEEN in JSON, geen uitleg.${impactRegel}

JSON formaat (precies 5 missies, elke missie op andere locatie in de stad):
{"title":"naam","tagline":"max 8 woorden","description":"1 zin","gms_prediction":75,"difficulty":"Makkelijk|Middel|Uitdagend","highlights":["h1","h2","h3"],"missions":[{"number":1,"title":"naam","location":"locatie in stad","description":"1 zin opdracht","type":"actie|quiz|creatief|sociaal|impact","points":100}],"impact_moment":"1 zin","tips":["tip1","tip2","tip3"]}
Taal: Nederlands.`

  const userPrompt = `Groepstype: ${groepLabels[group] ?? group}
Sfeer/thema: ${sfeerLabels[vibe] ?? vibe}
Duur: ${duurMinuten} minuten
Stad: ${city}
Deelnemers: ${deelnemers} personen
${extra ? `Extra wensen: ${extra}` : ''}`

  const model = process.env.OPENROUTER_DEFAULT_MODEL ?? 'anthropic/claude-sonnet-4-5'

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
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!orRes.ok) {
      const errText = await orRes.text()
      console.error('[tocht-op-maat] OpenRouter fout:', orRes.status, errText)
      return NextResponse.json(
        { error: 'De AI kon geen tocht genereren. Probeer het opnieuw.' },
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
      { error: 'De AI kon geen tocht genereren. Probeer het opnieuw.' },
      { status: 503 }
    )
  }

  // Log aanvraag naar database + geef aanvraagId terug voor checkout
  let aanvraagId: string | null = null
  try {
    const [row] = await db.insert(tochtAanvragen).values({
      groepType: group,
      sfeer: vibe,
      stad: city,
      deelnemers,
      duurMinuten,
      extraWensen: extra || null,
      gegenereerdeJson: result as unknown as Record<string, unknown>,
    }).returning({ id: tochtAanvragen.id })
    aanvraagId = row.id
  } catch {
    console.error('Fout bij opslaan tocht aanvraag in database')
  }

  return NextResponse.json({ ...result, aanvraagId }, {
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
