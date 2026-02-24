import { Suspense } from 'react'
import JoinForm from './join-form'

export default function JoinPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <JoinForm />
    </Suspense>
  )
}
