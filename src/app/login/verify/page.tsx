export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check je e-mail
        </h1>
        <p className="text-gray-600">
          We hebben een inloglink verstuurd. Klik op de link om in te loggen.
          De link is 24 uur geldig.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Geen e-mail ontvangen? Controleer ook je spamfolder.
        </p>
      </div>
    </main>
  )
}
