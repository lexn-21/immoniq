import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Auth({ session }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [empfCode, setEmpfCode] = useState('')
  const [showEmpf, setShowEmpf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const G = '#d4af6a'

  useEffect(() => {
    if (router.query.mode === 'signup') setMode('register')
    if (router.query.ref) { setEmpfCode(router.query.ref); setShowEmpf(true); setMode('register') }
  }, [router.query])

  if (session) { router.push('/dashboard'); return null }

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (error) setError('E-Mail oder Passwort falsch')
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { name, empfehlungs_code: empfCode || null } }
      })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--ff)' }}>
      <div className="auth-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <a href="/" style={{ display: 'inline-block', marginBottom: 40, fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em' }}>
            Immo<span style={{ color: G }}>NIQ</span>
          </a>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>
            {mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>
            {mode === 'login' ? 'Melde dich in deinem Konto an.' : 'Starte kostenlos — kein Risiko.'}
          </p>
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '11px', borderRadius: 100, border: 'none',
                fontSize: 14, fontWeight: 600,
                background: mode === m ? G : 'transparent',
                color: mode === m ? '#000' : 'var(--t2)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {m === 'login' ? 'Anmelden' : 'Registrieren'}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="field">
                <label>Dein Name</label>
                <input type="text" placeholder="Max Mustermann" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <label>E-Mail</label>
              <input type="email" placeholder="max@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Passwort</label>
              <input type="password" placeholder="Mindestens 6 Zeichen" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} />
            </div>
            {mode === 'register' && (
              <div style={{ marginBottom: 20 }}>
                {!showEmpf ? (
                  <button type="button" onClick={() => setShowEmpf(true)} style={{ background: 'transparent', border: 'none', color: G, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    + Empfehlungscode eingeben
                  </button>
                ) : (
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Empfehlungscode (optional)</label>
                    <input type="text" placeholder="z.B. STB-MUELLER-MS" value={empfCode} onChange={e => setEmpfCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>Von deinem Steuerberater erhalten? Code eingeben für <strong style={{ color: G }}>3 Monate gratis</strong>.</div>
                  </div>
                )}
              </div>
            )}
            {error && <div style={{ background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.3)', borderRadius: 12, padding: '11px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{error}</div>}
            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? 'Lädt…' : mode === 'login' ? 'Anmelden →' : 'Account erstellen →'}
            </button>
            {mode === 'register' && (
              <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                Mit der Registrierung akzeptierst du unsere <a href="/agb" target="_blank" style={{ color: G }}>AGB</a> und die <a href="/datenschutz" target="_blank" style={{ color: G }}>Datenschutzerklärung</a>.
              </div>
            )}
          </form>
          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <a href="/reset" style={{ fontSize: 13, color: 'var(--t2)' }}>Passwort vergessen?</a>
            </div>
          )}
          {mode === 'register' && (
            <div style={{ marginTop: 18, background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: G, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>🚀 30 Tage kostenlos</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>Keine Kreditkarte. Jederzeit kündbar. Daten jederzeit exportierbar.</div>
            </div>
          )}
        </div>
      </div>
      <div className="auth-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', borderLeft: '0.5px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(212,175,106,0.06),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 28, lineHeight: 1.2 }}>
            Dein Immobilien-<br /><em style={{ fontStyle: 'italic', color: G }}>Imperium.</em> Digital.
          </div>
          {[
            ['🏗️', 'Objekte verwalten', 'Alle Einheiten, Mieter, Verträge'],
            ['⏰', 'Gesetzliche Fristen', 'Automatisch überwacht'],
            ['📊', 'Steuer mit AfA', 'Anlage V vorbereitet'],
            ['🔐', 'Dokumenten-Tresor', 'Verschlüsselt gespeichert'],
            ['🤖', 'Hilfe-Assistent', 'Mit Rechtsgrundlage'],
            ['🔨', 'Handwerker-Suche', 'Direkt über Google Maps']
          ].map(([ic, t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 14, marginBottom: 14, padding: '16px', background: 'var(--bg2)', border: '0.5px solid var(--line)', borderRadius: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--gp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{ic}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .auth-right { display: none !important; }
          .auth-left { max-width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
