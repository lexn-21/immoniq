import Head from 'next/head'
import { useRouter } from 'next/router'

const G = '#d4af6a'

export default function Impressum() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Impressum · ImmoNIQ</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', marginBottom: 40 }}>← Zurück</button>

          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 40 }}>
            Immo<span style={{ color: G }}>NIQ</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 40, lineHeight: 1.1 }}>Impressum</h1>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Angaben gemäß § 5 TMG</h2>
            <p>
              <strong style={{ color: '#fff' }}>Leon Boomgaarden — ImmoNIQ</strong><br />
              Einzelunternehmen (Kleinunternehmer gem. § 19 UStG)<br />
              Geschäftsbezeichnung: ENTERVENTUS<br /><br />
              Kastanienallee 13<br />
              59320 Ennigerloh<br />
              Deutschland
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Kontakt</h2>
            <p>
              Telefon: +49 152 28943502<br />
              E-Mail: <a href="mailto:leonboomgaarden@gmail.com" style={{ color: G }}>leonboomgaarden@gmail.com</a>
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Umsatzsteuer</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
              <strong style={{ color: '#fff' }}>DE365353142</strong>
            </p>
            <p style={{ marginTop: 10 }}>
              Steuernummer: 346/5008/5185<br />
              Zuständiges Finanzamt: Warendorf
            </p>
            <p style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Hinweis: Als Kleinunternehmer im Sinne des § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>
              Leon Boomgaarden<br />
              Kastanienallee 13<br />
              59320 Ennigerloh
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: G }}>https://ec.europa.eu/consumers/odr/</a>
              <br />Unsere E-Mail-Adresse findest du oben im Impressum.
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Haftungsausschluss</h2>
            <p>
              <strong style={{ color: '#fff' }}>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>
            <p style={{ marginTop: 14 }}>
              <strong style={{ color: '#fff' }}>Keine Steuer- oder Rechtsberatung:</strong> Die in ImmoNIQ enthaltenen Berechnungen (z.B. AfA, Rendite, Mietwert) sind Arbeitshilfen zur Datenaufbereitung und ersetzen keine individuelle Steuer- oder Rechtsberatung durch einen Fachanwalt, Steuerberater oder vereidigten Buchprüfer. Für konkrete steuerliche oder rechtliche Einschätzungen konsultieren Sie bitte einen entsprechenden Fachberater.
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }}>Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
