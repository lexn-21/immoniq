import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { FRISTEN, SANIERUNG_INTERVALLE, HILFE_THEMEN, DOK_TYPEN, BMF_AFA_LINK } from '../lib/constants'

// ── HELPERS ──
const fe = n => typeof n === 'number' && !isNaN(n) ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '—'
const feK = n => typeof n === 'number' && !isNaN(n) ? n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €' : '—'
const fd = s => { if (!s) return '—'; try { const [y,m,d] = s.split('-'); return `${d}.${m}.${y}` } catch { return s } }
const initials = s => s ? s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'
const daysUntil = d => { if (!d) return null; const diff = new Date(d) - new Date(); return Math.ceil(diff / (1000 * 60 * 60 * 24)) }
const ICONS = { Wohnung: '🏢', Haus: '🏡', Gewerbe: '🏗️', 'Garage / Stellplatz': '🅿️' }
const G = '#d4af6a'

// ══════════════════════════════════════════════════════════
// CRITICAL: These components MUST be defined OUTSIDE the main
// component to prevent re-mounting on every keystroke (the bug!)
// ══════════════════════════════════════════════════════════

// NumberField - uses type="text" with inputMode decimal, no cursor jumps
const NumberField = memo(function NumberField({ value, onChange, placeholder, style, autoFocus }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoCorrect="off"
      autoComplete="off"
      spellCheck="false"
      pattern="[0-9]*[.,]?[0-9]*"
      placeholder={placeholder}
      value={value || ''}
      style={style}
      autoFocus={autoFocus}
      onChange={e => {
        const v = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
        onChange(v)
      }}
    />
  )
})

const TextField = memo(function TextField({ value, onChange, placeholder, type = 'text', autoFocus, style, required, minLength }) {
  return (
    <input
      type={type}
      value={value || ''}
      autoCorrect="off"
      autoComplete="off"
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={style}
      required={required}
      minLength={minLength}
      onChange={e => onChange(e.target.value)}
    />
  )
})

const TextArea = memo(function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ''}
      rows={rows}
      style={{ resize: 'none' }}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
})

const F = memo(function F({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  )
})

const Btn = memo(function Btn({ gold, full, sm, danger, outline, dark, children, ...p }) {
  return (
    <button className={`btn${gold ? ' btn-gold' : ''}${outline ? ' btn-outline' : ''}${dark ? ' btn-dark' : ''}${danger ? ' btn-danger' : ''}${full ? ' btn-full' : ''}${sm ? ' btn-sm' : ''}`} {...p}>{children}</button>
  )
})

// Modal component — defined OUTSIDE parent
const Modal = memo(function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={wide ? { maxWidth: 720 } : {}}>
        <div className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
})

const Loader = memo(function Loader() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: G, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      Lädt…
    </div>
  )
})

const Empty = memo(function Empty({ icon, text, children }) {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 42, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, color: 'var(--t3)' }}>{text}</div>
      {children}
    </div>
  )
})

// ══════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════

