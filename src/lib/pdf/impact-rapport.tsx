/**
 * ImpactRapport PDF Template
 * Gebruikt @react-pdf/renderer voor server-side PDF generatie.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    color: '#1e293b',
  },
  // Header
  header: {
    backgroundColor: '#16a34a',
    margin: -40,
    marginBottom: 32,
    padding: 40,
    paddingBottom: 28,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#bbf7d0',
    marginBottom: 2,
  },
  headerMeta: {
    fontSize: 9,
    color: '#86efac',
    marginTop: 8,
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  // GMS Score
  scoreCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 700,
    color: '#16a34a',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  scoreBadge: {
    backgroundColor: '#16a34a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  scoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 700,
  },
  // GMS breakdown grid
  dimensionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dimensionCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  dimensionValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#16a34a',
    marginBottom: 2,
  },
  dimensionLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Leaderboard
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  leaderRank: {
    width: 24,
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
  },
  leaderName: {
    flex: 1,
    fontSize: 10,
    color: '#1e293b',
  },
  leaderScore: {
    fontSize: 11,
    fontWeight: 700,
    color: '#16a34a',
    marginRight: 12,
  },
  leaderCps: {
    fontSize: 9,
    color: '#94a3b8',
    width: 50,
    textAlign: 'right',
  },
  // Narrative
  narrativeText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  // Top team highlight
  topTeamRow: {
    backgroundColor: '#fef9c3',
    borderRadius: 6,
  },
  topTeamRank: {
    color: '#92400e',
    fontWeight: 700,
  },
  topTeamName: {
    color: '#92400e',
    fontWeight: 700,
  },
})

interface RapportProps {
  tourName: string
  variant: string
  sessionDate: Date | null
  totalTeams: number
  avgGmsScore: number
  gmsBreakdown: { connection: number; meaning: number; joy: number; growth: number }
  topTeams: Array<{ rank: number; name: string; score: number; checkpointsDone: number }>
  totalCheckpoints: number
  narrative: string
}

const variantLabel: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
}

export function ImpactRapport({
  tourName,
  variant,
  sessionDate,
  totalTeams,
  avgGmsScore,
  gmsBreakdown,
  topTeams,
  totalCheckpoints,
  narrative,
}: RapportProps) {
  const isHighImpact = avgGmsScore >= 70
  const dateStr = sessionDate
    ? new Date(sessionDate).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Onbekende datum'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ImpactTocht Rapport</Text>
          <Text style={styles.headerSubtitle}>{tourName}</Text>
          <Text style={styles.headerSubtitle}>{variantLabel[variant] ?? variant}</Text>
          <Text style={styles.headerMeta}>
            {dateStr} · {totalTeams} teams · {totalCheckpoints} checkpoints
          </Text>
        </View>

        {/* GMS Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gemiddelde GMS Score</Text>
          <View style={styles.scoreCard}>
            <View>
              <Text style={styles.scoreNumber}>{avgGmsScore}</Text>
              <Text style={styles.scoreLabel}>Geluksmomenten Score (gem. /100)</Text>
              {isHighImpact && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>★ Hoge Impact</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>Teams deelgenomen</Text>
              <Text style={{ fontSize: 28, fontWeight: 700, color: '#16a34a' }}>{totalTeams}</Text>
            </View>
          </View>

          {/* Dimensies */}
          <View style={styles.dimensionGrid}>
            {[
              { label: 'Verbinding', value: gmsBreakdown.connection },
              { label: 'Betekenis', value: gmsBreakdown.meaning },
              { label: 'Plezier', value: gmsBreakdown.joy },
              { label: 'Groei', value: gmsBreakdown.growth },
            ].map((dim) => (
              <View key={dim.label} style={styles.dimensionCard}>
                <Text style={styles.dimensionValue}>{dim.value}</Text>
                <Text style={styles.dimensionLabel}>{dim.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Klassement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eindklassement</Text>

          {/* Header rij */}
          <View style={[styles.leaderRow, { backgroundColor: '#f8fafc' }]}>
            <Text style={[styles.leaderRank, { color: '#94a3b8' }]}>#</Text>
            <Text style={[styles.leaderName, { color: '#64748b', fontSize: 8, textTransform: 'uppercase' }]}>Team</Text>
            <Text style={[styles.leaderScore, { color: '#64748b', fontSize: 8 }]}>GMS</Text>
            <Text style={[styles.leaderCps, { color: '#64748b', fontSize: 8 }]}>Checkpoints</Text>
          </View>

          {topTeams.map((team) => (
            <View
              key={team.rank}
              style={[styles.leaderRow, team.rank === 1 ? styles.topTeamRow : {}]}
            >
              <Text style={[styles.leaderRank, team.rank === 1 ? styles.topTeamRank : {}]}>
                {`${team.rank}.`}
              </Text>
              <Text style={[styles.leaderName, team.rank === 1 ? styles.topTeamName : {}]}>
                {team.name}
              </Text>
              <Text style={styles.leaderScore}>{team.score}</Text>
              <Text style={styles.leaderCps}>{team.checkpointsDone}/{totalCheckpoints}</Text>
            </View>
          ))}
        </View>

        {/* Narratief */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Narratief</Text>
          <Text style={styles.narrativeText}>{narrative}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ImpactTocht · weareimpact.nl</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Pagina ${pageNumber} van ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  )
}
