import { WebhooksClient } from './webhooks-client'
import { Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WebhooksPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#00E676] rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#0F172A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Webhooks Monitor</h1>
          <p className="text-sm text-[#94A3B8]">Betalingswebhook events en verwerking</p>
        </div>
      </div>
      <WebhooksClient />
    </div>
  )
}
