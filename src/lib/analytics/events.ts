import { sendGAEvent } from '@next/third-parties/google'

/** Wrapper om sendGAEvent — voorkomt crashes wanneer GA nog niet geladen is (bv. adblockers). */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  try {
    sendGAEvent('event', name, params ?? {})
  } catch {
    // GA-uitval mag nooit de gebruikersflow breken
  }
}
