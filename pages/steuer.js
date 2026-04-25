import { useState, useEffect, useMemo, memo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { BMF_AFA_LINK, AFA_GESETZ_LINK } from '../lib/constants'

const fe = n => typeof n === 'number' && !isNaN(n) ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '0,00 €'
const feK = n => typeof n === 'number' && !isNaN(n) ? n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €' : '—'
const fd = s => { if (!s) return '—'; try { const [y,m,d] = s.split('-'); return `${d}.${m}.${y}` } catch { return s } }
const G = '#d4af6a'

const NumberField = memo(function NumberField({ value, onChange, placeholder, ...rest }) {
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
      onChange={e => {
        const v = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
        onChange(v)
      }}
      {...rest}
    />
  )
})

export default function Steuer({ session }) {
  const router = useRouter()
  const [objekte, setObjekte] = useState([])
  const [sel, setSel] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear() - 1)
  const [step, setStep] = useState(1)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const [ein, setEin] = useState({ kalt: '', nk: '', sonst: '' })
  const [afa, setAfa] = useState({
    kaufpreis: '',
    grundant: '20',
    typ: 'linear_2',  // linear_2, linear_25, linear_3, degressiv_5, sonder_7b
    bereits: '0',
    sonder7b: false,
    sonder7b_betrag: ''
  })
  const [wk, setWk] = useState({
    zinsen: '', erhalt: '', grundsteuer: '', versicherung: '', hausmeister: '',
    software: '59.88', strom: '', muell: '', werbung: '', steuerber: '', sonst: '',
    herstell: '', fahrten_km: '', fahrten_anz: ''
  })
  const [ankauf, setAnkauf] = useState({
    kaufjahr: '',
    kaufpreis: '',
    kosten_3jahre: ''
  })

  useEffect(() => {
    if (!session) { router.push('/auth'); return }
    supabase.from('objekte').select('*').eq('user_id', session.user.id).then(({ data }) => setObjekte(data || []))
  }, [session, router])

  // AfA-Satz basierend auf Typ
  const getAfaSatz = () => {
    if (afa.typ === 'linear_2') return 2
    if (afa.typ === 'linear_25') return 2.5
    if (afa.typ === 'linear_3') return 3
    if (afa.typ === 'degressiv_5') return 5
    return 2
  }

  const gebwert = useMemo(() => (parseFloat(afa.kaufpreis) || 0) * (1 - (parseFloat(afa.grundant) || 20) / 100), [afa])

  const afaNormal = useMemo(() => {
    const r = gebwert - (parseFloat(afa.bereits) || 0)
    return Math.max(0, r * getAfaSatz() / 100)
  }, [gebwert, afa])

  const afaSonder = useMemo(() => {
    if (!afa.sonder7b) return 0
    const betrag = parseFloat(afa.sonder7b_betrag) || 0
    return betrag * 0.05
  }, [afa])

  const afaJahr = afaNormal + afaSonder

  // Anschaffungsnahe HK-Warnung (§ 6 Abs. 1 Nr. 1a EStG)
  const ankaufWarning = useMemo(() => {
    const kaufj = parseInt(ankauf.kaufjahr) || 0
    const currentYear = new Date().getFullYear()
    const yearsSince = currentYear - kaufj
    if (!kaufj || yearsSince > 3) return null
    const gebAnteil = (parseFloat(ankauf.kaufpreis) || 0) * (1 - (parseFloat(afa.grundant) || 20) / 100)
    const grenze = gebAnteil * 0.15
    const kosten = parseFloat(ankauf.kosten_3jahre) || 0
    const ueber = kosten > grenze
    return { grenze, kosten, ueber, gebAnteil, yearsSince }
  }, [ankauf, afa])

  const fahrtk = () => (parseFloat(wk.fahrten_km) || 0) * (parseFloat(wk.fahrten_anz) || 0) * 2 * 0.30
  const gesamtEin = () => (parseFloat(ein.kalt) || 0) + (parseFloat(ein.nk) || 0) + (parseFloat(ein.sonst) || 0)
  const gesamtWK = () => {
    const base = ['zinsen','erhalt','grundsteuer','versicherung','hausmeister','software','strom','muell','werbung','steuerber','sonst']
      .reduce((s, k) => s + (parseFloat(wk[k]) || 0), 0)
    return base + afaJahr + fahrtk()
  }
  const ueberschuss = () => gesamtEin() - gesamtWK()

  const getAfaLabel = () => {
    if (afa.typ === 'linear_2') return 'Lineare AfA 2% (Baujahr nach 1924)'
    if (afa.typ === 'linear_25') return 'Lineare AfA 2,5% (Baujahr vor 1925)'
    if (afa.typ === 'linear_3') return 'Lineare AfA 3% (Fertigstellung ab 2023)'
    if (afa.typ === 'degressiv_5') return 'Degressive AfA 5% (§ 7 Abs. 5a EStG)'
    return 'AfA'
  }

  function printAnlageV() {
    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Anlage V ${year}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A4; margin: 18mm; }
      body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10pt; color: #1a1a1a; background: #fff; padding: 12mm; max-width: 186mm; margin: 0 auto; line-height: 1.5; }
      .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2pt solid #d4af6a; padding-bottom: 14pt; margin-bottom: 20pt; }
      .logo { font-size: 22pt; font-weight: 700; letter-spacing: -0.03em; }
      .logo span { color: #d4af6a; }
      .logo-sub { font-size: 9pt; color: #666; letter-spacing: 0.02em; text-transform: uppercase; }
      .meta { text-align: right; font-size: 9pt; color: #666; line-height: 1.6; }
      .meta strong { color: #1a1a1a; font-weight: 600; }
      h1 { font-size: 17pt; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3pt; }
      .subtitle { font-size: 10pt; color: #666; margin-bottom: 20pt; }
      .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10pt; margin-bottom: 22pt; }
      .kpi-box { border: 0.5pt solid #e5e5e5; border-radius: 8pt; padding: 14pt; background: #fafafa; }
      .kpi-box.primary { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
      .kpi-box.accent { background: #fffbf0; border-color: #d4af6a; }
      .kv { font-size: 18pt; font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4pt; }
      .kl { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.7; font-weight: 500; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 18pt; }
      th { background: #f5f5f5; padding: 9pt 10pt; text-align: left; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #666; border-bottom: 0.5pt solid #e5e5e5; }
      th:last-child { text-align: right; }
      td { padding: 9pt 10pt; border-bottom: 0.5pt solid #f0f0f0; vertical-align: top; font-size: 9.5pt; }
      td.z { width: 40pt; color: #999; font-size: 8.5pt; font-variant-numeric: tabular-nums; }
      td.num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
      td.ein { color: #1a7d3a; }
      td.aus { color: #a8321a; }
      tr.section td { background: #fafafa; font-weight: 600; padding-top: 11pt; padding-bottom: 11pt; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.06em; color: #666; }
      tr.total td { border-top: 1pt solid #1a1a1a; background: #f5f5f5; font-weight: 700; font-size: 10pt; padding-top: 11pt; padding-bottom: 11pt; }
      tr.grand-total td { background: #fffbf0; font-weight: 700; font-size: 11pt; padding: 14pt 10pt; color: #1a1a1a; border-top: 1.5pt solid #d4af6a; }
      tr.grand-total td.num { font-size: 14pt; }
      .notice { background: #fffbf0; border-left: 3pt solid #d4af6a; border-radius: 4pt; padding: 11pt 14pt; font-size: 9pt; color: #5a4d28; line-height: 1.6; margin-bottom: 14pt; }
      .notice strong { color: #1a1a1a; font-weight: 600; }
      .warning { background: #fff0f0; border-left: 3pt solid #a8321a; border-radius: 4pt; padding: 11pt 14pt; font-size: 9pt; color: #6b1a1a; line-height: 1.6; margin-bottom: 14pt; }
      .warning strong { color: #a8321a; }
      .footer { margin-top: 28pt; padding-top: 14pt; border-top: 0.5pt solid #e5e5e5; font-size: 8pt; color: #999; letter-spacing: 0.02em; }
      .disclaimer { background: #f0f4ff; border: 0.5pt solid #4470cc; border-radius: 6pt; padding: 12pt 16pt; margin-bottom: 16pt; font-size: 9pt; line-height: 1.6; }
      .disclaimer strong { color: #2a50a0; }
      @media print { body { padding: 0; } }
    </style></head><body>
      <div class="hdr">
        <div>
          <div class="logo">Immo<span>NIQ</span></div>
          <div class="logo-sub">Anlage V · Einkünfte aus Vermietung und Verpachtung</div>
        </div>
        <div class="meta">
          <strong>Veranlagungsjahr ${year}</strong><br>
          Erstellt am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br>
          ${session.user.email}
        </div>
      </div>

      <div class="disclaimer">
        <strong>⚠️ Wichtiger Hinweis:</strong> Dieses Dokument ist eine Arbeitshilfe zur Vorbereitung der Steuererklärung.
        Es ersetzt KEINE steuerliche Beratung. Die finale Prüfung und Erklärung muss durch einen Steuerberater erfolgen.
        Besonderheiten wie anschaffungsnahe Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG), Sonder-AfA (§ 7b EStG) und
        der korrekte Grundstücksanteil sind im Einzelfall zu prüfen.
      </div>

      <h1>${sel?.adresse || '—'}</h1>
      <div class="subtitle">${sel?.plz || ''} ${sel?.stadt || ''} · § 21 EStG · Steuerjahr ${year}</div>
      <div class="kpis">
        <div class="kpi-box primary"><div class="kv">${feK(gesamtEin())}</div><div class="kl">Einnahmen</div></div>
        <div class="kpi-box"><div class="kv">${feK(gesamtWK())}</div><div class="kl">Werbungskosten</div></div>
        <div class="kpi-box accent"><div class="kv" style="color:${ueberschuss() >= 0 ? '#1a7d3a' : '#a8321a'}">${feK(ueberschuss())}</div><div class="kl">Überschuss</div></div>
      </div>
      <table>
        <thead><tr><th>Zeile</th><th>Position</th><th>Betrag</th></tr></thead>
        <tbody>
          <tr class="section"><td colspan="3">Einnahmen</td></tr>
          <tr><td class="z">9</td><td>Mieteinnahmen (kalt)</td><td class="num ein">${fe(parseFloat(ein.kalt) || 0)}</td></tr>
          <tr><td class="z">10</td><td>Nebenkosten-Vorauszahlungen</td><td class="num ein">${fe(parseFloat(ein.nk) || 0)}</td></tr>
          ${parseFloat(ein.sonst) ? `<tr><td class="z">12</td><td>Sonstige Einnahmen</td><td class="num ein">${fe(parseFloat(ein.sonst))}</td></tr>` : ''}
          <tr class="total"><td class="z"></td><td>Summe Einnahmen</td><td class="num ein">${fe(gesamtEin())}</td></tr>

          <tr class="section"><td colspan="3">Werbungskosten</td></tr>
          <tr><td class="z">33</td><td>${getAfaLabel()} (Bemessung ${fe(gebwert)})</td><td class="num aus">${fe(afaNormal)}</td></tr>
          ${afa.sonder7b ? `<tr><td class="z">34</td><td>Sonder-AfA § 7b EStG 5% (Mietwohnungsneubau)</td><td class="num aus">${fe(afaSonder)}</td></tr>` : ''}
          <tr><td class="z">41</td><td>Schuldzinsen</td><td class="num aus">${fe(parseFloat(wk.zinsen) || 0)}</td></tr>
          <tr><td class="z">47</td><td>Erhaltungsaufwendungen</td><td class="num aus">${fe(parseFloat(wk.erhalt) || 0)}</td></tr>
          <tr><td class="z">48</td><td>Grundsteuer</td><td class="num aus">${fe(parseFloat(wk.grundsteuer) || 0)}</td></tr>
          <tr><td class="z">49</td><td>Gebäudeversicherung</td><td class="num aus">${fe(parseFloat(wk.versicherung) || 0)}</td></tr>
          <tr><td class="z">50</td><td>Hausmeister / Reinigung</td><td class="num aus">${fe(parseFloat(wk.hausmeister) || 0)}</td></tr>
          <tr><td class="z">52</td><td>Verwaltungskosten / Software</td><td class="num aus">${fe(parseFloat(wk.software) || 0)}</td></tr>
          <tr><td class="z">53</td><td>Werbungskosten Leerstand</td><td class="num aus">${fe(parseFloat(wk.werbung) || 0)}</td></tr>
          <tr><td class="z">55</td><td>Fahrtkosten (${wk.fahrten_anz || 0}× ${wk.fahrten_km || 0} km × 0,30 €)</td><td class="num aus">${fe(fahrtk())}</td></tr>
          <tr><td class="z">56</td><td>Steuerberatungskosten</td><td class="num aus">${fe(parseFloat(wk.steuerber) || 0)}</td></tr>
          ${parseFloat(wk.sonst) ? `<tr><td class="z">57</td><td>Sonstige Werbungskosten</td><td class="num aus">${fe(parseFloat(wk.sonst))}</td></tr>` : ''}
          <tr class="total"><td class="z"></td><td>Summe Werbungskosten</td><td class="num aus">${fe(gesamtWK())}</td></tr>

          <tr class="grand-total">
            <td class="z">21</td>
            <td>Überschuss / Verlust (Anlage V)</td>
            <td class="num" style="color:${ueberschuss() >= 0 ? '#1a7d3a' : '#a8321a'}">${fe(ueberschuss())}</td>
          </tr>
        </tbody>
      </table>
      ${ankaufWarning?.ueber ? `<div class="warning"><strong>⚠️ Warnung anschaffungsnahe Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG):</strong> Kosten von ${fe(ankaufWarning.kosten)} in den ersten 3 Jahren liegen über der 15%-Grenze von ${fe(ankaufWarning.grenze)}. Diese Kosten sind KEINE Werbungskosten, sondern aktivierungspflichtig! Unbedingt mit Steuerberater klären.</div>` : ''}
      ${parseFloat(wk.herstell) > 0 ? `<div class="notice"><strong>Herstellungskosten ${fe(parseFloat(wk.herstell))}</strong> wurden nicht als Werbungskosten berücksichtigt. Diese erhöhen die AfA-Bemessungsgrundlage — bitte mit Steuerberater abstimmen.</div>` : ''}
      <div class="notice"><strong>Hinweise zur AfA:</strong> Der gewählte AfA-Satz (${getAfaLabel()}) sollte durch einen Steuerberater geprüft werden. Besonderheiten: Grundstücksanteil (typisch 20–30%), degressive vs. lineare AfA, Sonder-AfA § 7b EStG. Quelle: <a href="${BMF_AFA_LINK}">BMF-Schreiben zur Nutzungsdauer von Gebäuden</a>.</div>
      <div class="footer">
        <strong>ImmoNIQ · immoniq.de</strong> · Arbeitshilfe ohne Gewähr · Steuerjahr ${year} · ${session.user.email}
      </div>
    </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 600)
  }

  const steps = ['Objekt', 'Einnahmen', 'AfA', 'Werbungskosten', 'Ergebnis']

  // Disclaimer first
  if (showDisclaimer) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', fontFamily: 'var(--ff)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'var(--bg3)', border: '0.5px solid var(--line)', color: 'var(--t1)', fontSize: 14, cursor: 'pointer', padding: '8px 14px', borderRadius: 100 }}>← Dashboard</button>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.04em' }}>Immo<span style={{ color: G }}>NIQ</span></div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>⚠️</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10 }}>Vor der Benutzung bitte lesen</h1>
            <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.6 }}>Steuer ist komplex — dieser Rechner ist eine Arbeitshilfe, keine Steuerberatung.</p>
          </div>

          <div className="card card-p" style={{ marginBottom: 16, background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.25)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--red)' }}>Diese Arbeitshilfe prüft NICHT automatisch:</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--t2)', lineHeight: 1.9 }}>
              <li>• <strong style={{ color: 'var(--t1)' }}>Anschaffungsnahe Herstellungskosten</strong> (§ 6 Abs. 1 Nr. 1a EStG) — große Steuerfalle bei Reparaturen in ersten 3 Jahren</li>
              <li>• <strong style={{ color: 'var(--t1)' }}>Korrekter Grundstücksanteil</strong> (je nach Lage 15-35%)</li>
              <li>• <strong style={{ color: 'var(--t1)' }}>Sonder-AfA § 7b EStG</strong> — strenge Voraussetzungen (Baukostenobergrenze, Mietpreisbindung)</li>
              <li>• <strong style={{ color: 'var(--t1)' }}>Abgrenzung Erhaltung / Herstellung</strong></li>
              <li>• <strong style={{ color: 'var(--t1)' }}>Einzelheiten bei Verlustverrechnung</strong></li>
            </ul>
          </div>

          <div className="card card-p" style={{ marginBottom: 20, background: 'var(--gp)', border: '0.5px solid var(--gb)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: G }}>Was diese Arbeitshilfe tut:</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--t2)', lineHeight: 1.9 }}>
              <li>✓ Grobkalkulation Einnahmen / Werbungskosten</li>
              <li>✓ Linear / Degressiv AfA-Berechnung mit Auswahl</li>
              <li>✓ Warnung bei anschaffungsnahen HK</li>
              <li>✓ Druckfertiges PDF als Vorlage für Steuerberater</li>
              <li>✓ Link zu offiziellen Quellen (BMF, § 7 EStG)</li>
            </ul>
          </div>

          <div style={{ marginBottom: 20 }}>
            <a href={BMF_AFA_LINK} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, display: 'block', marginBottom: 8 }}>→ BMF-Schreiben zur AfA (offiziell)</a>
            <a href={AFA_GESETZ_LINK} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: G, display: 'block' }}>→ § 7 EStG (Gesetzestext)</a>
          </div>

          <button className="btn btn-gold btn-full" onClick={() => setShowDisclaimer(false)}>
            Verstanden — zur Berechnung →
          </button>
          <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => router.push('/dashboard')}>
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', fontFamily: 'var(--ff)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'var(--bg3)', border: '0.5px solid var(--line)', color: 'var(--t1)', fontSize: 14, cursor: 'pointer', padding: '8px 14px', borderRadius: 100 }}>← Dashboard</button>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Steuer-Arbeitshilfe</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }}>Anlage V · {year}</div>
          </div>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ width: 'auto', minWidth: 100, padding: '10px 14px', fontSize: 14 }}>
            {[2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i + 1 < step ? G : i + 1 === step ? 'rgba(212,175,106,0.5)' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 26 }}>
          Schritt {step} von {steps.length}: <strong style={{ color: 'var(--t1)' }}>{steps[step - 1]}</strong>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card card-p fade-in">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Welches Objekt?</div>
            {objekte.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--t3)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 14 }}>Noch keine Objekte angelegt</div>
                <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => router.push('/dashboard')}>Zurück zum Dashboard</button>
              </div>
            ) : (
              <>
                {objekte.map(o => (
                  <div key={o.id} onClick={() => setSel(o)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: sel?.id === o.id ? 'var(--gp)' : 'var(--bg3)', border: `1px solid ${sel?.id === o.id ? 'var(--gold)' : 'var(--line)'}`, borderRadius: 14, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{o.adresse}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>{o.plz} {o.stadt}{o.flaeche ? ` · ${o.flaeche} m²` : ''}</div>
                    </div>
                    {sel?.id === o.id && <span style={{ color: G, fontSize: 22 }}>✓</span>}
                  </div>
                ))}
                <button className="btn btn-gold btn-full" style={{ marginTop: 14 }} onClick={() => { if (!sel) { alert('Bitte Objekt wählen'); return } setStep(2) }}>Weiter → Einnahmen</button>
              </>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="fade-in">
            <div className="card card-p" style={{ marginBottom: 12, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                💡 Vorauszahlungen der Mieter sind Einnahmen — auch wenn zurückzuzahlen (Zufluss-Prinzip <a href="https://www.gesetze-im-internet.de/estg/__11.html" target="_blank" rel="noopener noreferrer" style={{ color: G }}>§ 11 EStG</a>).
              </div>
            </div>
            <div className="card card-p">
              <div className="field">
                <label>Kaltmiete gesamt (Jahr)</label>
                <NumberField value={ein.kalt} onChange={v => setEin(p => ({ ...p, kalt: v }))} placeholder={sel ? String((sel.kaltmiete || 0) * 12) : '9600'} />
              </div>
              <div className="field">
                <label>NK-Vorauszahlungen Mieter (Jahr)</label>
                <NumberField value={ein.nk} onChange={v => setEin(p => ({ ...p, nk: v }))} placeholder={sel ? String((sel.nebenkosten || 0) * 12) : '1920'} />
              </div>
              <div className="field">
                <label>Sonstige Einnahmen</label>
                <NumberField value={ein.sonst} onChange={v => setEin(p => ({ ...p, sonst: v }))} placeholder="0" />
              </div>
            </div>
            <div className="card card-p" style={{ marginTop: 10, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Gesamt Einnahmen</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em' }}>{fe(gesamtEin())}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Zurück</button>
              <button className="btn btn-gold btn-full" onClick={() => setStep(3)}>Weiter → AfA</button>
            </div>
          </div>
        )}

        {/* Step 3 - AfA komplett überarbeitet */}
        {step === 3 && (
          <div className="fade-in">
            <div className="card card-p" style={{ marginBottom: 12, background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.25)' }}>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                ⚠️ <strong style={{ color: 'var(--red)' }}>AfA-Typ korrekt wählen!</strong> Falsche AfA = Nachzahlungen. Im Zweifel Steuerberater fragen. Quelle: <a href={BMF_AFA_LINK} target="_blank" rel="noopener noreferrer" style={{ color: G }}>BMF-Schreiben</a>.
              </div>
            </div>

            <div className="card card-p">
              <div className="field">
                <label>Kaufpreis gesamt (inkl. Nebenkosten)</label>
                <NumberField value={afa.kaufpreis} onChange={v => setAfa(p => ({ ...p, kaufpreis: v }))} placeholder="250000" />
              </div>
              <div className="field">
                <label>Grundanteil (%)</label>
                <NumberField value={afa.grundant} onChange={v => setAfa(p => ({ ...p, grundant: v }))} placeholder="20" />
                <div className="input-hint">Typisch 20-30%. Kleinstadt: eher 20%, Großstadt: eher 30%. Genauer Wert: Bodenrichtwert vom Gutachterausschuss.</div>
              </div>

              <div className="field">
                <label>AfA-Typ</label>
                <select value={afa.typ} onChange={e => setAfa(p => ({ ...p, typ: e.target.value }))}>
                  <option value="linear_2">Lineare AfA 2% (Baujahr nach 1924)</option>
                  <option value="linear_25">Lineare AfA 2,5% (Baujahr vor 1925)</option>
                  <option value="linear_3">Lineare AfA 3% (Fertigstellung ab 2023)</option>
                  <option value="degressiv_5">Degressive AfA 5% (§ 7 Abs. 5a EStG, Neubau 10/2023-09/2029)</option>
                </select>
                <div className="input-hint">Alle Sätze laut § 7 EStG. Degressive AfA nur für Neubau mit Baubeginn 01.10.2023-30.09.2029.</div>
              </div>

              <div className="field">
                <label>Bereits abgeschrieben (kumuliert, bei degressiver AfA Restbuchwert)</label>
                <NumberField value={afa.bereits} onChange={v => setAfa(p => ({ ...p, bereits: v }))} placeholder="0" />
              </div>

              <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, marginTop: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    id="sonder7b"
                    checked={afa.sonder7b}
                    onChange={e => setAfa(p => ({ ...p, sonder7b: e.target.checked }))}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="sonder7b" style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', cursor: 'pointer' }}>
                    Sonder-AfA § 7b EStG (Mietwohnungsneubau)
                  </label>
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 10 }}>
                  5% zusätzlich für 4 Jahre. STRENGE Voraussetzungen: Neubau mit Bauantrag 01.01.2023–30.09.2029, Baukosten max 5.200€/m², mind. 10 Jahre vermietet, max. Bemessungsgrundlage 4.000€/m². <strong style={{ color: 'var(--red)' }}>Bei Verstoß: Rückabwicklung!</strong> Nur ankreuzen wenn vom Steuerberater bestätigt.
                </div>
                {afa.sonder7b && (
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Bemessungsgrundlage Sonder-AfA (max 4.000€/m²)</label>
                    <NumberField value={afa.sonder7b_betrag} onChange={v => setAfa(p => ({ ...p, sonder7b_betrag: v }))} placeholder="200000" />
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />

              {/* Anschaffungsnahe HK Check */}
              <div style={{ fontSize: 13, color: G, fontWeight: 600, marginBottom: 12 }}>⚠️ Check: Anschaffungsnahe Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG)</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 14 }}>
                Falls du das Objekt in den letzten 3 Jahren gekauft hast, prüfe diese Grenze. Reparaturen in 3 Jahren über 15% des Gebäudeanteils = KEINE Werbungskosten (sondern aktivierungspflichtig).
              </div>
              <div className="field-row">
                <F label="Kaufjahr">
                  <NumberField value={ankauf.kaufjahr} onChange={v => setAnkauf(p => ({ ...p, kaufjahr: v }))} placeholder="2024" />
                </F>
                <F label="Kaufpreis zum Ankauf">
                  <NumberField value={ankauf.kaufpreis} onChange={v => setAnkauf(p => ({ ...p, kaufpreis: v }))} placeholder="250000" />
                </F>
              </div>
              <F label="Summe Reparaturen/Renovierung in ersten 3 Jahren (netto)" hint="Alle Rechnungen netto summieren">
                <NumberField value={ankauf.kosten_3jahre} onChange={v => setAnkauf(p => ({ ...p, kosten_3jahre: v }))} placeholder="0" />
              </F>
              {ankaufWarning && (
                <div style={{ background: ankaufWarning.ueber ? 'rgba(255,69,58,0.1)' : 'rgba(48,209,88,0.1)', border: `0.5px solid ${ankaufWarning.ueber ? 'rgba(255,69,58,0.3)' : 'rgba(48,209,88,0.3)'}`, borderRadius: 12, padding: 14, marginTop: 10, fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                  {ankaufWarning.ueber ? (
                    <>
                      <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>🚨 ACHTUNG: 15%-Grenze überschritten!</div>
                      Deine Kosten: {fe(ankaufWarning.kosten)} · Grenze (15% des Gebäudeanteils {fe(ankaufWarning.gebAnteil)}): {fe(ankaufWarning.grenze)}.
                      <br/><strong style={{ color: 'var(--t1)' }}>Diese Kosten sind KEINE Werbungskosten — sie erhöhen die AfA-Basis!</strong> Unbedingt Steuerberater konsultieren!
                    </>
                  ) : (
                    <>
                      <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 6 }}>✓ Unter der 15%-Grenze</div>
                      Deine Kosten: {fe(ankaufWarning.kosten)} · Grenze: {fe(ankaufWarning.grenze)}. Spielraum: {fe(ankaufWarning.grenze - ankaufWarning.kosten)}.
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="card card-p" style={{ marginTop: 10, background: 'var(--gp)', borderColor: 'var(--gb)' }}>
              <div className="dr"><span className="dr-l">Kaufpreis</span><span className="dr-v">{fe(parseFloat(afa.kaufpreis) || 0)}</span></div>
              <div className="dr"><span className="dr-l">Grundanteil ({afa.grundant}%)</span><span className="dr-v">{fe((parseFloat(afa.kaufpreis) || 0) * parseFloat(afa.grundant) / 100)}</span></div>
              <div className="dr"><span className="dr-l">Gebäudewert (AfA-Basis)</span><span className="dr-v">{fe(gebwert)}</span></div>
              <div className="dr"><span className="dr-l">AfA normal ({getAfaSatz()}%)</span><span className="dr-v" style={{ color: G }}>{fe(afaNormal)}</span></div>
              {afa.sonder7b && (
                <div className="dr"><span className="dr-l">Sonder-AfA § 7b (5%)</span><span className="dr-v" style={{ color: G }}>{fe(afaSonder)}</span></div>
              )}
              <div className="dr" style={{ borderBottom: 'none', paddingTop: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>AfA gesamt {year}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: G, letterSpacing: '-0.02em' }}>{fe(afaJahr)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Zurück</button>
              <button className="btn btn-gold btn-full" onClick={() => setStep(4)}>Weiter → Kosten</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="fade-in">
            <div className="card card-p">
              {[
                ['zinsen', 'Schuldzinsen', 'Hypothekenzinsen abzugsfähig, Tilgung NICHT.'],
                ['erhalt', 'Erhaltungsaufwendungen', 'Reparaturen, Renovierung — sofort abzugsfähig.'],
                ['grundsteuer', 'Grundsteuer', null],
                ['versicherung', 'Gebäudeversicherung', null],
                ['hausmeister', 'Hausmeister / Reinigung', null],
                ['software', 'Verwaltung / Software (ImmoNIQ)', null],
                ['strom', 'Allgemeinstrom', null],
                ['werbung', 'Werbungskosten Leerstand', null],
                ['steuerber', 'Steuerberatung (anteilig)', null],
                ['sonst', 'Sonstige Werbungskosten', null]
              ].map(([key, label, hint]) => (
                <div key={key} className="field">
                  <label>{label}</label>
                  <NumberField value={wk[key]} onChange={v => setWk(p => ({ ...p, [key]: v }))} placeholder="0" />
                  {hint && <div className="input-hint">{hint}</div>}
                </div>
              ))}
              <div style={{ borderTop: '0.5px solid var(--line)', paddingTop: 18, marginTop: 10 }}>
                <div style={{ fontSize: 12, color: G, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Fahrtkosten (0,30 €/km)</div>
                <div className="field-row">
                  <div className="field">
                    <label>Km pro Fahrt</label>
                    <NumberField value={wk.fahrten_km} onChange={v => setWk(p => ({ ...p, fahrten_km: v }))} placeholder="15" />
                  </div>
                  <div className="field">
                    <label>Anzahl Fahrten</label>
                    <NumberField value={wk.fahrten_anz} onChange={v => setWk(p => ({ ...p, fahrten_anz: v }))} placeholder="12" />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--t2)' }}>= {fe(fahrtk())} Fahrtkosten</div>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(255,69,58,0.2)', paddingTop: 18, marginTop: 18 }}>
                <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>⚠️ Nicht sofort abzugsfähig</div>
                <div className="field">
                  <label>Herstellungskosten (aktivierungspflichtig)</label>
                  <NumberField value={wk.herstell} onChange={v => setWk(p => ({ ...p, herstell: v }))} placeholder="0" />
                  <div className="input-hint">Wertsteigernde Maßnahmen — erhöhen AfA-Basis. Bitte mit Steuerberater besprechen.</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setStep(3)}>← Zurück</button>
              <button className="btn btn-gold btn-full" onClick={() => setStep(5)}>Ergebnis →</button>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="fade-in">
            <div className="hero-kpi" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 500 }}>Überschuss / Verlust {year}</div>
              <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{fe(ueberschuss())}</div>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 8 }}>Einnahmen {fe(gesamtEin())} − Werbungskosten {fe(gesamtWK())}</div>
            </div>
            <div className="dr-list" style={{ marginBottom: 12 }}>
              <div className="dr"><span className="dr-l">Mieteinnahmen</span><span className="dr-v" style={{ color: 'var(--green)' }}>{fe(gesamtEin())}</span></div>
              <div className="dr"><span className="dr-l">{getAfaLabel()}</span><span className="dr-v" style={{ color: 'var(--red)' }}>− {fe(afaNormal)}</span></div>
              {afa.sonder7b && <div className="dr"><span className="dr-l">Sonder-AfA § 7b</span><span className="dr-v" style={{ color: 'var(--red)' }}>− {fe(afaSonder)}</span></div>}
              <div className="dr"><span className="dr-l">Schuldzinsen</span><span className="dr-v" style={{ color: 'var(--red)' }}>− {fe(parseFloat(wk.zinsen) || 0)}</span></div>
              <div className="dr"><span className="dr-l">Erhaltungsaufwand</span><span className="dr-v" style={{ color: 'var(--red)' }}>− {fe(parseFloat(wk.erhalt) || 0)}</span></div>
              <div className="dr"><span className="dr-l">Weitere Werbungskosten</span><span className="dr-v" style={{ color: 'var(--red)' }}>− {fe(gesamtWK() - afaJahr - (parseFloat(wk.zinsen) || 0) - (parseFloat(wk.erhalt) || 0))}</span></div>
            </div>

            {ankaufWarning?.ueber && (
              <div className="card card-p" style={{ background: 'rgba(255,69,58,0.08)', borderColor: 'rgba(255,69,58,0.25)', marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>🚨 Anschaffungsnahe HK-Warnung</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>Kosten über 15%-Grenze erkannt. Diese sind NICHT als Werbungskosten abziehbar. Unbedingt Steuerberater konsultieren!</div>
              </div>
            )}

            <div className="card card-p" style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.7, marginBottom: 16 }}>
              ⚠️ <strong style={{ color: 'var(--t2)' }}>Arbeitshilfe — kein Ersatz für steuerliche Beratung.</strong> Die angegebenen Werte müssen durch einen Steuerberater geprüft werden. Besonderheiten wie § 6 Abs. 1 Nr. 1a EStG, § 7b EStG, degressive AfA sind im Einzelfall zu prüfen.
            </div>
            <button className="btn btn-gold btn-full" onClick={printAnlageV}>🖨️ PDF für Steuerberater drucken</button>
            <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => setStep(1)}>Neue Berechnung</button>
            <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => router.push('/dashboard')}>Zurück</button>
          </div>
        )}
      </div>
    </div>
  )
}
