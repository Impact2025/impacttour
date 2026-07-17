import type { Article, ArticleCategory } from './types'

import { article as wkrTeambuilding2026 } from './articles/wkr-teambuilding-2026'
import { article as csrdTeambuildingEsrsS1 } from './articles/csrd-teambuilding-esrs-s1'
import { article as traditioneleTeambuildingWerktNietMeer } from './articles/traditionele-teambuilding-werkt-niet-meer'
import { article as gpsTochtSocialeImpactMeetbaarGms } from './articles/gps-tocht-sociale-impact-meetbaar-gms'
import { article as talentretentieHoofddorpSchiphol } from './articles/talentretentie-hoofddorp-schiphol'
import { article as vierGeneratiesOpDeWerkvloer } from './articles/vier-generaties-op-de-werkvloer'
import { article as psychologischeVeiligheidTeam } from './articles/psychologische-veiligheid-team'
import { article as corporateVolunteeringJaarlijksProgramma } from './articles/corporate-volunteering-jaarlijks-programma'
import { article as checklistGeslaagdeTeambuildingdag } from './articles/checklist-geslaagde-teambuildingdag'
import { article as welkeIctusgoTochtPastBijJouwTeam } from './articles/welke-ictusgo-tocht-past-bij-jouw-team'
import { article as jeugdtochtOrganiserenAvgProof } from './articles/jeugdtocht-organiseren-avg-proof'
import { article as veelgesteldeVragenGpsTeambuilding } from './articles/veelgestelde-vragen-gps-teambuilding'
import { article as vierDimensiesVanTeamgeluk } from './articles/vier-dimensies-van-teamgeluk'
import { article as maatschappelijkTeamuitjeOrganiseren } from './articles/maatschappelijk-teamuitje-organiseren'
import { article as impactVrijwilligersDankdag2026 } from './articles/impact-vrijwilligers-dankdag-2026'
import { article as hoeOrganiseerJeVrijwilligersdag2026 } from './articles/hoe-organiseer-je-vrijwilligersdag-2026'
import { article as vanUitjeNaarImpactVrijwilligers } from './articles/van-uitje-naar-impact-vrijwilligers'
import { article as jaarVanDeVrijwilliger5Manieren } from './articles/jaar-van-de-vrijwilliger-5-manieren'
import { article as tienOrigineleIdeeenVrijwilligersUitjes } from './articles/10-originele-ideeen-vrijwilligers-uitjes'
import { article as vrijwilligersBurnoutVoorkomenErkenning } from './articles/vrijwilligers-burnout-voorkomen-erkenning'
import { article as vrijwilligersTeambuildingWatWerkt } from './articles/vrijwilligers-teambuilding-wat-werkt'
import { article as koppelVrijwilligersEventAanImpactmeting } from './articles/koppel-vrijwilligers-event-aan-impactmeting'
import { article as checklistSuccesvolleVrijwilligersdag } from './articles/checklist-succesvolle-vrijwilligersdag'

export const articles: Article[] = [
  wkrTeambuilding2026,
  csrdTeambuildingEsrsS1,
  traditioneleTeambuildingWerktNietMeer,
  gpsTochtSocialeImpactMeetbaarGms,
  talentretentieHoofddorpSchiphol,
  vierGeneratiesOpDeWerkvloer,
  psychologischeVeiligheidTeam,
  corporateVolunteeringJaarlijksProgramma,
  checklistGeslaagdeTeambuildingdag,
  welkeIctusgoTochtPastBijJouwTeam,
  jeugdtochtOrganiserenAvgProof,
  veelgesteldeVragenGpsTeambuilding,
  vierDimensiesVanTeamgeluk,
  maatschappelijkTeamuitjeOrganiseren,
  impactVrijwilligersDankdag2026,
  hoeOrganiseerJeVrijwilligersdag2026,
  vanUitjeNaarImpactVrijwilligers,
  jaarVanDeVrijwilliger5Manieren,
  tienOrigineleIdeeenVrijwilligersUitjes,
  vrijwilligersBurnoutVoorkomenErkenning,
  vrijwilligersTeambuildingWatWerkt,
  koppelVrijwilligersEventAanImpactmeting,
  checklistSuccesvolleVrijwilligersdag,
].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return articles.filter((a) => a.category === category)
}

export function getArticleBySlug(category: ArticleCategory, slug: string): Article | undefined {
  return articles.find((a) => a.category === category && a.slug === slug)
}

export function getRelatedArticles(article: Article): Article[] {
  return article.relatedSlugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is Article => Boolean(a))
}

export const CTA_CONTENT: Record<
  Article['cta'],
  { label: string; href: string; text: string }
> = {
  ictusgo: {
    label: 'Bekijk het aanbod op IctusGo',
    href: '/tochten',
    text: 'Klaar om dit voor jouw team te boeken?',
  },
  teambuildingmetimpact: {
    label: 'Ontdek Teambuildingmetimpact.nl',
    href: 'https://www.teambuildingmetimpact.nl',
    text: 'Klaar voor teamontwikkeling met een verhaal?',
  },
  weareimpact: {
    label: 'Verkennen via WeAreImpact.nl',
    href: 'https://www.weareimpact.nl',
    text: 'Wil je dit strategisch laten uitwerken?',
  },
  thee: {
    label: 'Plan een kop thee',
    href: '/contact',
    text: 'Zullen we er eens rustig over doorpraten?',
  },
  lsp: {
    label: 'Vraag naar een LEGO® Serious Play-traject',
    href: '/contact',
    text: 'Interesse in een traject op maat? Plekken zijn beperkt.',
  },
}
