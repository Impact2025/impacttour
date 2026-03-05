'use client'

import dynamic from 'next/dynamic'

function WizardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

const TochtWizard = dynamic(() => import('@/components/tocht-op-maat/TochtWizard'), {
  ssr: false,
  loading: WizardSkeleton,
})

export default function TochtWizardClient() {
  return <TochtWizard />
}
