import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Reset() {
  const [mode, setMode] = useState('request')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()
  const G = '#d4af6a'

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update')
    })
  }, [])

  async function requestReset(e) {
    e.preventDefault()
    setLoading(true); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    })
    setLoading(false)
    if (error) setErr(error.message)
    else setMsg('E-Mail gesendet! Prüfe dein Postfach.')
  }

  async function updatePass(e) {
    e.preventDefault()
    if (pass !== pass2) { setErr('Passwörter stimmen nicht überein'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.auth.updateUser({ password: pass })
    setLoading(false)
    if (error) setErr(error.message)
    else { setMsg('Passwort geändert!'); setTimeout(() => router.push('/dashboard'), 1500) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--ff)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg2)', border: '0.5px solid var(--line)', borderRadius: 22, padding: '36px 32px' }}>
        <a href="/auth" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em', display: 'block', marginBottom: 28 }}>
          Immo<span style={{ color: G }}>NIQ</span>
        </a>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
          {mode === 'request' ? 'Passwort zurücksetzen' : 'Neues Passwort'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.5 }}>
          {mode === 'request' ? 'Wir senden dir einen Link per E-Mail.' : 'Gib dein neues Passwort ein.'}
        </p>

        {msg && <div style={{ background: 'rgba(48,209,88,0.1)', border: '0.5px solid rgba(48,209,88,0.3)', borderRadius: 12, padding: '11px 14px', fontSize: 13, color: 'var(--green)', marginBottom: 14 }}>{msg}</div>}
        {err && <div style={{ background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.3)', borderRadius: 12, padding: '11px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{err}</div>}

        {mode === 'request' ? (
          <form onSubmit={requestReset}>
            <div className="field">
              <label>E-Mail</label>
              <input type="email" placeholder="max@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-gold btn-full" style={{ marginTop: 10 }} disabled={loading}>
              {loading ? 'Sendet…' : 'Reset-Link senden →'}
            </button>
          </form>
        ) : (
          <form onSubmit={updatePass}>
            <div className="field">
              <label>Neues Passwort</label>
              <input type="password" placeholder="Mindestens 6 Zeichen" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} />
            </div>
            <div className="field">
              <label>Wiederholen</label>
              <input type="password" placeholder="Nochmals eingeben" value={pass2} onChange={e => setPass2(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-gold btn-full" style={{ marginTop: 10 }} disabled={loading}>
              {loading ? 'Speichert…' : 'Passwort ändern →'}
            </button>
          </form>
        )}

        <a href="/auth" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--t3)' }}>← Zurück zum Login</a>
      </div>
    </div>
  )
}
