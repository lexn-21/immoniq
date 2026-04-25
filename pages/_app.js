import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Auth
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))

    // Register Service Worker (PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#c9a84c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ImmoNIQ" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <title>ImmoNIQ — Immobilienverwaltung</title>
      </Head>
      <Component {...pageProps} session={session || null} loading={session === undefined} />
    </>
  )
}
