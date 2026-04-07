'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function adminLoginAction(_prevState: string, formData: FormData): Promise<string> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Probeer eerst customer-credentials (DB-gebaseerd, werkt met database sessions)
  try {
    await signIn('customer-credentials', {
      email,
      password,
      redirectTo: '/admin/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      // Probeer admin-credentials als fallback
      try {
        await signIn('admin-credentials', {
          email,
          password,
          redirectTo: '/admin/dashboard',
        })
      } catch (error2) {
        if (error2 instanceof AuthError) {
          return 'Onbekend e-mailadres of onjuist wachtwoord.'
        }
        throw error2 // redirect gooit geen AuthError — re-throw
      }
      return ''
    }
    throw error // redirect gooit geen AuthError — re-throw
  }
  return ''
}