export default function Dashboard({ session, loading: authLoading }) {
  const router = useRouter()
  const [toastMsg, setToastMsg] = useState('')
  const toast = useCallback((m) => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2800) }, [])

  const [tab, setTab] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)

  // Data
  const [objekte, setObjekte] = useState([])
  const [aufgaben, setAufgaben] = useState([])
  const [nachrichten, setNachrichten] = useState([])
  const [zahlungen, setZahlungen] = useState([])
  const [sanierungen, setSanierungen] = useState([])
  const [dokumente, setDokumente] = useState([])
  const [loading, setLoading] = useState(true)

  const [sel, setSel] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // Form state
  const [form, setForm] = useState({})
  const sf = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), [])
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadImage, setUploadImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  // NK state
  const [nkStep, setNkStep] = useState(1)
  const [nkItems, setNkItems] = useState([])
  const [nkForm, setNkForm] = useState({ vz: '', von: '2025-01-01', bis: '2025-12-31', flm: '', flg: '' })
  const [nkResult, setNkResult] = useState(null)

  // Hilfe
  const [hilfeQuery, setHilfeQuery] = useState('')
  const [hilfeAnswer, setHilfeAnswer] = useState(null)

  // Handwerker
  const [hwSearch, setHwSearch] = useState('')

  // Steuerberater
  const [stb, setStb] = useState(null)
  const [stbForm, setStbForm] = useState({ name: '', kanzlei: '', email: '', telefon: '' })
  const [stbExports, setStbExports] = useState([])
  const [stbSending, setStbSending] = useState(false)
  const [stbVerzeichnis, setStbVerzeichnis] = useState([])

  // Vertragsvorlagen
  const [vorlagen, setVorlagen] = useState([])

  // Rendite / Wert
  const [rendForm, setRendForm] = useState({ kaufpreis: '', nebenkosten: '', kaltmiete: '', instandhalt: '1', verwaltung: '', leerstand: '3' })
  const [wertForm, setWertForm] = useState({ flaeche: '', qmpreis: '', zustand: '100' })

  // Notification
  const [activeNotif, setActiveNotif] = useState(null)
  const [dismissedNotifs, setDismissedNotifs] = useState([])

  // PWA
  const [pwaPrompt, setPwaPrompt] = useState(null)
  const [pwaInstalled, setPwaInstalled] = useState(false)

  useEffect(() => {
    if (!authLoading && !session) router.push('/auth')
  }, [session, authLoading, router])

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPwaPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setPwaInstalled(true))
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) setPwaInstalled(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const load = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const uid = session.user.id
    const [o, a, n, z, s, d, sb, se, sv, vv] = await Promise.all([
      supabase.from('objekte').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('aufgaben').select('*').eq('user_id', uid).eq('erledigt', false).order('faellig'),
      supabase.from('nachrichten').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('zahlungen').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('sanierungen').select('*').eq('user_id', uid).order('datum', { ascending: false }),
      supabase.from('dokumente').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('steuerberater').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('steuerberater_exports').select('*').eq('user_id', uid).order('gesendet_at', { ascending: false }),
      supabase.from('steuerberater_verzeichnis').select('*').eq('aktiv', true).order('partner_status'),
      supabase.from('vertragsvorlagen').select('*').eq('aktiv', true).order('sortierung'),
    ])
    setObjekte(o.data || [])
    setAufgaben(a.data || [])
    setNachrichten(n.data || [])
    setZahlungen(z.data || [])
    setSanierungen(s.data || [])
    setDokumente(d.data || [])
    setStb(sb.data || null)
    if (sb.data) setStbForm(sb.data)
    setStbExports(se.data || [])
    setStbVerzeichnis(sv.data || [])
    setVorlagen(vv.data || [])
    setLoading(false)
  }, [session])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!aufgaben.length) return
    const urgent = aufgaben.find(a => {
      const d = daysUntil(a.faellig)
      return d !== null && d <= 7 && d >= 0 && !dismissedNotifs.includes(a.id)
    })
    if (urgent) {
      const t = setTimeout(() => setActiveNotif(urgent), 1500)
      return () => clearTimeout(t)
    }
  }, [aufgaben, dismissedNotifs])

  // Computed
  const vermietete = objekte.filter(o => o.status === 'vermietet')
  const monatsEin = vermietete.reduce((s, o) => s + (o.kaltmiete || 0) + (o.nebenkosten || 0), 0)
  const offeneAuf = aufgaben.filter(a => !a.erledigt)
  const ungelesen = nachrichten.filter(n => !n.gelesen).length
  const dringendeAuf = offeneAuf.filter(a => { const d = daysUntil(a.faellig); return d !== null && d <= 14 })

  // Rendite calc
  const rendite = useMemo(() => {
    const kp = parseFloat(rendForm.kaufpreis) || 0
    const nk = parseFloat(rendForm.nebenkosten) || 0
    const km = parseFloat(rendForm.kaltmiete) || 0
    const ih = parseFloat(rendForm.instandhalt) || 1
    const vw = parseFloat(rendForm.verwaltung) || 0
    const ls = parseFloat(rendForm.leerstand) || 0
    if (!kp || !km) return null
    const gesamtkosten = kp + nk
    const jahresMiete = km * 12
    const instandhaltung = kp * (ih / 100)
    const leerstandkosten = jahresMiete * (ls / 100)
    const jahresVerwaltung = vw * 12
    const nettoEinnahmen = jahresMiete - instandhaltung - jahresVerwaltung - leerstandkosten
    const brutto = (jahresMiete / gesamtkosten) * 100
    const netto = (nettoEinnahmen / gesamtkosten) * 100
    return { brutto, netto, jahresMiete, nettoEinnahmen, gesamtkosten, instandhaltung, leerstandkosten }
  }, [rendForm])

  // Wert calc
  const wertschaetzung = useMemo(() => {
    const fl = parseFloat(wertForm.flaeche) || 0
    const qm = parseFloat(wertForm.qmpreis) || 0
    const zu = parseFloat(wertForm.zustand) || 100
    if (!fl || !qm) return null
    const grundwert = fl * qm
    const zustandFactor = zu / 100
    const schaetzung = grundwert * zustandFactor
    return { grundwert, schaetzung, min: schaetzung * 0.85, max: schaetzung * 1.15 }
  }, [wertForm])

  // Save functions
  async function uploadObjectImage(file) {
    if (!file) return null
    try {
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/${Date.now()}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('dokumente').upload(path, file, { upsert: false })
      if (error) { console.error('Image upload:', error); return null }
      const { data: urlData } = supabase.storage.from('dokumente').getPublicUrl(path)
      return urlData?.publicUrl || null
    } catch (e) { console.error(e); return null }
  }

  async function saveObjekt() {
    if (!form.adresse) { toast('Bitte Adresse eingeben'); return }
    if (uploading) return
    setUploading(true)
    try {
      let bild_url = form.bild_url || null
      if (uploadImage) {
        const url = await uploadObjectImage(uploadImage)
        if (url) bild_url = url
      }
      const data = {
        user_id: session.user.id,
        adresse: form.adresse,
        plz: form.plz || null,
        stadt: form.stadt || null,
        typ: form.typ || 'Wohnung',
        flaeche: parseFloat(form.flaeche) || null,
        zimmer: parseFloat(form.zimmer) || null,
        kaltmiete: parseFloat(form.kaltmiete) || 0,
        nebenkosten: parseFloat(form.nebenkosten) || 0,
        kaution: parseFloat(form.kaution) || 0,
        baujahr: parseInt(form.baujahr) || null,
        kaufpreis: parseFloat(form.kaufpreis) || null,
        mieter_name: form.mieter_name || null,
        mieter_email: form.mieter_email || null,
        mieter_tel: form.mieter_tel || null,
        mieter_seit: form.mieter_seit || null,
        notizen: form.notizen || null,
        bild_url,
        status: form.mieter_name ? 'vermietet' : 'leer',
        name: form.adresse,
        updated_at: new Date().toISOString()
      }
      if (editMode && sel) {
        const { error } = await supabase.from('objekte').update(data).eq('id', sel.id)
        if (error) { console.error(error); toast('Fehler: ' + error.message); setUploading(false); return }
        toast('✓ Objekt aktualisiert')
      } else {
        const { data: ins, error } = await supabase.from('objekte').insert(data).select().single()
        if (error) { console.error(error); toast('Fehler: ' + error.message); setUploading(false); return }
        if (ins) await createGesetzlicheFristen(ins.id)
        toast('✓ Objekt angelegt · Fristen automatisch erstellt')
      }
    } catch (e) {
      console.error(e)
      toast('Fehler beim Speichern')
    }
    setUploading(false)
    setModal(null); setEditMode(false); setForm({}); setUploadImage(null); load()
  }

  async function createGesetzlicheFristen(objekt_id) {
    const fristen = Object.entries(FRISTEN).map(([key, f]) => ({
      user_id: session.user.id,
      objekt_id,
      text: f.label,
      gesetz: f.gesetz,
      typ: 'gesetzlich',
      prioritaet: f.prioritaet,
      faellig: new Date(Date.now() + f.tage * 86400000).toISOString().split('T')[0]
    }))
    await supabase.from('aufgaben').insert(fristen)
  }

  async function saveAufgabe() {
    if (!form.text) { toast('Bitte Text eingeben'); return }
    const { error } = await supabase.from('aufgaben').insert({
      user_id: session.user.id,
      text: form.text,
      objekt_id: form.objekt_id || null,
      faellig: form.faellig || null,
      prioritaet: form.prioritaet || 'g',
      gesetz: form.gesetz || null,
      typ: form.typ || 'manuell'
    })
    if (error) { toast('Fehler: ' + error.message); return }
    toast('✓ Aufgabe gespeichert'); setModal(null); setForm({}); load()
  }

  async function saveNachricht() {
    if (!form.betreff) { toast('Bitte Betreff eingeben'); return }
    const { error } = await supabase.from('nachrichten').insert({
      user_id: session.user.id,
      objekt_id: form.objekt_id || null,
      mieter_name: form.mieter_name || null,
      betreff: form.betreff,
      text: form.text || null,
      gelesen: false
    })
    if (error) { toast('Fehler: ' + error.message); return }
    toast('✓ Gespeichert'); setModal(null); setForm({}); load()
  }

  async function saveZahlung() {
    if (!form.betrag) { toast('Bitte Betrag eingeben'); return }
    const { error } = await supabase.from('zahlungen').insert({
      user_id: session.user.id,
      objekt_id: form.objekt_id || null,
      betrag: parseFloat(form.betrag),
      monat: form.monat || null,
      status: form.status || 'ok',
      typ: form.typ || 'miete',
      notiz: form.notiz || null
    })
    if (error) { toast('Fehler: ' + error.message); return }
    toast('✓ Zahlung gespeichert'); setModal(null); setForm({}); load()
  }

  async function saveSanierung() {
    if (!form.typ || !sel) { toast('Pflichtfelder fehlen'); return }
    const { error } = await supabase.from('sanierungen').insert({
      user_id: session.user.id,
      objekt_id: sel.id,
      typ: form.typ,
      datum: form.datum || null,
      kosten: parseFloat(form.kosten) || null,
      handwerker: form.handwerker || null,
      beschreibung: form.beschreibung || null
    })
    if (error) { toast('Fehler: ' + error.message); return }
    toast('✓ Sanierung gespeichert'); setModal(null); setForm({}); load()
  }

  async function saveDokument() {
    if (!form.name) { toast('Bitte Name eingeben'); return }
    if (uploading) return
    setUploading(true)
    let storage_path = null, url = form.url || null, groesse = form.groesse || null
    try {
      if (uploadFile) {
        const path = `${session.user.id}/${Date.now()}_${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data, error } = await supabase.storage.from('dokumente').upload(path, uploadFile, { upsert: false })
        if (error) {
          toast('ℹ️ Upload fehlgeschlagen — ' + error.message)
          setUploading(false)
          return
        } else {
          storage_path = data.path
          const { data: urlData } = supabase.storage.from('dokumente').getPublicUrl(path)
          url = urlData?.publicUrl || null
          groesse = `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`
        }
      }
      const { error } = await supabase.from('dokumente').insert({
        user_id: session.user.id,
        objekt_id: form.objekt_id || null,
        name: form.name,
        typ: form.typ || 'sonstiges',
        url,
        storage_path,
        groesse,
        notiz: form.notiz || null
      })
      if (error) { toast('Fehler: ' + error.message); setUploading(false); return }
      toast('✓ Im Tresor gespeichert 🔐')
      setModal(null); setForm({}); setUploadFile(null)
      load()
    } catch (e) {
      console.error(e)
      toast('Fehler')
    }
    setUploading(false)
  }

  async function erledigeAuf(id) {
    await supabase.from('aufgaben').update({ erledigt: true }).eq('id', id)
    toast('✓ Erledigt'); load()
  }

  async function deleteObjekt(id) {
    if (!confirm('Objekt wirklich löschen? Alle zugehörigen Daten werden entfernt.')) return
    await supabase.from('objekte').delete().eq('id', id)
    toast('Objekt gelöscht'); setModal(null); setSel(null); load()
  }

  async function deleteDokument(id) {
    await supabase.from('dokumente').delete().eq('id', id)
    toast('Dokument gelöscht'); load()
  }

  function nkBerechnen() {
    const total = nkItems.reduce((s, k) => s + (parseFloat(k.val) || 0), 0)
    const flm = parseFloat(nkForm.flm) || 1
    const flg = parseFloat(nkForm.flg) || 1
    const ratio = flm / flg
    const anteil = total * ratio
    const vz = parseFloat(nkForm.vz) || 0
    setNkResult({ total, ratio, anteil, vz, diff: anteil - vz })
    setNkStep(3)
  }

  function askHilfe(q) {
    if (!q) return
    const found = HILFE_THEMEN.find(h =>
      h.frage.toLowerCase().includes(q.toLowerCase()) ||
      q.toLowerCase().includes(h.id) ||
      q.toLowerCase().split(' ').some(w => w.length > 3 && h.antwort.toLowerCase().includes(w))
    )
    setHilfeAnswer(found || { icon: '🤖', frage: 'Keine direkte Antwort', antwort: 'Für diese spezifische Frage empfehlen wir einen Fachanwalt oder Steuerberater. Häufige Themen findest du unten.', link: null })
  }

  function searchHandwerker() {
    const objInfo = sel ? `${sel.plz || ''} ${sel.stadt || ''}` : ''
    const q = encodeURIComponent(`${hwSearch || 'Handwerker'} ${objInfo}`)
    window.open(`https://www.google.com/maps/search/${q}`, '_blank')
  }

  async function saveStb() {
    if (!stbForm.name || !stbForm.email) { toast('Name und E-Mail sind Pflicht'); return }
    setStbSending(true)
    try {
      if (stb) {
        const { error } = await supabase.from('steuerberater').update({
          name: stbForm.name, kanzlei: stbForm.kanzlei, email: stbForm.email, telefon: stbForm.telefon,
          updated_at: new Date().toISOString()
        }).eq('id', stb.id)
        if (error) { toast('Fehler: ' + error.message); setStbSending(false); return }
      } else {
        const { data, error } = await supabase.from('steuerberater').insert({
          user_id: session.user.id,
          name: stbForm.name, kanzlei: stbForm.kanzlei, email: stbForm.email, telefon: stbForm.telefon,
        }).select().single()
        if (error) { toast('Fehler: ' + error.message); setStbSending(false); return }
        setStb(data)
      }
      toast('✓ Steuerberater gespeichert')
      load()
    } catch (e) { toast('Fehler') }
    setStbSending(false)
  }

  function generateStbReport() {
    if (!stb || !stb.email) { toast('Bitte zuerst Steuerberater eintragen'); return }
    const year = new Date().getFullYear() - 1

    // Filter Daten für das Jahr
    const jahrZahlungen = zahlungen.filter(z => {
      if (!z.monat) return true
      return z.monat.includes(String(year))
    })
    const jahrSan = sanierungen.filter(s => s.datum && s.datum.startsWith(String(year)))
    const jahrGesamtMiete = jahrZahlungen.filter(z => z.status === 'ok').reduce((s, z) => s + (z.betrag || 0), 0)
    const jahrGesamtSan = jahrSan.reduce((sum, s) => sum + (s.kosten || 0), 0)

    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Vermieter-Report ${year} · ${session.user.email}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: A4; margin: 16mm 14mm; }
      html, body { background: #fff; }
      body { font-family: 'Helvetica Neue', -apple-system, 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.5; }
      .wrap { max-width: 182mm; margin: 0 auto; }

      /* HEADER */
      .hdr { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18pt; margin-bottom: 28pt; border-bottom: 3pt solid #d4af6a; }
      .brand { font-size: 26pt; font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: #111; }
      .brand span { color: #d4af6a; }
      .brand-sub { font-size: 8pt; color: #888; text-transform: uppercase; letter-spacing: 0.14em; margin-top: 6pt; font-weight: 600; }
      .meta { text-align: right; font-size: 9pt; color: #555; line-height: 1.7; }
      .meta-year { display: inline-block; padding: 3pt 10pt; background: #111; color: #fff; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; border-radius: 3pt; text-transform: uppercase; margin-bottom: 6pt; }

      /* HERO TITLE */
      .title-block { margin-bottom: 28pt; }
      h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; color: #111; margin-bottom: 8pt; }
      .recipient { font-size: 10pt; color: #555; line-height: 1.7; }
      .recipient strong { color: #111; font-weight: 600; }

      /* NOTICE BOX */
      .notice { padding: 12pt 16pt; margin-bottom: 24pt; background: #fafafa; border-left: 3pt solid #d4af6a; font-size: 9pt; color: #555; line-height: 1.7; border-radius: 0 4pt 4pt 0; }
      .notice strong { color: #111; }

      /* KPI ROW */
      .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8pt; margin-bottom: 32pt; }
      .kpi { padding: 14pt 12pt; background: #fff; border: 0.5pt solid #e5e5e5; border-radius: 6pt; }
      .kpi.primary { background: #111; border-color: #111; }
      .kpi.primary .kv { color: #fff; }
      .kpi.primary .kl { color: rgba(255,255,255,0.7); }
      .kpi.accent { background: #fffbf0; border-color: #d4af6a; }
      .kv { font-size: 22pt; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4pt; color: #111; font-variant-numeric: tabular-nums; }
      .kl { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; color: #888; }

      /* SECTIONS */
      h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #d4af6a; margin-top: 28pt; margin-bottom: 12pt; }
      h2::after { content: ''; display: block; width: 40pt; height: 2pt; background: #d4af6a; margin-top: 6pt; }

      /* TABLES */
      table { width: 100%; border-collapse: collapse; margin-bottom: 4pt; font-size: 9pt; }
      thead tr { border-bottom: 1pt solid #111; }
      th { padding: 10pt 8pt 8pt; text-align: left; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #555; }
      th:last-child, td.num { text-align: right; }
      tbody tr { border-bottom: 0.5pt solid #eee; }
      tbody tr:last-child { border-bottom: none; }
      td { padding: 10pt 8pt; vertical-align: top; }
      td.num { font-variant-numeric: tabular-nums; font-weight: 500; }
      td.strong { font-weight: 600; color: #111; }
      td.muted { color: #888; font-size: 8.5pt; }
      tr.summary td { padding-top: 12pt; padding-bottom: 12pt; font-weight: 700; border-top: 1pt solid #111; background: #fafafa; font-size: 9.5pt; }

      /* EMPTY STATE */
      .empty { padding: 16pt; font-size: 9pt; color: #888; font-style: italic; text-align: center; background: #fafafa; border-radius: 4pt; }

      /* SIGNATURE / FOOTER */
      .footer { margin-top: 40pt; padding-top: 14pt; border-top: 0.5pt solid #e5e5e5; font-size: 8pt; color: #888; line-height: 1.7; }
      .footer strong { color: #111; }

      /* PRINT TWEAKS */
      @media print {
        .no-print { display: none; }
      }
    </style></head><body>
    <div class="wrap">

      <div class="hdr">
        <div>
          <div class="brand">Immo<span>NIQ</span></div>
          <div class="brand-sub">Vermieter-Report für den Steuerberater</div>
        </div>
        <div class="meta">
          <div class="meta-year">Steuerjahr ${year}</div><br>
          Erstellt am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br>
          ${session.user.email}
        </div>
      </div>

      <div class="title-block">
        <h1>Portfolio-Übersicht ${year}</h1>
        <div class="recipient">
          Adressiert an: <strong>${stb.name}</strong>${stb.kanzlei ? `, ${stb.kanzlei}` : ''}<br>
          ${stb.email}${stb.telefon ? ` · ${stb.telefon}` : ''}
        </div>
      </div>

      <div class="notice">
        <strong>Arbeitshilfe — keine Steuererklärung.</strong> Dieser Report fasst die in ImmoNIQ erfassten Daten strukturiert zusammen. Die steuerrechtliche Bewertung und Feststellung der Einkünfte aus Vermietung und Verpachtung (§ 21 EStG) — insbesondere Anschaffungsnahe Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG), AfA-Satz (§ 7 EStG), Sonder-AfA (§ 7b EStG) sowie Grundstücks- und Gebäudeanteil — erfolgt durch den Steuerberater.
      </div>

      <div class="kpis">
        <div class="kpi primary">
          <div class="kv">${objekte.length}</div>
          <div class="kl">Objekte gesamt</div>
        </div>
        <div class="kpi">
          <div class="kv">${vermietete.length}</div>
          <div class="kl">Vermietet</div>
        </div>
        <div class="kpi accent">
          <div class="kv">${feK(jahrGesamtMiete)}</div>
          <div class="kl">Zahlungseingänge</div>
        </div>
        <div class="kpi">
          <div class="kv">${feK(jahrGesamtSan)}</div>
          <div class="kl">Sanierungen</div>
        </div>
      </div>

      <h2>01 · Immobilien-Stammdaten</h2>
      <table>
        <thead>
          <tr>
            <th>Adresse</th>
            <th>Baujahr</th>
            <th>Fläche</th>
            <th>Kaufpreis</th>
            <th>Kaltmiete/Mo</th>
            <th>NK/Mo</th>
          </tr>
        </thead>
        <tbody>
          ${objekte.length === 0 ? `<tr><td colspan="6" class="empty">Keine Objekte erfasst.</td></tr>` :
            objekte.map(o => `<tr>
              <td class="strong">${o.adresse || '—'}<br><span class="muted">${o.plz || ''} ${o.stadt || ''}</span></td>
              <td>${o.baujahr || '—'}</td>
              <td class="num">${o.flaeche ? o.flaeche + ' m²' : '—'}</td>
              <td class="num">${fe(o.kaufpreis)}</td>
              <td class="num">${fe(o.kaltmiete)}</td>
              <td class="num">${fe(o.nebenkosten)}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <h2>02 · Zahlungseingänge ${year}</h2>
      ${jahrZahlungen.length === 0 ? `<div class="empty">Keine Zahlungen im Steuerjahr ${year} erfasst.</div>` : `<table>
        <thead>
          <tr>
            <th>Objekt</th>
            <th>Monat</th>
            <th>Typ</th>
            <th>Status</th>
            <th>Betrag</th>
          </tr>
        </thead>
        <tbody>
          ${jahrZahlungen.map(z => {
            const obj = objekte.find(o => o.id === z.objekt_id)
            return `<tr>
              <td>${obj?.adresse || '—'}</td>
              <td>${z.monat || '—'}</td>
              <td>${z.typ === 'miete' ? 'Miete' : z.typ === 'nk' ? 'NK' : 'Sonstiges'}</td>
              <td>${z.status === 'ok' ? '✓ Eingegangen' : z.status === 'offen' ? '⚠ Offen' : z.status || '—'}</td>
              <td class="num">${fe(z.betrag)}</td>
            </tr>`
          }).join('')}
          <tr class="summary"><td colspan="4">Summe Einnahmen</td><td class="num">${fe(jahrZahlungen.reduce((s, z) => s + (z.betrag || 0), 0))}</td></tr>
        </tbody>
      </table>`}

      <h2>03 · Sanierungen & Erhaltungsaufwand ${year}</h2>
      ${jahrSan.length === 0 ? `<div class="empty">Keine Sanierungen im Steuerjahr ${year} erfasst.</div>` : `<table>
        <thead>
          <tr>
            <th>Objekt</th>
            <th>Art</th>
            <th>Handwerker</th>
            <th>Datum</th>
            <th>Kosten</th>
          </tr>
        </thead>
        <tbody>
          ${jahrSan.map(s => {
            const obj = objekte.find(o => o.id === s.objekt_id)
            return `<tr>
              <td>${obj?.adresse || '—'}</td>
              <td class="strong">${s.typ || '—'}</td>
              <td>${s.handwerker || '—'}</td>
              <td>${fd(s.datum)}</td>
              <td class="num">${fe(s.kosten)}</td>
            </tr>`
          }).join('')}
          <tr class="summary"><td colspan="4">Summe Aufwand</td><td class="num">${fe(jahrGesamtSan)}</td></tr>
        </tbody>
      </table>`}

      <h2>04 · Hinweise für die Steuererklärung</h2>
      <div style="font-size: 9pt; color: #555; line-height: 1.8; padding: 12pt 14pt; background: #fafafa; border-radius: 4pt;">
        • <strong>Anschaffungsnahe Herstellungskosten</strong> (§ 6 Abs. 1 Nr. 1a EStG): Reparaturen in den ersten drei Jahren nach Anschaffung &gt; 15% der Gebäude-AK sind zu aktivieren.<br>
        • <strong>AfA-Wahl</strong>: Bei Neubauten ab 01.10.2023 ist die degressive AfA (§ 7 Abs. 5a EStG, 5%) zu prüfen.<br>
        • <strong>Grundstücksanteil</strong>: Ist ggf. anhand Bodenrichtwert zu verifizieren (Gutachterausschuss).<br>
        • <strong>Sonder-AfA § 7b EStG</strong>: Nur bei Neubau-Mietwohnungen mit Bauantrag 2023–2029 und unter Einhaltung der Baukostengrenzen anwendbar.<br>
        • Alle Belege aufbewahren gem. § 147 AO (10 Jahre).
      </div>

      <div class="footer">
        <strong>ImmoNIQ · immoniq.net</strong> — Dieser Report wurde automatisch generiert aus den vom Vermieter in ImmoNIQ erfassten Daten. Bei technischen Rückfragen: leonboomgaarden@gmail.com.<br>
        Stand: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} · Generiert für ${session.user.email}
      </div>

    </div>
    </body></html>`)
    w.document.close()

    // Log den Export
    supabase.from('steuerberater_exports').insert({
      user_id: session.user.id,
      stb_email: stb.email,
      jahr: year
    }).then(() => load())

    setTimeout(() => { w.print() }, 600)
    toast('✓ Report geöffnet — als PDF speichern und an ' + stb.email + ' senden')
  }

  async function installPWA() {
    if (!pwaPrompt) return
    pwaPrompt.prompt()
    const { outcome } = await pwaPrompt.userChoice
    if (outcome === 'accepted') setPwaInstalled(true)
    setPwaPrompt(null)
  }

  if (authLoading || !session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 20 }}>Immo<span style={{ color: G }}>NIQ</span></div>
        <div style={{ width: 22, height: 22, border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: G, borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  )

  // Nav Tabs
  const tabs = [
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'objekte', icon: '🏗', label: 'Objekte', badge: objekte.length },
    { id: 'finanzen', icon: '₿', label: 'Finanzen' },
    { id: 'rechner', icon: '🧮', label: 'Rechner' },
    { id: 'fristen', icon: '⏰', label: 'Fristen', badge: dringendeAuf.length, badgeRed: true },
    { id: 'nachrichten', icon: '✉', label: 'Nachrichten', badge: ungelesen },
    { id: 'tresor', icon: '🔐', label: 'Tresor' },
    { id: 'vorlagen', icon: '📜', label: 'Vorlagen' },
    { id: 'handwerker', icon: '🔨', label: 'Handwerker' },
    { id: 'steuerberater', icon: '👔', label: 'Steuerberater', divider: true },
    { id: 'hilfe', icon: '🤖', label: 'Hilfe' },
  ]

  const mobileTabs = [
    { id: 'dashboard', icon: '⌂', label: 'Home' },
    { id: 'objekte', icon: '🏗', label: 'Objekte' },
    { id: 'rechner', icon: '🧮', label: 'Rechner' },
    { id: 'tresor', icon: '🔐', label: 'Tresor' },
    { id: 'more', icon: '☰', label: 'Mehr' },
  ]

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '22px 18px 16px', borderBottom: '0.5px solid var(--line)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em' }}>Immo<span style={{ color: G }}>NIQ</span></div>
        </div>
        <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {tabs.map(t => (
            <div key={t.id}>
              {t.divider && <div style={{ height: '0.5px', background: 'var(--line)', margin: '10px 16px' }} />}
              <button className={`nav-item${tab === t.id ? ' active' : ''}`} onClick={() => { if (t.id === 'steuer') { router.push('/steuer') } else { setTab(t.id) } }}>
                <span className="nav-icon">{t.icon}</span>
                <span style={{ flex: 1 }}>{t.label}</span>
                {t.badge > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: t.badgeRed ? 'rgba(255,69,58,0.15)' : 'var(--gp)', color: t.badgeRed ? 'var(--red)' : G, minWidth: 18, textAlign: 'center' }}>{t.badge}</span>
                )}
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 16px', borderTop: '0.5px solid var(--line)' }}>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 2, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.email}</div>
          <div style={{ fontSize: 12, color: G, marginBottom: 10, fontWeight: 500 }}>Pro-Zugang</div>
          {pwaPrompt && !pwaInstalled && (
            <button className="nav-item" style={{ color: G, background: 'var(--gp)', border: '0.5px solid var(--gb)', marginBottom: 4 }} onClick={installPWA}>
              <span className="nav-icon">📱</span>Als App installieren
            </button>
          )}
          <button className="nav-item" style={{ color: 'var(--t3)' }} onClick={async () => { await supabase.auth.signOut(); router.push('/') }}>
            <span className="nav-icon">→</span>Abmelden
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileNav && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} onClick={() => setMobileNav(false)} />
          <div className="sidebar" style={{ position: 'fixed', inset: 0, zIndex: 300, width: 280, display: 'flex', animation: 'slideInRight 0.3s ease' }}>
            <div style={{ padding: '22px 18px 16px', borderBottom: '0.5px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em' }}>Immo<span style={{ color: G }}>NIQ</span></div>
              <button style={{ color: 'var(--t3)', fontSize: 22 }} onClick={() => setMobileNav(false)}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
              {tabs.map(t => (
                <div key={t.id}>
                  {t.divider && <div style={{ height: '0.5px', background: 'var(--line)', margin: '10px 16px' }} />}
                  <button className={`nav-item${tab === t.id ? ' active' : ''}`} onClick={() => { if (t.id === 'steuer') { router.push('/steuer') } else { setTab(t.id); setMobileNav(false) } }}>
                    <span className="nav-icon">{t.icon}</span>
                    <span style={{ flex: 1 }}>{t.label}</span>
                    {t.badge > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: t.badgeRed ? 'rgba(255,69,58,0.15)' : 'var(--gp)', color: t.badgeRed ? 'var(--red)' : G }}>{t.badge}</span>}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 16px', borderTop: '0.5px solid var(--line)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.email}</div>
              <button className="nav-item" style={{ color: 'var(--t3)' }} onClick={async () => { await supabase.auth.signOut(); router.push('/') }}>
                <span className="nav-icon">→</span>Abmelden
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="mobile-topbar">
          <button style={{ color: 'var(--t1)', fontSize: 22, padding: 4 }} onClick={() => setMobileNav(true)}>☰</button>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em' }}>Immo<span style={{ color: G }}>NIQ</span></div>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>
            {(session.user.email || 'U')[0].toUpperCase()}
          </div>
        </div>

        {/* ─── DASHBOARD ─── */}
        {tab === 'dashboard' && (() => {
          const last6 = Array.from({ length: 6 }, (_, i) => {
            const d = new Date()
            d.setMonth(d.getMonth() - (5 - i))
            return { label: d.toLocaleDateString('de-DE', { month: 'short' }), value: i === 5 ? monatsEin : monatsEin * (0.7 + Math.random() * 0.3) }
          })
          const maxVal = Math.max(...last6.map(d => d.value), 1)
          return (
            <div className="page fade-in">
              <div className="page-header">
                <div className="page-eye">Guten Tag</div>
                <div className="page-title">Dein <span className="gold">Portfolio</span></div>
              </div>
              <div className="hero-kpi" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 500 }}>Monatliche Einnahmen</div>
                <div className="hero-kpi-val" style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6 }}>{feK(monatsEin)}</div>
                <div style={{ fontSize: 13, color: G, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
                  {vermietete.length} von {objekte.length} vermietet · Jahr: {feK(monatsEin * 12)}
                </div>
              </div>
              <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 18 }}>
                {[
                  [objekte.length, 'Objekte', 'var(--t1)'],
                  [vermietete.length, 'Vermietet', G],
                  [dringendeAuf.length, 'Dringend', dringendeAuf.length > 0 ? 'var(--red)' : 'var(--green)'],
                  [ungelesen, 'Neue Msg.', ungelesen > 0 ? G : 'var(--t2)']
                ].map(([v, l, c]) => (
                  <div key={l} className="kpi"><div className="kpi-val" style={{ color: c }}>{v}</div><div className="kpi-lbl">{l}</div></div>
                ))}
              </div>

              {/* Chart */}
              <div className="card card-p" style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Einnahmen-Trend</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>Letzte 6 Monate</div>
                </div>
                <div className="chart-bar">
                  {last6.map((d, i) => (
                    <div key={i} className="chart-col">
                      <div style={{ fontSize: 11, color: i === 5 ? G : 'var(--t3)', fontWeight: 600, marginBottom: 2 }}>{Math.round(d.value)}€</div>
                      <div className={`chart-bar-fill ${i < 5 ? 'muted' : ''}`} style={{ height: `${(d.value / maxVal) * 100}%` }} />
                      <div className="chart-label">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="page-2col">
                <div>
                  <div className="sec">Dringende Fristen <button className="sec-btn" onClick={() => setTab('fristen')}>Alle →</button></div>
                  <div className="card card-p">
                    {loading ? <Loader /> : offeneAuf.length === 0 ? <Empty icon="✓" text="Keine offenen Aufgaben" /> :
                      offeneAuf.slice(0, 5).map(a => {
                        const d = daysUntil(a.faellig)
                        return (
                          <div key={a.id} className="row-item">
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.prioritaet === 'r' ? 'var(--red)' : a.prioritaet === 'y' ? G : 'var(--green)', flexShrink: 0, marginTop: 7 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                              {a.gesetz && <div style={{ fontSize: 11, color: G, marginTop: 2 }}>{a.gesetz}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                              {d !== null && (
                                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: d <= 7 ? 'rgba(255,69,58,0.12)' : d <= 30 ? 'var(--gp)' : 'rgba(255,255,255,0.05)', color: d <= 7 ? 'var(--red)' : d <= 30 ? G : 'var(--t3)', fontWeight: 600 }}>{d <= 0 ? 'Heute' : `${d}T`}</span>
                              )}
                              <button style={{ color: G, fontSize: 16, padding: 4 }} onClick={() => erledigeAuf(a.id)}>✓</button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
                <div>
                  <div className="sec">Objekte <button className="sec-btn" onClick={() => { setForm({ typ: 'Wohnung' }); setEditMode(false); setUploadImage(null); setModal('add-obj') }}>+ Neu</button></div>
                  {loading ? <div className="card card-p"><Loader /></div> :
                    objekte.length === 0 ? (
                      <div className="card card-p">
                        <Empty icon="🏠" text="Noch keine Objekte">
                          <Btn gold full onClick={() => { setForm({ typ: 'Wohnung' }); setModal('add-obj') }} style={{ marginTop: 14 }}>+ Erstes Objekt anlegen</Btn>
                        </Empty>
                      </div>
                    ) : objekte.slice(0, 3).map(o => (
                      <div key={o.id} className="card card-p card-hover" onClick={() => { setSel(o); setModal('obj-detail') }} style={{ marginBottom: 10, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          {o.bild_url ? (
                            <img src={o.bild_url} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gp)', border: '0.5px solid var(--gb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{ICONS[o.typ] || '🏠'}</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.adresse}</div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{o.plz} {o.stadt}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 17, fontWeight: 700, color: G, letterSpacing: '-0.03em' }}>{feK((o.kaltmiete || 0) + (o.nebenkosten || 0))}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="sec" style={{ marginTop: 28 }}>Schnellaktionen</div>
              <div className="act-grid act-grid-4">
                {[
                  ['🧾', 'NK-Abrechnung', 'Erstellen & drucken', () => { if (!objekte.length) { toast('Zuerst Objekt anlegen'); return } setSel(objekte[0]); setNkStep(1); setNkItems([]); setNkResult(null); setModal('nk') }],
                  ['🧮', 'Rendite', 'Rendite-Rechner', () => setTab('rechner')],
                  ['👔', 'Steuerberater', 'Report senden', () => setTab('steuerberater')],
                  ['🔐', 'Tresor', 'Dokument speichern', () => { setForm({ typ: 'sonstiges' }); setUploadFile(null); setModal('add-dok') }],
                ].map(([ic, l, sub, fn]) => (
                  <button key={l} className="act-card" onClick={fn}>
                    <div className="act-ic">{ic}</div>
                    <div className="act-lbl">{l}</div>
                    <div className="act-sub">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ─── OBJEKTE ─── */}
        {tab === 'objekte' && (
          <div className="page fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <div><div className="page-eye">Portfolio</div><div className="page-title">Meine <span className="gold">Objekte</span></div></div>
              <Btn gold onClick={() => { setForm({ typ: 'Wohnung' }); setEditMode(false); setUploadImage(null); setModal('add-obj') }}>+ Objekt hinzufügen</Btn>
            </div>
            <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 18 }}>
              {[
                [objekte.length, 'Gesamt', 'var(--t1)'],
                [vermietete.length, 'Vermietet', G],
                [objekte.length - vermietete.length, 'Leerstand', 'var(--red)'],
                [feK(monatsEin), 'Monat', G]
              ].map(([v, l, c]) => (
                <div key={l} className="kpi"><div className="kpi-val" style={{ color: c }}>{v}</div><div className="kpi-lbl">{l}</div></div>
              ))}
            </div>
            {loading ? <Loader /> : objekte.length === 0 ? (
              <div className="card card-p"><Empty icon="🏠" text="Noch keine Objekte" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {objekte.map(o => (
                  <div key={o.id} className="card card-hover fade-in" onClick={() => { setSel(o); setModal('obj-detail') }} style={{ overflow: 'hidden' }}>
                    {o.bild_url ? (
                      <img src={o.bild_url} alt={o.adresse} style={{ width: '100%', height: 160, objectFit: 'cover', borderBottom: '0.5px solid var(--line)' }} />
                    ) : (
                      <div style={{ height: 120, background: 'linear-gradient(135deg, var(--bg3), var(--bg4))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, borderBottom: '0.5px solid var(--line)' }}>{ICONS[o.typ] || '🏠'}</div>
                    )}
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{o.adresse}</div>
                        <span className={`tag ${o.status === 'vermietet' ? 'tag-green' : 'tag-red'}`}>{o.status === 'vermietet' ? 'Vermietet' : 'Leer'}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 14 }}>{o.plz} {o.stadt}{o.flaeche ? ` · ${o.flaeche} m²` : ''}{o.zimmer ? ` · ${o.zimmer} Zi.` : ''}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '0.5px solid var(--line2)' }}>
                        <span style={{ fontSize: 13, color: 'var(--t2)' }}>{o.mieter_name || 'Kein Mieter'}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: G, letterSpacing: '-0.03em' }}>{feK((o.kaltmiete || 0) + (o.nebenkosten || 0))}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)' }}>/Mo</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── FINANZEN ─── */}
        {tab === 'finanzen' && (
          <div className="page fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <div><div className="page-eye">Übersicht</div><div className="page-title">Finanzen & <span className="gold">Zahlungen</span></div></div>
              <Btn gold onClick={() => { setForm({ status: 'ok' }); setModal('add-zahlung') }}>+ Zahlung</Btn>
            </div>
            <div className="hero-kpi" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Monatliche Einnahmen</div>
              <div className="hero-kpi-val" style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6 }}>{feK(monatsEin)}</div>
              <div style={{ fontSize: 13, color: G }}>Jahresschätzung: {feK(monatsEin * 12)}</div>
            </div>
            <div className="card card-p">
              {zahlungen.length === 0 ? <Empty icon="💰" text="Noch keine Zahlungen" /> :
                zahlungen.slice(0, 20).map(z => (
                  <div key={z.id} className="row-item">
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: z.status === 'ok' ? 'var(--greenp)' : 'var(--redp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{z.status === 'ok' ? '✓' : '!'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{z.notiz || 'Mietzahlung'}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>{z.monat}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: z.status === 'ok' ? 'var(--green)' : 'var(--red)' }}>{fe(z.betrag)}</div>
                  </div>
                ))
              }
            </div>
            <Btn gold full style={{ marginTop: 14 }} onClick={() => router.push('/steuer')}>📊 Steuer (Anlage V) →</Btn>
          </div>
        )}

        {/* ─── RECHNER (neu!) ─── */}
        {tab === 'rechner' && (
          <div className="page fade-in">
            <div className="page-header">
              <div className="page-eye">Analyse-Tools</div>
              <div className="page-title">Rendite- & <span className="gold">Wertrechner</span></div>
            </div>

            <div className="page-2col">
              {/* Rendite */}
              <div>
                <div className="sec">💹 Mietrendite berechnen</div>
                <div className="card card-p">
                  <F label="Kaufpreis € *">
                    <NumberField value={rendForm.kaufpreis} onChange={v => setRendForm(p => ({ ...p, kaufpreis: v }))} placeholder="250000" />
                  </F>
                  <F label="Erwerbsnebenkosten €" hint="Grunderwerbsteuer, Notar, Makler, Grundbuch (ca. 10-15%)">
                    <NumberField value={rendForm.nebenkosten} onChange={v => setRendForm(p => ({ ...p, nebenkosten: v }))} placeholder="27000" />
                  </F>
                  <F label="Kaltmiete €/Monat *">
                    <NumberField value={rendForm.kaltmiete} onChange={v => setRendForm(p => ({ ...p, kaltmiete: v }))} placeholder="1050" />
                  </F>
                  <F label="Instandhaltung % p.a." hint="Faustregel 1% des Kaufpreises">
                    <NumberField value={rendForm.instandhalt} onChange={v => setRendForm(p => ({ ...p, instandhalt: v }))} placeholder="1" />
                  </F>
                  <F label="Verwaltung €/Monat" hint="Z.B. Hausverwalter oder WEG-Verwaltung">
                    <NumberField value={rendForm.verwaltung} onChange={v => setRendForm(p => ({ ...p, verwaltung: v }))} placeholder="30" />
                  </F>
                  <F label="Leerstand/Mietausfall % p.a." hint="Üblich 2-4%">
                    <NumberField value={rendForm.leerstand} onChange={v => setRendForm(p => ({ ...p, leerstand: v }))} placeholder="3" />
                  </F>

                  {rendite && (
                    <div className="fade-in" style={{ marginTop: 20, padding: 20, background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Brutto</div>
                          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: rendite.brutto >= 4 ? 'var(--green)' : 'var(--t1)' }}>{rendite.brutto.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: G, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 600 }}>Netto</div>
                          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: rendite.netto >= 3 ? 'var(--green)' : rendite.netto >= 1 ? G : 'var(--red)' }}>{rendite.netto.toFixed(2)}%</div>
                        </div>
                      </div>
                      <div className="dr-list">
                        <div className="dr"><span className="dr-l">Gesamtkosten</span><span className="dr-v">{feK(rendite.gesamtkosten)}</span></div>
                        <div className="dr"><span className="dr-l">Jahresmiete brutto</span><span className="dr-v" style={{ color: 'var(--green)' }}>{feK(rendite.jahresMiete)}</span></div>
                        <div className="dr"><span className="dr-l">- Instandhaltung</span><span className="dr-v" style={{ color: 'var(--red)' }}>-{feK(rendite.instandhaltung)}</span></div>
                        <div className="dr"><span className="dr-l">- Leerstandsrisiko</span><span className="dr-v" style={{ color: 'var(--red)' }}>-{feK(rendite.leerstandkosten)}</span></div>
                        <div className="dr"><span className="dr-l">Netto-Einnahmen p.a.</span><span className="dr-v" style={{ color: G, fontWeight: 700 }}>{feK(rendite.nettoEinnahmen)}</span></div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 14, lineHeight: 1.5 }}>
                        💡 <strong style={{ color: 'var(--t2)' }}>Richtwerte:</strong> Brutto-Rendite &gt;4% gut, &gt;6% sehr gut. Steuer & Finanzierung nicht berücksichtigt.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Wertrechner */}
              <div>
                <div className="sec">🏠 Immobilienwert schätzen</div>
                <div className="card card-p">
                  <div style={{ background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.25)', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>
                    ⚠️ <strong style={{ color: 'var(--t1)' }}>Grobe Schätzung ohne Haftung.</strong> Keine Ersatz für ein Sachverständigengutachten.
                  </div>
                  <F label="Fläche m² *">
                    <NumberField value={wertForm.flaeche} onChange={v => setWertForm(p => ({ ...p, flaeche: v }))} placeholder="68" />
                  </F>
                  <F label="Aktueller qm-Preis in € *" hint="Recherchiere bei deinem Gutachterausschuss oder über BORIS-D (offizieller Bodenrichtwert-Service)">
                    <NumberField value={wertForm.qmpreis} onChange={v => setWertForm(p => ({ ...p, qmpreis: v }))} placeholder="3800" />
                  </F>
                  <F label="Zustandsfaktor %" hint="100% = marktüblich · 80% = renovierungsbedürftig · 120% = neuwertig">
                    <select value={wertForm.zustand} onChange={e => setWertForm(p => ({ ...p, zustand: e.target.value }))}>
                      <option value="120">120% - Neuwertig / Kernsaniert</option>
                      <option value="110">110% - Sehr gut</option>
                      <option value="100">100% - Gut / Marktüblich</option>
                      <option value="90">90% - Renovierungsbedürftig</option>
                      <option value="80">80% - Stark renovierungsbedürftig</option>
                      <option value="70">70% - Sanierungsbedürftig</option>
                    </select>
                  </F>

                  {wertschaetzung && (
                    <div className="fade-in" style={{ marginTop: 20, padding: 20, background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 16 }}>
                      <div style={{ fontSize: 11, color: G, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Geschätzter Wert</div>
                      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6 }}>{feK(wertschaetzung.schaetzung)}</div>
                      <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 14 }}>Bandbreite: {feK(wertschaetzung.min)} – {feK(wertschaetzung.max)}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
                        Für eine genaue Wertermittlung wende dich an einen Sachverständigen oder den örtlichen Gutachterausschuss.
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 14 }}>
                    <a href="https://www.gutachterausschuss-online.de/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, display: 'block', marginBottom: 6 }}>→ Gutachterausschuss Deutschland</a>
                    <a href="https://www.bodenrichtwert-deutschland.de/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, display: 'block' }}>→ BORIS-D · Bodenrichtwerte Deutschland (offiziell)</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FRISTEN ─── */}
        {tab === 'fristen' && (
          <div className="page fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <div><div className="page-eye">Gesetzlich & Manuell</div><div className="page-title">Fristen & <span className="gold">Termine</span></div></div>
              <Btn gold onClick={() => { setForm({ prioritaet: 'y' }); setModal('add-auf') }}>+ Frist hinzufügen</Btn>
            </div>
            <div className="card card-p" style={{ marginBottom: 14, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                💡 <strong style={{ color: G }}>Gesetzliche Fristen</strong> werden automatisch beim Anlegen eines Objekts erstellt. Pop-up-Benachrichtigung bei Fristen ≤7 Tage.
              </div>
            </div>
            {loading ? <Loader /> : offeneAuf.length === 0 ? (
              <div className="card card-p"><Empty icon="✓" text="Keine offenen Fristen" /></div>
            ) : (
              <>
                {[
                  { label: 'Überfällig / Heute', filter: a => daysUntil(a.faellig) !== null && daysUntil(a.faellig) <= 0, color: 'var(--red)' },
                  { label: 'Nächste 14 Tage', filter: a => daysUntil(a.faellig) > 0 && daysUntil(a.faellig) <= 14, color: G },
                  { label: 'Nächste 3 Monate', filter: a => daysUntil(a.faellig) > 14 && daysUntil(a.faellig) <= 90, color: 'var(--t1)' },
                  { label: 'Später', filter: a => daysUntil(a.faellig) === null || daysUntil(a.faellig) > 90, color: 'var(--t3)' }
                ].map(({ label, filter, color }) => {
                  const items = offeneAuf.filter(filter)
                  if (!items.length) return null
                  return (
                    <div key={label}>
                      <div className="sec" style={{ color }}>{label} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({items.length})</span></div>
                      <div className="card card-p">
                        {items.map(a => {
                          const d = daysUntil(a.faellig)
                          const obj = objekte.find(o => o.id === a.objekt_id)
                          const fristMeta = Object.values(FRISTEN).find(f => f.gesetz === a.gesetz)
                          return (
                            <div key={a.id} className="row-item">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.prioritaet === 'r' ? 'var(--red)' : a.prioritaet === 'y' ? G : 'var(--green)', flexShrink: 0, marginTop: 7 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.text}</div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                                  {a.gesetz && (fristMeta?.link ? (
                                    <a href={fristMeta.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>{a.gesetz} →</a>
                                  ) : (
                                    <span style={{ fontSize: 11, color: G }}>{a.gesetz}</span>
                                  ))}
                                  {obj && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{obj.adresse}</span>}
                                  {a.typ === 'gesetzlich' && <span style={{ fontSize: 10, color: 'var(--t3)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 100 }}>Auto</span>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {a.faellig && <span style={{ fontSize: 12, color: 'var(--t3)' }}>{fd(a.faellig)}</span>}
                                {d !== null && (
                                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: d <= 0 ? 'rgba(255,69,58,0.15)' : d <= 14 ? 'var(--gp)' : 'rgba(255,255,255,0.05)', color: d <= 0 ? 'var(--red)' : d <= 14 ? G : 'var(--t3)', fontWeight: 600 }}>{d <= 0 ? 'Überfällig' : `${d}T`}</span>
                                )}
                                <button style={{ color: G, fontSize: 16, padding: 4 }} onClick={() => erledigeAuf(a.id)}>✓</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            <div className="sec" style={{ marginTop: 28 }}>Gesetzliche Intervalle — Klicken für Gesetzestext</div>
            <div className="kpi-grid kpi-grid-4">
              {Object.entries(FRISTEN).map(([key, f]) => (
                <a key={key} href={f.link} target="_blank" rel="noopener noreferrer" className="card card-p card-hover" style={{ padding: 16, textDecoration: 'none' }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--t1)' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: G }}>{f.gesetz} →</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>Alle {Math.round(f.tage / 365)} Jahr(e)</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ─── NACHRICHTEN ─── */}
        {tab === 'nachrichten' && (
          <div className="page fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <div><div className="page-eye">Kommunikation</div><div className="page-title">Nachrichten</div></div>
              <Btn gold onClick={() => { setForm({}); setModal('add-msg') }}>+ Neu</Btn>
            </div>
            <div className="card card-p">
              {loading ? <Loader /> : nachrichten.length === 0 ? <Empty icon="✉️" text="Noch keine Nachrichten" /> :
                nachrichten.map(n => (
                  <div key={n.id} className="row-item" style={{ cursor: 'pointer' }} onClick={async () => { await supabase.from('nachrichten').update({ gelesen: true }).eq('id', n.id); load() }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gp)', border: '0.5px solid var(--gb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: G, flexShrink: 0 }}>{initials(n.mieter_name || '?')}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{n.mieter_name || 'Mieter'}</span>
                        <span style={{ fontSize: 11, color: 'var(--t3)' }}>{new Date(n.created_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div style={{ fontSize: 14, marginBottom: 2, fontWeight: n.gelesen ? 400 : 600 }}>{n.betreff}</div>
                      {n.text && <div style={{ fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.text}</div>}
                    </div>
                    {!n.gelesen && <div style={{ width: 8, height: 8, borderRadius: '50%', background: G, flexShrink: 0, marginTop: 15 }} />}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ─── TRESOR ─── */}
        {tab === 'tresor' && (() => {
          const totalSize = dokumente.reduce((s, d) => s + (parseFloat(d.groesse) || 0), 0)
          return (
            <div className="page fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                <div><div className="page-eye">Verschlüsselt & DSGVO-konform</div><div className="page-title">Dokumenten-<span className="gold">Tresor</span></div></div>
                <Btn gold onClick={() => { setForm({ typ: 'sonstiges' }); setUploadFile(null); setModal('add-dok') }}>+ Dokument hinzufügen</Btn>
              </div>
              <div className="card card-p" style={{ marginBottom: 18, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 40 }}>🔐</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Dein digitaler Tresor — abgesichert wie eine Bank</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                      {dokumente.length} Dokumente · {totalSize.toFixed(1)} MB gespeichert
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--line2)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--t2)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 14, flexShrink: 0 }}>🔒</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 12 }}>AES-256</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Bank-Standard</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--t2)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 14, flexShrink: 0 }}>🇪🇺</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 12 }}>EU-Server</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Irland · DSGVO</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--t2)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 14, flexShrink: 0 }}>👤</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 12 }}>Nur du</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Row-Level Security</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--t2)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(48,209,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 14, flexShrink: 0 }}>🛡️</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 12 }}>TLS 1.3</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Übertragung</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category cards */}
              <div className="sec">Alle Kategorien</div>
              <div className="kpi-grid kpi-grid-4" style={{ marginBottom: 18 }}>
                {DOK_TYPEN.map(c => {
                  const count = dokumente.filter(d => d.typ === c.value).length
                  return (
                    <div key={c.value} className="card card-p card-hover" style={{ padding: 16 }} onClick={() => { setForm({ typ: c.value }); setUploadFile(null); setModal('add-dok') }}>
                      <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{count} Dokument{count !== 1 ? 'e' : ''}</div>
                    </div>
                  )
                })}
              </div>

              {/* Docs by category */}
              {DOK_TYPEN.map(cat => {
                const docs = dokumente.filter(d => d.typ === cat.value)
                if (!docs.length) return null
                return (
                  <div key={cat.value} style={{ marginBottom: 18 }}>
                    <div className="sec">{cat.icon} {cat.label} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({docs.length})</span></div>
                    <div className="card card-p">
                      {docs.map(d => (
                        <div key={d.id} className="row-item">
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cat.icon}</div>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#30d158', border: '2px solid var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>🔒</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {d.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                              {objekte.find(o => o.id === d.objekt_id)?.adresse || 'Kein Objekt'}
                              {d.groesse ? ` · ${d.groesse}` : ''} · {new Date(d.created_at).toLocaleDateString('de-DE')}
                            </div>
                            {d.notiz && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{d.notiz}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, fontWeight: 600 }}>Öffnen →</a>}
                            <button style={{ color: 'var(--t3)', fontSize: 14 }} onClick={() => deleteDokument(d.id)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {dokumente.length === 0 && (
                <div className="card card-p">
                  <Empty icon="🔐" text="Noch keine Dokumente im Tresor">
                    <Btn gold style={{ marginTop: 14 }} onClick={() => { setForm({ typ: 'sonstiges' }); setModal('add-dok') }}>Erstes Dokument hochladen</Btn>
                  </Empty>
                </div>
              )}
            </div>
          )
        })()}

        {/* ─── HANDWERKER ─── */}
        {tab === 'handwerker' && (
          <div className="page fade-in">
            <div className="page-header">
              <div className="page-eye">In deiner Region</div>
              <div className="page-title">Handwerker <span className="gold">finden</span></div>
            </div>
            <div className="card card-p" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>Direkte Suche über Google Maps — verifizierte Handwerker in deiner Nähe.</div>
              <F label="Gewerk">
                <TextField value={hwSearch} onChange={setHwSearch} placeholder="z.B. Heizung, Elektriker, Maler, Sanitär…" />
              </F>
              <F label="Objekt (für Standort)">
                <select value={sel?.id || ''} onChange={e => setSel(objekte.find(o => o.id === e.target.value) || null)}>
                  <option value="">Kein Objekt (allgemein)</option>
                  {objekte.map(o => <option key={o.id} value={o.id}>{o.adresse}, {o.plz} {o.stadt}</option>)}
                </select>
              </F>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {['Heizung', 'Elektriker', 'Maler', 'Sanitär', 'Dachdecker', 'Schlosser', 'Klima', 'Fliesenleger'].map(g => (
                  <Btn key={g} dark sm onClick={() => { setHwSearch(g); window.open(`https://www.google.com/maps/search/${encodeURIComponent(g + ' ' + (sel ? `${sel.plz || ''} ${sel.stadt || ''}` : ''))}`, '_blank') }}>{g}</Btn>
                ))}
              </div>
              <Btn gold full onClick={searchHandwerker}>🔍 In Google Maps suchen</Btn>
            </div>
            {sel && (
              <>
                <div className="sec">Sanierungshistorie: {sel.adresse} <button className="sec-btn" onClick={() => setModal('add-san')}>+ Eintragen</button></div>
                <div className="card card-p" style={{ marginBottom: 18 }}>
                  {sanierungen.filter(s => s.objekt_id === sel.id).length === 0 ? (
                    <Empty icon="🔨" text="Noch keine Einträge" />
                  ) : (
                    sanierungen.filter(s => s.objekt_id === sel.id).map(s => (
                      <div key={s.id} className="row-item">
                        <div style={{ fontSize: 22, flexShrink: 0 }}>🔨</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{s.typ}</div>
                          <div style={{ fontSize: 12, color: 'var(--t3)' }}>{s.handwerker}{s.kosten ? ` · ${fe(s.kosten)}` : ''}</div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--t3)' }}>{fd(s.datum)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="sec">Empfohlene Sanierungen — mit Quelle</div>
                <div className="kpi-grid kpi-grid-4">
                  {SANIERUNG_INTERVALLE.map(si => {
                    const last = sanierungen.find(s => s.objekt_id === sel.id && s.typ === si.typ)
                    const lastYear = last ? new Date(last.datum).getFullYear() : sel.baujahr || 2000
                    const nextYear = lastYear + si.jahre
                    const overdue = nextYear <= new Date().getFullYear()
                    return (
                      <div key={si.typ} className="card card-p" style={{ padding: 16, borderColor: overdue ? 'rgba(255,69,58,0.25)' : 'var(--line)' }}>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>{si.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{si.typ}</div>
                        <div style={{ fontSize: 11, color: overdue ? 'var(--red)' : G }}>ca. {nextYear}</div>
                        <a href={si.quelle} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4, display: 'block', textDecoration: 'underline' }}>{si.gesetz}</a>
                        {overdue && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 4, fontWeight: 700 }}>PRÜFEN</div>}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── VORLAGEN ─── */}
        {tab === 'vorlagen' && (() => {
          const kategorien = {
            mietvertrag: { icon: '📋', label: 'Mietverträge' },
            kuendigung: { icon: '✉️', label: 'Kündigungen' },
            mieterhoehung: { icon: '📈', label: 'Mieterhöhung' },
            uebergabe: { icon: '🏠', label: 'Übergabeprotokolle' },
            nk_abrechnung: { icon: '🧾', label: 'Nebenkosten' },
            selbstauskunft: { icon: '📝', label: 'Selbstauskunft' },
            hausordnung: { icon: '📜', label: 'Hausordnung' },
            sonstiges: { icon: '📁', label: 'Sonstiges' }
          }
          const grouped = vorlagen.reduce((acc, v) => {
            const k = v.kategorie || 'sonstiges'
            if (!acc[k]) acc[k] = []
            acc[k].push(v)
            return acc
          }, {})
          return (
            <div className="page fade-in">
              <div className="page-header">
                <div className="page-eye">Rechtssichere Mustervorlagen</div>
                <div className="page-title">Verträge & <span className="gold">Formulare</span></div>
              </div>

              <div className="card card-p" style={{ marginBottom: 18, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 32 }}>⚖️</div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Warum wir nicht selbst generieren</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                      Mietverträge und rechtliche Formulare brauchen regelmäßige BGH-Updates. Wir verlinken dich deshalb zu geprüften Quellen wie <strong style={{ color: 'var(--t1)' }}>Haus & Grund</strong> (Eigentümerverband) und dem <strong style={{ color: 'var(--t1)' }}>Deutschen Mieterbund</strong> — statt ungeprüfte KI-Vorlagen zu erzeugen.
                    </div>
                  </div>
                </div>
              </div>

              {vorlagen.length === 0 ? (
                <div className="card card-p">
                  <Empty icon="📜" text="Noch keine Vorlagen geladen — lauf zuerst MIGRATION_v5_3.sql in Supabase." />
                </div>
              ) : (
                Object.entries(grouped).map(([kat, items]) => {
                  const meta = kategorien[kat] || kategorien.sonstiges
                  return (
                    <div key={kat} style={{ marginBottom: 18 }}>
                      <div className="sec">{meta.icon} {meta.label} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({items.length})</span></div>
                      <div className="card card-p">
                        {items.map(v => (
                          <div key={v.id} className="row-item">
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{meta.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{v.titel}</div>
                              {v.beschreibung && <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 4 }}>{v.beschreibung}</div>}
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 10, color: G, padding: '2px 8px', background: 'var(--gp)', borderRadius: 100, fontWeight: 600 }}>{v.quelle}</span>
                                <span style={{ fontSize: 10, color: 'var(--t3)', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 100 }}>{v.format?.toUpperCase() || 'LINK'}</span>
                                {v.kostenlos ? (
                                  <span style={{ fontSize: 10, color: 'var(--green)', padding: '2px 8px', background: 'rgba(48,209,88,0.1)', borderRadius: 100, fontWeight: 600 }}>Kostenlos</span>
                                ) : (
                                  <span style={{ fontSize: 10, color: 'var(--t2)', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 100 }}>Kostenpflichtig</span>
                                )}
                              </div>
                            </div>
                            <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, fontWeight: 600, flexShrink: 0 }}>
                              Öffnen →
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}

              <div className="card card-p" style={{ marginTop: 18, background: 'var(--bg3)' }}>
                <div style={{ fontSize: 12, color: G, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📈 Geplant</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                  Eigener Mietvertragsgenerator mit § 556 BGB-Check direkt in ImmoNIQ — mit digitaler Unterschrift. Erst nach anwaltlicher Prüfung und Partnerschaft mit Haus & Grund sinnvoll. Du bekommst Vorzugspreise als bestehender Nutzer.
                </div>
              </div>
            </div>
          )
        })()}

        {/* ─── HILFE ─── */}
        {tab === 'hilfe' && (
          <div className="page fade-in">
            <div className="page-header">
              <div className="page-eye">Mit Rechtsgrundlage</div>
              <div className="page-title">Hilfe-<span className="gold">Assistent</span></div>
            </div>
            <div className="card card-p" style={{ marginBottom: 18, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>
                ⚠️ <strong style={{ color: 'var(--t1)' }}>Haftungsausschluss:</strong> Allgemeine Informationen, keine Rechts- oder Steuerberatung. Bei konkreten Fragen wende dich an Fachanwalt / Steuerberater.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <TextField value={hilfeQuery} onChange={setHilfeQuery} placeholder="Frage — z.B. Kündigung, Kaution, AfA…" />
                <Btn gold onClick={() => askHilfe(hilfeQuery)}>Fragen</Btn>
              </div>
            </div>
            {hilfeAnswer && (
              <div className="card card-p fade-in" style={{ marginBottom: 18, borderColor: 'var(--gb)' }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{hilfeAnswer.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{hilfeAnswer.frage}</div>
                <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7 }}>{hilfeAnswer.antwort}</div>
                {hilfeAnswer.link && (
                  <a href={hilfeAnswer.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, marginTop: 14, display: 'inline-block', fontWeight: 500 }}>→ Quelle / Gesetzestext öffnen</a>
                )}
              </div>
            )}
            <div className="sec">Häufige Themen</div>
            <div className="act-grid">
              {HILFE_THEMEN.map(h => (
                <button key={h.id} className="act-card" onClick={() => { setHilfeQuery(h.id); setHilfeAnswer(h) }}>
                  <div className="act-ic">{h.icon}</div>
                  <div className="act-lbl">{h.frage}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEUERBERATER ─── */}
        {tab === 'steuerberater' && (
          <div className="page fade-in">
            <div className="page-header">
              <div className="page-eye">Die Brücke zum Finanzamt</div>
              <div className="page-title">Mein <span className="gold">Steuerberater</span></div>
            </div>

            <div className="card card-p" style={{ marginBottom: 18, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 36 }}>👔</div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>So funktioniert's</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                    Du erfasst die Kontaktdaten deines Steuerberaters. Am Jahresende erzeugst du mit einem Klick einen sauberen Report mit allen Einnahmen, Sanierungen und Objekten. Er spart 2-3 Stunden Arbeit — und das kostet dich weniger Honorar.
                  </div>
                </div>
              </div>
            </div>

            {/* Anlage V Shortcut */}
            <div className="card card-p" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 28 }}>📊</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Anlage V vorbereiten</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5 }}>Detaillierter AfA-Rechner mit Anschaffungsnah-Prüfung (§ 6 Abs. 1 Nr. 1a EStG) und Sonder-AfA § 7b.</div>
              </div>
              <Btn outline onClick={() => router.push('/steuer')}>Öffnen →</Btn>
            </div>

            <div className="page-2col">
              <div>
                <div className="sec">Kontaktdaten deines Steuerberaters</div>
                <div className="card card-p">
                  <F label="Name *">
                    <TextField value={stbForm.name} onChange={v => setStbForm(p => ({ ...p, name: v }))} placeholder="Dr. Hoffmann" />
                  </F>
                  <F label="Kanzlei">
                    <TextField value={stbForm.kanzlei} onChange={v => setStbForm(p => ({ ...p, kanzlei: v }))} placeholder="Hoffmann Steuerberatung GmbH" />
                  </F>
                  <F label="E-Mail *" hint="Hier sendest du später den Jahresreport hin">
                    <TextField type="email" value={stbForm.email} onChange={v => setStbForm(p => ({ ...p, email: v }))} placeholder="kanzlei@hoffmann-stb.de" />
                  </F>
                  <F label="Telefon">
                    <TextField value={stbForm.telefon} onChange={v => setStbForm(p => ({ ...p, telefon: v }))} placeholder="+49 251 12345" />
                  </F>
                  <Btn gold full onClick={saveStb} disabled={stbSending}>
                    {stbSending ? 'Speichert…' : stb ? 'Daten aktualisieren' : 'Steuerberater speichern'}
                  </Btn>
                </div>
              </div>

              <div>
                <div className="sec">Jahresreport senden</div>
                <div className="card card-p">
                  {!stb ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                      <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 14 }}>Erst Steuerberater eintragen</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>Dann kannst du hier den Jahresreport generieren.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4 }}>Empfänger</div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{stb.name}</div>
                        {stb.kanzlei && <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 2 }}>{stb.kanzlei}</div>}
                        <div style={{ fontSize: 12, color: G }}>{stb.email}</div>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 14, lineHeight: 1.6 }}>
                        Der Report enthält:
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                          <li>✓ Alle Objekt-Stammdaten</li>
                          <li>✓ Zahlungseingänge des Jahres</li>
                          <li>✓ Sanierungen mit Kosten</li>
                          <li>✓ Übersicht gespeicherter Dokumente</li>
                          <li>✓ Rechtliche Hinweise an den Steuerberater</li>
                        </ul>
                      </div>

                      <Btn gold full onClick={generateStbReport}>
                        📨 Jahresreport für Steuerberater erstellen
                      </Btn>
                      <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center', marginTop: 10 }}>
                        Öffnet zum Ausdrucken / als PDF speichern. Dann per E-Mail an {stb.email} senden.
                      </div>
                    </>
                  )}
                </div>

                {stbExports.length > 0 && (
                  <>
                    <div className="sec" style={{ marginTop: 18 }}>Versand-Historie</div>
                    <div className="card card-p">
                      {stbExports.map(e => (
                        <div key={e.id} className="row-item">
                          <div style={{ fontSize: 20, flexShrink: 0 }}>📨</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>Jahresreport {e.jahr}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>an {e.stb_email}</div>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{new Date(e.gesendet_at).toLocaleDateString('de-DE')}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Steuerberater-Verzeichnis: Keim des Marktplatzes */}
            <div className="sec" style={{ marginTop: 28 }}>🔍 Steuerberater in deiner Nähe</div>
            <div className="card card-p" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>
                Noch keinen Steuerberater für deine Vermietung? Diese Berater sind auf Immobilien-Steuer spezialisiert.
              </div>
              {stbVerzeichnis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--t3)', fontSize: 13 }}>Noch keine Einträge verfügbar.</div>
              ) : (
                stbVerzeichnis.slice(0, 5).map(b => (
                  <div key={b.id} className="row-item">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gp)', border: '0.5px solid var(--gb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: G, flexShrink: 0 }}>{(b.name || 'SB').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}{b.kanzlei ? ` · ${b.kanzlei}` : ''}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                        {b.plz} {b.stadt}{b.schwerpunkt_immobilien ? ' · 🏠 Immobilien-Schwerpunkt' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {b.email && <a href={`mailto:${b.email}`} style={{ fontSize: 12, color: G, fontWeight: 500 }}>✉ Mail</a>}
                      {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: G, fontWeight: 500 }}>🌐 Web</a>}
                    </div>
                  </div>
                ))
              )}
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 12, fontStyle: 'italic' }}>
                Du bist Steuerberater und möchtest hier gelistet werden? → <a href="mailto:leonboomgaarden@gmail.com?subject=Partner%20werden%20bei%20ImmoNIQ" style={{ color: G }}>Partner werden</a>
              </div>
            </div>

            <div className="card card-p" style={{ marginTop: 18, background: 'var(--bg3)' }}>
              <div style={{ fontSize: 12, color: G, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📈 Was noch kommt (Roadmap)</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                In den nächsten Monaten ergänzen wir: direktes Steuerberater-Login (lesender Zugriff auf die Daten), DATEV-kompatibler CSV-Export, Steuerberater-Empfehlungsprogramm. Feedback ist sehr willkommen.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-tabbar">
        {mobileTabs.map(t => (
          <button key={t.id} className={`tab-item${tab === t.id && t.id !== 'more' ? ' active' : ''}`} onClick={() => t.id === 'more' ? setMobileNav(true) : setTab(t.id)}>
            <div className="tab-item-ic">{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* ─── MODALS ─── */}
      {modal === 'add-obj' && (
        <Modal title={editMode ? 'Objekt bearbeiten' : 'Objekt anlegen'} onClose={() => { setModal(null); setForm({}); setEditMode(false); setUploadImage(null) }}>
          <F label="Bild des Objekts" hint="Foto hinzufügen (optional)">
            {(uploadImage || form.bild_url) && (
              <img src={uploadImage ? URL.createObjectURL(uploadImage) : form.bild_url} className="img-preview" alt="" />
            )}
            <div className="dropzone" onClick={() => document.getElementById('obj-img-input').click()}>
              <input id="obj-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setUploadImage(e.target.files[0])} />
              <div style={{ fontSize: 26, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>{uploadImage ? uploadImage.name : 'Bild auswählen'}</div>
            </div>
          </F>
          <div className="field-row">
            <F label="Adresse *"><TextField value={form.adresse} onChange={v => sf('adresse', v)} placeholder="Kirchstraße 4, 2. OG" autoFocus /></F>
            <F label="Typ">
              <select value={form.typ || 'Wohnung'} onChange={e => sf('typ', e.target.value)}>
                <option>Wohnung</option><option>Haus</option><option>Gewerbe</option><option>Garage / Stellplatz</option>
              </select>
            </F>
          </div>
          <div className="field-row">
            <F label="PLZ"><TextField value={form.plz} onChange={v => sf('plz', v)} placeholder="59320" /></F>
            <F label="Stadt"><TextField value={form.stadt} onChange={v => sf('stadt', v)} placeholder="Ennigerloh" /></F>
          </div>
          <div className="field-row">
            <F label="Fläche m²"><NumberField value={form.flaeche} onChange={v => sf('flaeche', v)} placeholder="68" /></F>
            <F label="Zimmer"><NumberField value={form.zimmer} onChange={v => sf('zimmer', v)} placeholder="3" /></F>
          </div>
          <div className="field-row">
            <F label="Baujahr"><NumberField value={form.baujahr} onChange={v => sf('baujahr', v)} placeholder="1985" /></F>
            <F label="Kaufpreis €"><NumberField value={form.kaufpreis} onChange={v => sf('kaufpreis', v)} placeholder="250000" /></F>
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />
          <div style={{ fontSize: 13, color: G, fontWeight: 600, marginBottom: 14 }}>Miet-Details</div>
          <div className="field-row">
            <F label="Kaltmiete €/Mo"><NumberField value={form.kaltmiete} onChange={v => sf('kaltmiete', v)} placeholder="850" /></F>
            <F label="NK €/Mo"><NumberField value={form.nebenkosten} onChange={v => sf('nebenkosten', v)} placeholder="150" /></F>
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />
          <div style={{ fontSize: 13, color: G, fontWeight: 600, marginBottom: 14 }}>Mieter (optional)</div>
          <div className="field-row">
            <F label="Name"><TextField value={form.mieter_name} onChange={v => sf('mieter_name', v)} placeholder="Max Mustermann" /></F>
            <F label="Seit"><input type="date" value={form.mieter_seit || ''} onChange={e => sf('mieter_seit', e.target.value)} /></F>
          </div>
          <div className="field-row">
            <F label="E-Mail"><TextField type="email" value={form.mieter_email} onChange={v => sf('mieter_email', v)} placeholder="mieter@mail.de" /></F>
            <F label="Telefon"><TextField value={form.mieter_tel} onChange={v => sf('mieter_tel', v)} placeholder="+49 123" /></F>
          </div>
          <F label="Kaution €"><NumberField value={form.kaution} onChange={v => sf('kaution', v)} placeholder="2550" /></F>
          <F label="Notizen"><TextArea value={form.notizen} onChange={v => sf('notizen', v)} placeholder="Zusätzliche Informationen…" /></F>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveObjekt} disabled={uploading}>
            {uploading ? 'Speichert…' : editMode ? 'Änderungen speichern' : 'Objekt anlegen'}
          </Btn>
        </Modal>
      )}

      {modal === 'obj-detail' && sel && (
        <Modal title={sel.adresse} onClose={() => { setModal(null); setSel(null) }} wide>
          {sel.bild_url && <img src={sel.bild_url} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: 18 }} />}
          <div className="act-grid" style={{ marginBottom: 18 }}>
            {[
              ['💬', 'Nachricht', () => { setForm({ objekt_id: sel.id, mieter_name: sel.mieter_name || '' }); setModal('add-msg') }],
              ['🧾', 'NK-Abrechnung', () => { setNkForm({ vz: String((sel.nebenkosten || 0) * 12), von: `${new Date().getFullYear() - 1}-01-01`, bis: `${new Date().getFullYear() - 1}-12-31`, flm: String(sel.flaeche || 68), flg: String(sel.flaeche || 68) }); setNkStep(1); setNkItems([]); setNkResult(null); setModal('nk') }],
              ['✏️', 'Bearbeiten', () => { setForm({ ...sel }); setEditMode(true); setUploadImage(null); setModal('add-obj') }],
              ['🏚️', 'Sanierung', () => setModal('add-san')],
              ['✓', 'Aufgabe', () => { setForm({ objekt_id: sel.id, prioritaet: 'y' }); setModal('add-auf') }],
              ['💰', 'Zahlung', () => { setForm({ objekt_id: sel.id, status: 'ok' }); setModal('add-zahlung') }]
            ].map(([ic, l, fn]) => (
              <button key={l} className="act-card" onClick={fn}>
                <div className="act-ic">{ic}</div><div className="act-lbl">{l}</div>
              </button>
            ))}
          </div>
          <div className="dr-list" style={{ marginBottom: 14 }}>
            {[
              ['Adresse', sel.adresse],
              ['PLZ / Stadt', `${sel.plz || ''} ${sel.stadt || ''}`],
              ['Typ', sel.typ || '—'],
              ['Fläche / Zimmer', `${sel.flaeche || '—'} m² · ${sel.zimmer || '—'} Zi.`],
              ['Baujahr', sel.baujahr || '—'],
              ['Kaufpreis', fe(sel.kaufpreis)],
              ['Status', sel.status === 'vermietet' ? '✓ Vermietet' : '⚠️ Leerstehend'],
              ...(sel.mieter_name ? [
                ['Mieter', sel.mieter_name],
                ['Tel.', sel.mieter_tel || '—'],
                ['Seit', fd(sel.mieter_seit)],
                ['Kaltmiete', fe(sel.kaltmiete) + '/Mo'],
                ['NK-Vorauszahlung', fe(sel.nebenkosten) + '/Mo'],
                ['Kaution', fe(sel.kaution)]
              ] : [])
            ].map(([l, v]) => (
              <div key={l} className="dr"><span className="dr-l">{l}</span><span className="dr-v">{v}</span></div>
            ))}
          </div>
          {sel.notizen && <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>{sel.notizen}</div>}
          <Btn danger full onClick={() => deleteObjekt(sel.id)}>🗑️ Objekt löschen</Btn>
        </Modal>
      )}

      {modal === 'add-auf' && (
        <Modal title="Aufgabe / Frist" onClose={() => { setModal(null); setForm({}) }}>
          <F label="Aufgabe *"><TextField value={form.text} onChange={v => sf('text', v)} placeholder="z.B. Heizung reparieren" autoFocus /></F>
          <F label="Objekt">
            <select value={form.objekt_id || ''} onChange={e => sf('objekt_id', e.target.value)}>
              <option value="">Alle / Kein Objekt</option>
              {objekte.map(o => <option key={o.id} value={o.id}>{o.adresse}</option>)}
            </select>
          </F>
          <div className="field-row">
            <F label="Fällig am"><input type="date" value={form.faellig || ''} onChange={e => sf('faellig', e.target.value)} /></F>
            <F label="Priorität">
              <select value={form.prioritaet || 'g'} onChange={e => sf('prioritaet', e.target.value)}>
                <option value="r">🔴 Dringend</option>
                <option value="y">🟡 Mittel</option>
                <option value="g">🟢 Normal</option>
              </select>
            </F>
          </div>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveAufgabe}>Speichern</Btn>
        </Modal>
      )}

      {modal === 'add-msg' && (
        <Modal title="Nachricht / Notiz" onClose={() => { setModal(null); setForm({}) }}>
          <F label="Mieter / Person"><TextField value={form.mieter_name} onChange={v => sf('mieter_name', v)} placeholder="Name" /></F>
          <F label="Objekt">
            <select value={form.objekt_id || ''} onChange={e => sf('objekt_id', e.target.value)}>
              <option value="">Kein Objekt</option>
              {objekte.map(o => <option key={o.id} value={o.id}>{o.adresse}</option>)}
            </select>
          </F>
          <F label="Betreff *"><TextField value={form.betreff} onChange={v => sf('betreff', v)} placeholder="NK-Abrechnung 2025" /></F>
          <F label="Inhalt"><TextArea value={form.text} onChange={v => sf('text', v)} rows={4} placeholder="Nachricht oder Notiz…" /></F>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveNachricht}>Speichern</Btn>
        </Modal>
      )}

      {modal === 'add-zahlung' && (
        <Modal title="Zahlung eintragen" onClose={() => { setModal(null); setForm({}) }}>
          <F label="Objekt">
            <select value={form.objekt_id || ''} onChange={e => sf('objekt_id', e.target.value)}>
              <option value="">Kein Objekt</option>
              {objekte.map(o => <option key={o.id} value={o.id}>{o.adresse}</option>)}
            </select>
          </F>
          <div className="field-row">
            <F label="Betrag € *"><NumberField value={form.betrag} onChange={v => sf('betrag', v)} placeholder="980" autoFocus /></F>
            <F label="Monat"><TextField value={form.monat} onChange={v => sf('monat', v)} placeholder="April 2026" /></F>
          </div>
          <div className="field-row">
            <F label="Status">
              <select value={form.status || 'ok'} onChange={e => sf('status', e.target.value)}>
                <option value="ok">✓ Eingegangen</option>
                <option value="offen">⚠️ Ausstehend</option>
                <option value="teilweise">〜 Teilweise</option>
              </select>
            </F>
            <F label="Typ">
              <select value={form.typ || 'miete'} onChange={e => sf('typ', e.target.value)}>
                <option value="miete">Miete</option>
                <option value="nk">Nebenkosten</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </F>
          </div>
          <F label="Notiz"><TextField value={form.notiz} onChange={v => sf('notiz', v)} placeholder="z.B. Miete April" /></F>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveZahlung}>Speichern</Btn>
        </Modal>
      )}

      {modal === 'add-dok' && (
        <Modal title="Dokument hinzufügen" onClose={() => { setModal(null); setForm({}); setUploadFile(null) }}>
          <div style={{ marginBottom: 16, background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
            🔐 <strong style={{ color: 'var(--t1)' }}>Digitaler Tresor</strong> — Verschlüsselt. Nur du hast Zugriff.
          </div>
          <F label="Name *"><TextField value={form.name} onChange={v => sf('name', v)} placeholder="Mietvertrag Kirchstr. 4" autoFocus /></F>
          <div className="field-row">
            <F label="Kategorie">
              <select value={form.typ || 'sonstiges'} onChange={e => sf('typ', e.target.value)}>
                {DOK_TYPEN.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
              </select>
            </F>
            <F label="Objekt">
              <select value={form.objekt_id || ''} onChange={e => sf('objekt_id', e.target.value)}>
                <option value="">Kein Objekt</option>
                {objekte.map(o => <option key={o.id} value={o.id}>{o.adresse}</option>)}
              </select>
            </F>
          </div>
          <F label="Datei hochladen" hint="PDF, JPG, PNG, Word, Excel · bis 50 MB">
            <div className={`dropzone${uploadFile ? ' has-file' : ''}`} onClick={() => document.getElementById('file-input').click()}>
              <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) { setUploadFile(f); if (!form.name) sf('name', f.name.replace(/\.[^/.]+$/, '')) } }} />
              {uploadFile ? (
                <div style={{ color: 'var(--green)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{uploadFile.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              ) : (
                <div style={{ color: 'var(--t2)' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📎</div>
                  <div style={{ fontSize: 14 }}>Datei auswählen</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>PDF · JPG · PNG · Word · Excel</div>
                </div>
              )}
            </div>
          </F>
          <F label="Oder: Externer Link" hint="Google Drive, Dropbox etc.">
            <TextField value={form.url} onChange={v => sf('url', v)} placeholder="https://..." />
          </F>
          <F label="Notiz"><TextField value={form.notiz} onChange={v => sf('notiz', v)} placeholder="z.B. Original beim Notar" /></F>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveDokument} disabled={uploading}>
            {uploading ? 'Lädt hoch…' : 'Im Tresor speichern 🔐'}
          </Btn>
        </Modal>
      )}

      {modal === 'add-san' && (
        <Modal title="Sanierung eintragen" onClose={() => { setModal(null); setForm({}) }}>
          <F label="Art *">
            <select value={form.typ || ''} onChange={e => sf('typ', e.target.value)}>
              <option value="">Bitte wählen</option>
              {SANIERUNG_INTERVALLE.map(s => <option key={s.typ} value={s.typ}>{s.icon} {s.typ}</option>)}
            </select>
          </F>
          <div className="field-row">
            <F label="Datum"><input type="date" value={form.datum || ''} onChange={e => sf('datum', e.target.value)} /></F>
            <F label="Kosten €"><NumberField value={form.kosten} onChange={v => sf('kosten', v)} placeholder="0" /></F>
          </div>
          <F label="Handwerker / Firma"><TextField value={form.handwerker} onChange={v => sf('handwerker', v)} placeholder="Müller GmbH" /></F>
          <F label="Beschreibung"><TextArea value={form.beschreibung} onChange={v => sf('beschreibung', v)} placeholder="Was wurde gemacht?" /></F>
          <Btn gold full style={{ marginTop: 12 }} onClick={saveSanierung}>Speichern</Btn>
        </Modal>
      )}

      {modal === 'nk' && (
        <Modal title="NK-Abrechnung" onClose={() => { setModal(null); setNkStep(1); setNkItems([]); setNkResult(null) }} wide>
          <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i < nkStep ? G : i === nkStep ? 'rgba(212,175,106,0.45)' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
            ))}
          </div>
          {nkStep === 1 && (
            <>
              <div style={{ background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>
                <a href="https://www.gesetze-im-internet.de/bgb/__556.html" target="_blank" rel="noopener noreferrer" style={{ color: G, textDecoration: 'underline' }}>§ 556 BGB</a>: Abrechnung muss dem Mieter spätestens 12 Monate nach Abrechnungsende zugehen.
              </div>
              <F label="Vorauszahlungen Mieter gesamt €"><NumberField value={nkForm.vz} onChange={v => setNkForm(p => ({ ...p, vz: v }))} placeholder="1800" /></F>
              <div className="field-row">
                <F label="Von"><input type="date" value={nkForm.von} onChange={e => setNkForm(p => ({ ...p, von: e.target.value }))} /></F>
                <F label="Bis"><input type="date" value={nkForm.bis} onChange={e => setNkForm(p => ({ ...p, bis: e.target.value }))} /></F>
              </div>
              <div className="field-row">
                <F label="Fläche Mieter m²"><NumberField value={nkForm.flm} onChange={v => setNkForm(p => ({ ...p, flm: v }))} placeholder="68" /></F>
                <F label="Gesamtfläche m²"><NumberField value={nkForm.flg} onChange={v => setNkForm(p => ({ ...p, flg: v }))} placeholder="340" /></F>
              </div>
              <Btn gold full onClick={() => setNkStep(2)}>Weiter → Kosten</Btn>
            </>
          )}
          {nkStep === 2 && (
            <>
              {nkItems.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{k.ic}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{k.name}</span>
                  <div style={{ position: 'relative', width: 110 }}>
                    <NumberField value={k.val} onChange={v => setNkItems(p => p.map(x => x.id === k.id ? { ...x, val: v } : x))} placeholder="0" style={{ textAlign: 'right', paddingRight: 28 }} />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--t3)', pointerEvents: 'none' }}>€</span>
                  </div>
                  <button style={{ color: 'var(--t3)', fontSize: 14 }} onClick={() => setNkItems(p => p.filter(x => x.id !== k.id))}>✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, marginBottom: 16 }}>
                {[['🔥', 'Heizkosten'], ['💧', 'Wasser'], ['🗑️', 'Müll'], ['🏢', 'Hausmeister'], ['🔒', 'Versicherung'], ['💡', 'Strom'], ['🌿', 'Garten'], ['🛗', 'Aufzug'], ['📌', 'Sonstiges']].map(([ic, n]) => (
                  <Btn key={n} dark sm onClick={() => setNkItems(p => [...p, { id: Date.now() + Math.random(), ic, name: n, val: '' }])}>{ic} {n}</Btn>
                ))}
              </div>
              <Btn gold full onClick={nkBerechnen}>Berechnen →</Btn>
              <Btn outline full style={{ marginTop: 10 }} onClick={() => setNkStep(1)}>← Zurück</Btn>
            </>
          )}
          {nkStep === 3 && nkResult && (
            <>
              <div style={{ background: 'var(--gp)', border: '0.5px solid var(--gb)', borderRadius: 16, padding: 22, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: G, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{nkResult.diff > 0 ? 'Nachzahlung Mieter' : 'Rückzahlung an Mieter'}</div>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em' }}>{fe(Math.abs(nkResult.diff))}</div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 6 }}>Anteil {fe(nkResult.anteil)} {nkResult.diff > 0 ? '−' : '+'} VZ {fe(nkResult.vz)}</div>
              </div>
              <div className="dr-list" style={{ marginBottom: 14 }}>
                {[
                  ['Zeitraum', `${fd(nkForm.von)} – ${fd(nkForm.bis)}`],
                  ['Gesamtkosten', fe(nkResult.total)],
                  [`Anteil Mieter (${(nkResult.ratio * 100).toFixed(1)}%)`, fe(nkResult.anteil)],
                  ['Vorauszahlungen', fe(nkResult.vz)],
                  [nkResult.diff > 0 ? 'Nachzahlung' : 'Rückzahlung', fe(Math.abs(nkResult.diff))]
                ].map(([l, v]) => (
                  <div key={l} className="dr"><span className="dr-l">{l}</span><span className="dr-v">{v}</span></div>
                ))}
              </div>
              <Btn gold full onClick={() => window.print()}>🖨️ Drucken / PDF</Btn>
              <Btn outline full style={{ marginTop: 10 }} onClick={() => { setNkStep(1); setNkItems([]); setNkResult(null) }}>Neue Abrechnung</Btn>
            </>
          )}
        </Modal>
      )}

      {/* Notification Pop-up */}
      {activeNotif && (
        <div className="notif-popup" onClick={() => { setTab('fristen'); setActiveNotif(null); setDismissedNotifs(p => [...p, activeNotif.id]) }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 22 }}>⏰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: G, fontWeight: 600, marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Frist nähert sich</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{activeNotif.text}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                In {daysUntil(activeNotif.faellig)} Tag{daysUntil(activeNotif.faellig) !== 1 ? 'en' : ''} fällig{activeNotif.gesetz ? ` · ${activeNotif.gesetz}` : ''}
              </div>
            </div>
            <button style={{ color: 'var(--t3)', fontSize: 16, padding: 2 }} onClick={e => { e.stopPropagation(); setActiveNotif(null); setDismissedNotifs(p => [...p, activeNotif.id]) }}>✕</button>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  )
}
