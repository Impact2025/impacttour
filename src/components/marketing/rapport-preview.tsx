import { FileText, Star, TrendingUp } from 'lucide-react'
import { RadialProgress } from '@/components/ui/radial-progress'
import { ProgressBar } from '@/components/ui/progress-bar'

const MOCK = {
  tourName: 'WijkTocht Amsterdam Centrum',
  variant: 'WijkTocht',
  date: '12 april 2025',
  teams: 6,
  participants: 30,
  gmsScore: 78,
  gmsMax: 100,
  dims: [
    { label: 'Verbinding', hrLabel: 'Verzuimpreventie', pct: 82, color: '#EC4899' },
    { label: 'Betekenis',  hrLabel: 'Retentie',         pct: 74, color: '#8B5CF6' },
    { label: 'Plezier',   hrLabel: 'Vitaliteit',        pct: 91, color: '#F59E0B' },
    { label: 'Groei',     hrLabel: 'Inzetbaarheid',     pct: 68, color: '#3B82F6' },
  ],
  coachSnippet:
    'Het team toonde sterke samenwerking bij Checkpoint 3 (Buurtmarkt). De Verbinding-score steeg 18% t.o.v. het gemiddelde na de reflectievraag over vertrouwen.',
}

export function RapportPreview() {
  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-[#00E676]" />
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">
          Voorbeeld: Persoonlijk Impactrapport (PDF)
        </span>
        <span className="ml-auto text-[10px] text-[#94A3B8]">Pagina 1 van 2</span>
      </div>

      {/* Browser chrome */}
      <div className="bg-[#1E293B] rounded-t-2xl px-4 py-2.5 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#EF4444]/70" />
        <span className="w-3 h-3 rounded-full bg-[#F59E0B]/70" />
        <span className="w-3 h-3 rounded-full bg-[#00E676]/70" />
        <div className="flex-1 mx-4 bg-[#0F172A] rounded px-3 py-1 text-[10px] text-[#475569]">
          ImpactRapport_WijkTocht_20250412.pdf
        </div>
      </div>

      {/* PDF page mock */}
      <div className="bg-white rounded-b-2xl border border-[#E2E8F0] overflow-hidden shadow-2xl shadow-[#0F172A]/20">

        {/* PDF header */}
        <div className="bg-[#0F172A] px-6 py-5">
          <span className="inline-block text-[9px] font-bold text-white bg-[#16a34a] rounded px-2 py-0.5 mb-2 uppercase tracking-wider">
            IctusGo Impactrapport
          </span>
          <p className="text-white font-bold text-lg leading-tight">{MOCK.tourName}</p>
          <p className="text-[#94A3B8] text-xs mt-1">
            {MOCK.variant} · {MOCK.date} · {MOCK.teams} teams · {MOCK.participants} deelnemers
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* GMS Score hero */}
          <div>
            <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
              Gemiddelde GMS Score
            </p>
            <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-6">
              <RadialProgress value={MOCK.gmsScore} max={MOCK.gmsMax} size={100} strokeWidth={10} />
              <div>
                <p
                  className="text-3xl font-black text-[#0F172A]"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  {MOCK.gmsScore}
                  <span className="text-base text-[#94A3B8] font-normal">/{MOCK.gmsMax}</span>
                </p>
                <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                  <Star className="w-3 h-3" /> Hoge Impact
                </span>
                <p className="text-[10px] text-[#94A3B8] mt-2">
                  Benchmark: 65% branchegemiddelde
                </p>
              </div>
            </div>
          </div>

          {/* Dimension scores */}
          <div>
            <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
              Dimensie Scores
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MOCK.dims.map((d) => (
                <div key={d.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs font-bold text-[#0F172A]">{d.label}</span>
                    <span className="text-xs font-black" style={{ color: d.color }}>{d.pct}%</span>
                  </div>
                  <ProgressBar value={d.pct} max={100} color={d.color} />
                  <p className="text-[9px] text-[#94A3B8] mt-1.5 font-bold uppercase tracking-wider">
                    {d.hrLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Inzicht */}
          <div className="bg-[#F8FAFC] border-l-4 border-[#00E676] rounded-r-xl px-4 py-3">
            <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">
              Coach Inzicht
            </p>
            <p className="text-xs text-[#374151] leading-relaxed">{MOCK.coachSnippet}</p>
          </div>

          {/* HR ROI box */}
          <div className="bg-[#EFF6FF] border-l-4 border-[#3B82F6] rounded-r-xl px-4 py-3">
            <p className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> HR Impact
            </p>
            <p className="text-[10px] text-[#1E40AF] leading-relaxed">
              IctusGo meet vier dimensies die direct aansluiten op de HR-agenda. Met een GMS-score
              van {MOCK.gmsScore}% scoort deze sessie boven het branchegemiddelde van 65% — een
              aantoonbaar positief effect op werknemersbetrokkenheid.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-[#E2E8F0] pt-3 flex justify-between text-[9px] text-[#94A3B8]">
            <span>IctusGo · ictusgo.nl</span>
            <span>Pagina 1 van 2</span>
          </div>
        </div>
      </div>

      {/* Page 2 peek */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-[#E2E8F0] rounded-b-2xl -z-10" />
    </div>
  )
}
