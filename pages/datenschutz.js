import Head from 'next/head'
import { useRouter } from 'next/router'

const G = '#d4af6a'

export default function Datenschutz() {
  const router = useRouter()
  const H2 = { fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }
  const H3 = { fontSize: 16, fontWeight: 600, color: '#fff', marginTop: 24, marginBottom: 10 }

  return (
    <>
      <Head>
        <title>Datenschutzerklärung · ImmoNIQ</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', marginBottom: 40 }}>← Zurück</button>

          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 40 }}>
            Immo<span style={{ color: G }}>NIQ</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 40, lineHeight: 1.1 }}>Datenschutz­erklärung</h1>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>

            <h2 style={H2}>1. Verantwortlicher</h2>
            <p>
              Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
            </p>
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: '#fff' }}>Leon Boomgaarden — ImmoNIQ</strong><br />
              Kastanienallee 13<br />
              59320 Ennigerloh<br />
              Deutschland<br /><br />
              Telefon: +49 152 28943502<br />
              E-Mail: <a href="mailto:leonboomgaarden@gmail.com" style={{ color: G }}>leonboomgaarden@gmail.com</a>
            </p>

            <h2 style={H2}>2. Allgemeine Hinweise</h2>
            <p>
              Der Schutz deiner persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten deine Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TDDDG, BDSG). In dieser Datenschutzerklärung informieren wir dich über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website und der ImmoNIQ-Anwendung.
            </p>

            <h2 style={H2}>3. Hosting und Auftragsverarbeitung</h2>
            <h3 style={H3}>3.1 Vercel (Hosting der Website)</h3>
            <p>
              Unsere Website wird gehostet bei:<br />
              Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA
            </p>
            <p style={{ marginTop: 10 }}>
              Vercel betreibt Rechenzentren in der EU (Frankfurt am Main). Beim Besuch unserer Website werden automatisch technische Daten (IP-Adresse, Browsertyp, Zugriffszeit) verarbeitet. Mit Vercel wurde ein Auftragsverarbeitungsvertrag (DPA) gemäß Art. 28 DSGVO geschlossen. Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: G }}>Vercel Datenschutzerklärung</a>.
            </p>

            <h3 style={H3}>3.2 Supabase (Datenbank und Authentifizierung)</h3>
            <p>
              Anwendungsdaten (Benutzerkonten, Objekte, Aufgaben, Dokumente) werden verarbeitet bei:<br />
              Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992
            </p>
            <p style={{ marginTop: 10 }}>
              Die Datenbank und der Dateispeicher befinden sich physisch in der EU-Region <strong style={{ color: '#fff' }}>Europe (Ireland, eu-west-1)</strong>. Mit Supabase wurde ein Auftragsverarbeitungsvertrag (DPA) gemäß Art. 28 DSGVO geschlossen. Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: G }}>Supabase Datenschutzerklärung</a>.
            </p>
            <p style={{ marginTop: 10 }}>
              Sicherheitsmaßnahmen: AES-256-Verschlüsselung at-rest, TLS 1.2+ in-transit, Row Level Security für alle Anwendungsdaten.
            </p>

            <h2 style={H2}>4. Erhobene Daten und Zwecke der Verarbeitung</h2>

            <h3 style={H3}>4.1 Server-Logfiles</h3>
            <p>
              Beim Besuch der Website werden automatisch folgende Daten vom Hosting-Provider erfasst: IP-Adresse, Datum und Uhrzeit des Zugriffs, verwendeter Browser und Betriebssystem, aufgerufene URLs.
              <br />Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Stabilität und Sicherheit). Speicherdauer: max. 14 Tage.
            </p>

            <h3 style={H3}>4.2 Registrierung und Benutzerkonto</h3>
            <p>
              Bei der Registrierung erfassen wir: E-Mail-Adresse, Name, Passwort (gehashed mit bcrypt). Optional: eingegebener Empfehlungscode eines Steuerberaters.
              <br />Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Speicherdauer: bis zur Kontolöschung.
            </p>

            <h3 style={H3}>4.3 Anwendungsdaten</h3>
            <p>
              Du entscheidest selbst, welche Daten du in ImmoNIQ speicherst. Typische Daten sind:
            </p>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li>Immobilien-Stammdaten (Adresse, Fläche, Baujahr, Kaufpreis)</li>
              <li>Mieter-Daten (Name, Kontaktdaten, Mietverhältnis)</li>
              <li>Finanzielle Daten (Miete, Nebenkosten, Zahlungen)</li>
              <li>Dokumente im Tresor (Mietverträge, Kaufverträge, Grundbuchauszüge)</li>
              <li>Kontaktdaten des Steuerberaters (falls eingetragen)</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Speicherdauer: bis zur Löschung durch dich oder Kontolöschung.
            </p>

            <h3 style={H3}>4.4 Mieter-Daten — besondere Verantwortung</h3>
            <p>
              Wenn du Daten deiner Mieter in ImmoNIQ speicherst, bist <strong style={{ color: '#fff' }}>du</strong> der Verantwortliche im Sinne der DSGVO gegenüber deinen Mietern. Du bist verpflichtet, deine Mieter über die Datenverarbeitung zu informieren und eine entsprechende Rechtsgrundlage (meist Art. 6 Abs. 1 lit. b DSGVO — Mietvertrag) zu gewährleisten. ImmoNIQ agiert dabei als Auftragsverarbeiter.
            </p>

            <h2 style={H2}>5. Cookies und ähnliche Technologien</h2>
            <p>
              ImmoNIQ verwendet ausschließlich <strong style={{ color: '#fff' }}>technisch notwendige Cookies</strong>, die für den Betrieb der Anwendung erforderlich sind:
            </p>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li>Session-Cookie (Supabase Authentifizierung) — hält deine Anmeldung aufrecht</li>
              <li>Lokaler Speicher (localStorage) — speichert Einstellungen auf deinem Gerät</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Diese Cookies sind nach Art. 25 Abs. 2 TDDDG einwilligungsfrei. Ein Cookie-Banner ist daher nicht erforderlich. Marketing-, Tracking- oder Analyse-Cookies setzen wir derzeit nicht ein.
            </p>

            <h2 style={H2}>6. Zahlungsabwicklung</h2>
            <p>
              Zahlungen werden über Stripe Payments Europe, Ltd. (The One Building, 1 Grand Canal Street Lower, Dublin 2, Irland) abgewickelt. Stripe erhebt hierfür die erforderlichen Zahlungsdaten. Weitere Informationen: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" style={{ color: G }}>Stripe Datenschutzerklärung</a>.
            </p>
            <p style={{ marginTop: 10 }}>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
            </p>

            <h2 style={H2}>7. Transaktions-E-Mails</h2>
            <p>
              Bei Registrierung und Passwort-Zurücksetzung verschickt Supabase Bestätigungs-E-Mails in unserem Auftrag. Es handelt sich ausschließlich um technisch erforderliche E-Mails (keine Werbung).
            </p>

            <h2 style={H2}>8. Deine Rechte als betroffene Person</h2>
            <p>Dir stehen folgende Rechte bezüglich deiner personenbezogenen Daten zu:</p>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li><strong style={{ color: '#fff' }}>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
              <li><strong style={{ color: '#fff' }}>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong style={{ color: '#fff' }}>Recht auf Löschung</strong> (Art. 17 DSGVO) — "Recht auf Vergessenwerden"</li>
              <li><strong style={{ color: '#fff' }}>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong style={{ color: '#fff' }}>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong style={{ color: '#fff' }}>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
              <li><strong style={{ color: '#fff' }}>Beschwerderecht</strong> bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p style={{ marginTop: 14 }}>
              Zur Ausübung deiner Rechte kontaktiere uns einfach per E-Mail: <a href="mailto:leonboomgaarden@gmail.com" style={{ color: G }}>leonboomgaarden@gmail.com</a>
            </p>
            <p style={{ marginTop: 14 }}>
              Zuständige Aufsichtsbehörde für Nordrhein-Westfalen:<br />
              Landesbeauftragte für Datenschutz und Informationsfreiheit NRW<br />
              Kavalleriestraße 2–4, 40213 Düsseldorf<br />
              <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: G }}>www.ldi.nrw.de</a>
            </p>

            <h2 style={H2}>9. Datenlöschung / Kontolöschung</h2>
            <p>
              Du kannst dein Konto jederzeit löschen. Schicke dazu eine formlose Nachricht an <a href="mailto:leonboomgaarden@gmail.com" style={{ color: G }}>leonboomgaarden@gmail.com</a>. Nach der Löschung werden alle deine Daten innerhalb von 30 Tagen unwiederbringlich entfernt. Gesetzlich vorgeschriebene Aufbewahrungsfristen (z.B. Rechnungen nach § 147 AO: 10 Jahre) bleiben davon unberührt.
            </p>

            <h2 style={H2}>10. SSL-/TLS-Verschlüsselung</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennst du am "https://"-Präfix und dem Schloss-Symbol in deiner Browserzeile.
            </p>

            <h2 style={H2}>11. Änderungen dieser Erklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn dies aufgrund neuer Technologien oder rechtlicher Änderungen erforderlich ist. Die jeweils aktuelle Version findest du stets unter dieser URL.
            </p>

            <p style={{ marginTop: 40, paddingTop: 20, borderTop: '0.5px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
