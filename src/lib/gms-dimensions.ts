/**
 * Centrale GMS dimensie-definitie — labels, HR-taal en kleuren op één plek.
 * Importeer dit in UI-componenten, PDF en marketing-pagina's.
 */

export type DimensionKey = 'connection' | 'meaning' | 'joy' | 'growth'

export interface GmsDimension {
  /** Productlabel (in-game, voor eindgebruiker) */
  label: string
  /** HR/boardroom equivalent — verzuim, retentie, vitaliteit, inzetbaarheid */
  hrLabel: string
  /** Één-zin uitleg voor HR-audience */
  hrOutcome: string
  /** Primaire UI-kleur (hex) */
  color: string
  /** Kleur in PDF (growth gebruikt blauw ipv groen vanwege contrast op wit papier) */
  pdfColor: string
}

export const GMS_DIMENSIONS: Record<DimensionKey, GmsDimension> = {
  connection: {
    label:      'Verbinding',
    hrLabel:    'Verzuimpreventie',
    hrOutcome:  'Sterke sociale verbinding verlaagt werkstress en vermindert ziekteverzuim.',
    color:      '#EC4899',
    pdfColor:   '#EC4899',
  },
  meaning: {
    label:      'Betekenis',
    hrLabel:    'Retentie',
    hrOutcome:  'Zingeving op het werk verhoogt medewerkersbetrokkenheid en verlaagt verloop.',
    color:      '#8B5CF6',
    pdfColor:   '#8B5CF6',
  },
  joy: {
    label:      'Plezier',
    hrLabel:    'Vitaliteit',
    hrOutcome:  'Werkplezier en positieve energie zijn directe indicatoren van mentale vitaliteit.',
    color:      '#F59E0B',
    pdfColor:   '#F59E0B',
  },
  growth: {
    label:      'Groei',
    hrLabel:    'Duurzame Inzetbaarheid',
    hrOutcome:  'Persoonlijke groei borgt de langdurige inzetbaarheid van medewerkers.',
    color:      '#00E676',
    pdfColor:   '#3B82F6',
  },
}

export const DIMENSION_KEYS: DimensionKey[] = ['connection', 'meaning', 'joy', 'growth']
