/**
 * ImpactRapport PDF Template — v2
 * 2 pagina's: Overzicht + Analyse & Aanbevelingen
 * Gebruikt @react-pdf/renderer voor server-side PDF generatie.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy:       '#0F172A',
  green:      '#16a34a',
  greenLight: '#dcfce7',
  greenMid:   '#bbf7d0',
  greenText:  '#166534',
  gold:       '#F59E0B',
  goldLight:  '#FEF9C3',
  goldText:   '#92400e',
  slate:      '#64748B',
  slateLight: '#F8FAFC',
  border:     '#E2E8F0',
  text:       '#1E293B',
  muted:      '#94A3B8',
  white:      '#FFFFFF',
  red:        '#EF4444',
  orange:     '#F97316',
  blue:       '#3B82F6',
  purple:     '#8B5CF6',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
    padding: 0,
    fontSize: 10,
    color: C.text,
  },
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    padding: 32,
    paddingBottom: 24,
    marginBottom: 0,
  },
  headerBadge: {
    backgroundColor: C.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  headerBadgeText: {
    color: C.white,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 6,
  },
  // ── Body padding ────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 60,
  },
  // ── Section ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.slate,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  // ── Score hero ───────────────────────────────────────────────────────────────
  scoreHero: {
    backgroundColor: C.slateLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  scoreNumber: {
    fontSize: 52,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: 14,
    color: C.slate,
    fontFamily: 'Helvetica',
  },
  scorePct: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    marginTop: 4,
  },
  // ── Scale bar ────────────────────────────────────────────────────────────────
  scaleRow: {
    flexDirection: 'row',
    marginBottom: 6,
    borderRadius: 4,
    overflow: 'hidden',
    height: 12,
  },
  scaleLabel: {
    fontSize: 7,
    color: C.muted,
    textAlign: 'center',
  },
  scaleMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 20,
    backgroundColor: C.navy,
    borderRadius: 1,
  },
  scaleWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  // ── Benchmark ────────────────────────────────────────────────────────────────
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  benchmarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
  },
  benchmarkText: {
    fontSize: 8,
    color: C.slate,
    fontFamily: 'Helvetica-Oblique',
  },
  // ── Dimensie cards ───────────────────────────────────────────────────────────
  dimensionGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dimensionCard: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  dimensionValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    marginBottom: 2,
  },
  dimensionLabel: {
    fontSize: 7,
    color: C.slate,
    textAlign: 'center',
  },
  dimensionPct: {
    fontSize: 7,
    color: C.muted,
    marginTop: 2,
  },
  // ── Team tabel ───────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowTop: {
    backgroundColor: C.goldLight,
    borderRadius: 4,
  },
  colRank:  { width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.slate },
  colName:  { flex: 1,   fontSize: 9, color: C.text },
  colScore: { width: 38, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.green, textAlign: 'right' },
  colPct:   { width: 30, fontSize: 8, color: C.slate, textAlign: 'right' },
  colDim:   { width: 30, fontSize: 8, color: C.text, textAlign: 'right' },
  colCp:    { width: 24, fontSize: 8, color: C.muted, textAlign: 'right' },
  colNameTop:  { flex: 1,   fontSize: 9, color: C.goldText, fontFamily: 'Helvetica-Bold' },
  colRankTop:  { width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.goldText },
  // ── ROI kader ────────────────────────────────────────────────────────────────
  roiBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: C.blue,
    borderRadius: 4,
    padding: 12,
    marginBottom: 0,
  },
  roiTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  roiText: {
    fontSize: 9,
    color: '#1E40AF',
    lineHeight: 1.5,
  },
  // ── Pagina 2 ─────────────────────────────────────────────────────────────────
  p2header: {
    backgroundColor: C.green,
    padding: 28,
    paddingBottom: 20,
  },
  p2headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 4,
  },
  p2headerSub: {
    fontSize: 9,
    color: '#bbf7d0',
  },
  // ── Aanbevelingen ────────────────────────────────────────────────────────────
  recBox: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
  recIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.greenLight,
    shrink: 0,
  },
  recIconText: {
    fontSize: 10,
    color: C.green,
    fontFamily: 'Helvetica-Bold',
  },
  recTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 3,
  },
  recBody: {
    fontSize: 8,
    color: C.slate,
    lineHeight: 1.5,
  },
  // ── Narratief ────────────────────────────────────────────────────────────────
  narrativeBox: {
    backgroundColor: C.slateLight,
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.green,
  },
  narrativeText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.7,
  },
  // ── CTA ──────────────────────────────────────────────────────────────────────
  ctaBox: {
    backgroundColor: C.navy,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ctaLeft: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 3,
  },
  ctaBody: {
    fontSize: 8,
    color: '#94A3B8',
    lineHeight: 1.4,
  },
  ctaUrl: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
    marginTop: 6,
  },
  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: C.muted,
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamScore {
  rank: number
  name: string
  score: number
  scorePct: number
  checkpointsDone: number
  dimensions: { connection: number; meaning: number; joy: number; growth: number }
}

interface Recommendation {
  label: string
  score: number
  maxScore: number
  pct: number
  action: string
  why: string
}

export interface RapportProps {
  tourName: string
  variant: string
  sessionDate: Date | null
  organizationName?: string
  totalTeams: number
  totalParticipants: number
  avgGmsScore: number
  avgGmsPct: number
  gmsMax: number
  dimensionMaxes: { connection: number; meaning: number; joy: number; growth: number }
  gmsBreakdown: { connection: number; meaning: number; joy: number; growth: number }
  gmsBreakdownPct: { connection: number; meaning: number; joy: number; growth: number }
  teamScores: TeamScore[]
  totalCheckpoints: number
  narrative: string
  recommendations: Recommendation[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const variantLabel: Record<string, string> = {
  wijktocht:    'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht:   'JeugdTocht',
  voetbalmissie:'VoetbalMissie',
}

function gmsLevel(pct: number): { label: string; color: string } {
  if (pct >= 85) return { label: 'Uitstekend',    color: '#7C3AED' }
  if (pct >= 70) return { label: 'Hoge Impact',   color: '#16a34a' }
  if (pct >= 50) return { label: 'Goede prestatie', color: '#2563EB' }
  return           { label: 'Basiservaring',     color: '#6B7280' }
}

// ─── Pagina 1: Overzicht ─────────────────────────────────────────────────────

function Page1({
  tourName, variant, sessionDate, organizationName,
  totalTeams, totalParticipants, totalCheckpoints,
  avgGmsScore, avgGmsPct, gmsMax,
  gmsBreakdown, gmsBreakdownPct, dimensionMaxes,
  teamScores,
}: RapportProps) {
  const dateStr = sessionDate
    ? new Date(sessionDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Onbekende datum'

  const level = gmsLevel(avgGmsPct)
  const BENCHMARK_PCT = 65 // Gemiddeld voor bedrijfsmatige teamdagen

  // Scale: 0% t/m 100%, markeer benchmark (65%) en score
  const scaleSegments = [
    { label: 'Basis',           pct: 50, color: '#E2E8F0' },
    { label: 'Goed',            pct: 20, color: '#BAE6FD' },
    { label: 'Hoge Impact',     pct: 15, color: '#86EFAC' },
    { label: 'Uitstekend',      pct: 15, color: '#4ADE80' },
  ]

  const dims = [
    { label: 'Verbinding', value: gmsBreakdown.connection, pct: gmsBreakdownPct.connection, max: dimensionMaxes.connection, color: '#EC4899' },
    { label: 'Betekenis',  value: gmsBreakdown.meaning,    pct: gmsBreakdownPct.meaning,    max: dimensionMaxes.meaning,    color: '#8B5CF6' },
    { label: 'Plezier',    value: gmsBreakdown.joy,        pct: gmsBreakdownPct.joy,        max: dimensionMaxes.joy,        color: '#F59E0B' },
    { label: 'Groei',      value: gmsBreakdown.growth,     pct: gmsBreakdownPct.growth,     max: dimensionMaxes.growth,     color: '#3B82F6' },
  ]

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>IctusGo Impactrapport</Text>
        </View>
        <Text style={styles.headerTitle}>{tourName}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
          {variantLabel[variant] ?? variant}{organizationName ? ` · ${organizationName}` : ''}
        </Text>
        <Text style={styles.headerMeta}>
          {dateStr} · {totalTeams} teams · {totalParticipants} deelnemers · {totalCheckpoints} checkpoints
        </Text>
      </View>

      <View style={styles.body}>

        {/* GMS Score + context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gemiddelde GMS Score</Text>

          <View style={styles.scoreHero}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.scoreNumber}>{avgGmsScore}</Text>
                <Text style={styles.scoreMax}>/{gmsMax}</Text>
              </View>
              <Text style={styles.scorePct}>{avgGmsPct}%</Text>
              <View style={{
                marginTop: 6,
                backgroundColor: level.color,
                borderRadius: 4,
                paddingHorizontal: 8, paddingVertical: 3,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold' }}>
                  ★ {level.label}
                </Text>
              </View>
            </View>

            {/* Score schaal */}
            <View style={{ width: 200 }}>
              <Text style={{ fontSize: 8, color: C.slate, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>
                Prestatieschaal
              </Text>
              <View style={styles.scaleWrapper}>
                {/* Kleurbalken */}
                <View style={styles.scaleRow}>
                  {scaleSegments.map((s) => (
                    <View key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                  ))}
                </View>
                {/* Benchmark marker */}
                <View style={[styles.scaleMarker, { left: `${BENCHMARK_PCT}%`, backgroundColor: C.orange }]} />
                {/* Score marker */}
                <View style={[styles.scaleMarker, { left: `${Math.min(avgGmsPct, 99)}%`, backgroundColor: C.navy }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {scaleSegments.map((s) => (
                  <Text key={s.label} style={styles.scaleLabel}>{s.label}</Text>
                ))}
              </View>
              <View style={styles.benchmarkRow}>
                <View style={styles.benchmarkDot} />
                <Text style={styles.benchmarkText}>
                  Branchebenchmark: {BENCHMARK_PCT}% — dit team scoort {avgGmsPct > BENCHMARK_PCT ? `${avgGmsPct - BENCHMARK_PCT}% daarboven` : `${BENCHMARK_PCT - avgGmsPct}% daaronder`}
                </Text>
              </View>
            </View>
          </View>

          {/* Dimensies gemiddeld */}
          <View style={styles.dimensionGrid}>
            {dims.map((d) => (
              <View key={d.label} style={[styles.dimensionCard, { borderTopWidth: 3, borderTopColor: d.color }]}>
                <Text style={[styles.dimensionValue, { color: d.color }]}>{d.value}</Text>
                <Text style={styles.dimensionLabel}>{d.label}</Text>
                <Text style={styles.dimensionPct}>{d.pct}% van {d.max}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Klassement met dimensies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eindklassement — per team</Text>

          {/* Tabel header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colRank,  { color: C.slate, fontSize: 7, fontFamily: 'Helvetica' }]}>#</Text>
            <Text style={[styles.colName,  { color: C.slate, fontSize: 7 }]}>Team</Text>
            <Text style={[styles.colScore, { color: C.slate, fontSize: 7, fontFamily: 'Helvetica' }]}>GMS</Text>
            <Text style={[styles.colPct,   { color: C.slate, fontSize: 7 }]}>%</Text>
            <Text style={[styles.colDim,   { color: '#EC4899', fontSize: 7 }]}>Verb.</Text>
            <Text style={[styles.colDim,   { color: '#8B5CF6', fontSize: 7 }]}>Betek.</Text>
            <Text style={[styles.colDim,   { color: '#F59E0B', fontSize: 7 }]}>Plezier</Text>
            <Text style={[styles.colDim,   { color: '#3B82F6', fontSize: 7 }]}>Groei</Text>
            <Text style={[styles.colCp,    { color: C.slate,  fontSize: 7 }]}>CP</Text>
          </View>

          {teamScores.map((team) => {
            const isTop = team.rank === 1
            return (
              <View key={team.rank} style={[styles.tableRow, isTop ? styles.tableRowTop : {}]}>
                <Text style={isTop ? styles.colRankTop : styles.colRank}>{team.rank}.</Text>
                <Text style={isTop ? styles.colNameTop : styles.colName}>{team.name}</Text>
                <Text style={styles.colScore}>{team.score}</Text>
                <Text style={styles.colPct}>{team.scorePct}%</Text>
                <Text style={styles.colDim}>{team.dimensions.connection}</Text>
                <Text style={styles.colDim}>{team.dimensions.meaning}</Text>
                <Text style={styles.colDim}>{team.dimensions.joy}</Text>
                <Text style={styles.colDim}>{team.dimensions.growth}</Text>
                <Text style={styles.colCp}>{team.checkpointsDone}/{totalCheckpoints}</Text>
              </View>
            )
          })}

          <Text style={{ fontSize: 7, color: C.muted, marginTop: 6 }}>
            Verb. = Verbinding · Betek. = Betekenis · CP = voltooide checkpoints
          </Text>
        </View>

        {/* ROI kader */}
        <View style={styles.roiBox}>
          <Text style={styles.roiTitle}>Wat dit betekent voor jullie organisatie</Text>
          <Text style={styles.roiText}>
            Teams met een GMS-score boven 70% rapporteren na afloop aantoonbaar sterkere onderlinge
            verbinding en hogere betrokkenheid bij sociale thema's. Met {avgGmsPct}% scoort
            {' '}{variantLabel[variant] ?? variant} {avgGmsPct >= 70 ? 'bovengemiddeld' : 'op een goed niveau'} voor
            teambuilding in deze categorie. Pagina 2 bevat concrete aanbevelingen om dit resultaat
            te borgen en de laagst scorende dimensies te versterken.
          </Text>
        </View>

      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>IctusGo · weareimpact.nl</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
          `Pagina ${pageNumber} van ${totalPages}`
        } />
      </View>
    </Page>
  )
}

// ─── Pagina 2: Analyse & Aanbevelingen ───────────────────────────────────────

function Page2({ recommendations, narrative, tourName }: RapportProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.p2header}>
        <Text style={styles.p2headerTitle}>Analyse & Aanbevelingen</Text>
        <Text style={styles.p2headerSub}>{tourName} — wat kunnen jullie hiermee?</Text>
      </View>

      <View style={styles.body}>

        {/* Aanbevelingen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dimensie-analyse met aanbevelingen</Text>

          {recommendations.map((rec, i) => (
            <View key={i} style={[styles.recBox, {
              borderLeftWidth: 3,
              borderLeftColor: rec.pct >= 75 ? C.green : rec.pct >= 60 ? C.orange : C.red,
            }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.recTitle}>{rec.label}</Text>
                  <View style={{
                    backgroundColor: rec.pct >= 75 ? C.greenLight : rec.pct >= 60 ? '#FEF3C7' : '#FEE2E2',
                    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold',
                      color: rec.pct >= 75 ? C.greenText : rec.pct >= 60 ? '#92400E' : '#991B1B',
                    }}>
                      {rec.score}/{rec.maxScore} pt ({rec.pct}%)
                    </Text>
                  </View>
                </View>
                <Text style={styles.recBody}>{rec.why}</Text>
                <View style={{ marginTop: 5, flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 8, color: C.green, fontFamily: 'Helvetica-Bold' }}>→</Text>
                  <Text style={{ fontSize: 8, color: C.text, fontFamily: 'Helvetica-Bold', flex: 1 }}>
                    {rec.action}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Narratief */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Narratief</Text>
          <View style={styles.narrativeBox}>
            <Text style={styles.narrativeText}>{narrative}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaBox}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaTitle}>Klaar voor de volgende stap?</Text>
            <Text style={styles.ctaBody}>
              Boek een vervolgsessie gericht op de laagst scorende dimensies,
              of bekijk het team-specifieke rapport via de app.
            </Text>
            <Text style={styles.ctaUrl}>impacttocht.nl · chat@weareimpact.nl</Text>
          </View>
        </View>

      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>IctusGo · weareimpact.nl</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
          `Pagina ${pageNumber} van ${totalPages}`
        } />
      </View>
    </Page>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function ImpactRapport(props: RapportProps) {
  return (
    <Document>
      <Page1 {...props} />
      <Page2 {...props} />
    </Document>
  )
}
