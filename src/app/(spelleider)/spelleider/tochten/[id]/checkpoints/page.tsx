import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { tours } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { CheckpointEditor } from './checkpoint-editor'

export default async function CheckpointsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const tour = await db.query.tours.findFirst({
    where: and(eq(tours.id, id), eq(tours.createdById, session.user.id)),
    with: {
      checkpoints: { orderBy: (c) => [asc(c.orderIndex)] },
    },
  })

  if (!tour) notFound()

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a
            href={`/spelleider/tochten/${tour.id}`}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← {tour.name}
          </a>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold text-gray-900">Checkpoint kaarteditor</h1>
        </div>
        <div className="text-sm text-gray-500">
          Klik op de kaart om een checkpoint toe te voegen
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <CheckpointEditor
          tourId={tour.id}
          initialCheckpoints={tour.checkpoints}
          variant={tour.variant}
        />
      </div>
    </main>
  )
}
