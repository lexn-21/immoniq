import Head from 'next/head'
import { useRouter } from 'next/router'

const G = '#d4af6a'

export default function AGB() {
  const router = useRouter()
  const H2 = { fontSize: 16, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 32, marginBottom: 14 }
  const H3 = { fontSize: 16, fontWeight: 600, color: '#fff', marginTop: 20, marginBottom: 8 }

  return (
    <>
      <Head>
        <title>AGB · ImmoNIQ</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', marginBottom: 40 }}>← Zurück</button>

          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 40 }}>
            Immo<span style={{ color: G }}>NIQ</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 14, lineHeight: 1.1 }}>Allgemeine Geschäftsbedingungen</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>Gültig für alle Verträge mit Leon Boomgaarden — ImmoNIQ</p>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>

            <h2 style={H2}>§ 1 Geltungsbereich und Anbieter</h2>
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für sämtliche Verträge zwischen
            </p>
            <p style={{ marginTop: 10 }}>
              <strong style={{ color: '#fff' }}>Leon Boomgaarden — ImmoNIQ</strong><br />
              Kastanienallee 13, 59320 Ennigerloh<br />
              E-Mail: leonboomgaarden@gmail.com<br />
              (nachfolgend "Anbieter")
            </p>
            <p style={{ marginTop: 10 }}>
              und dem Nutzer der Software "ImmoNIQ" (nachfolgend "Nutzer" oder "Kunde").
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Nutzers werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wurde ausdrücklich schriftlich zugestimmt.
            </p>

            <h2 style={H2}>§ 2 Vertragsgegenstand</h2>
            <p>
              (1) Der Anbieter stellt dem Nutzer die Web-Anwendung "ImmoNIQ" als Software-as-a-Service (SaaS) zur Verfügung. ImmoNIQ dient der digitalen Verwaltung von vermieteten Immobilien durch Privatvermieter und umfasst Funktionen zur Objekt­verwaltung, Fristen­überwachung, Nebenkosten­abrechnung, Dokumenten­verwaltung, Rendite­berechnung sowie zur Aufbereitung steuerlicher Daten.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Der Funktionsumfang richtet sich nach der vom Nutzer gewählten Abo-Stufe (Starter, Pro, Business).
            </p>
            <p style={{ marginTop: 10 }}>
              <strong style={{ color: '#fff' }}>(3) ImmoNIQ ist ausdrücklich keine Steuer-, Rechts- oder Finanzberatung.</strong> Alle Berechnungen (z.B. AfA, Rendite, Wertschätzung) sind Arbeitshilfen und ersetzen keine individuelle Beratung durch einen Fachanwalt, Steuerberater oder vereidigten Buchprüfer.
            </p>

            <h2 style={H2}>§ 3 Vertragsschluss und Registrierung</h2>
            <p>
              (1) Der Vertrag kommt durch die Registrierung eines Benutzerkontos auf der Website immoniq.net und die Bestätigung der E-Mail-Adresse zustande. Voraussetzung ist die Annahme dieser AGB sowie der Datenschutzerklärung.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Der Nutzer versichert mit der Registrierung, dass er volljährig, voll geschäftsfähig und bei Nutzung für geschäftliche Zwecke zur Vertretung seines Unternehmens berechtigt ist.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Der Nutzer ist verpflichtet, die Zugangsdaten geheim zu halten. Bei Verdacht auf Missbrauch ist unverzüglich der Anbieter zu informieren.
            </p>

            <h2 style={H2}>§ 4 Testphase</h2>
            <p>
              (1) Neue Nutzer erhalten nach Registrierung eine kostenlose Testphase von <strong style={{ color: '#fff' }}>30 Tagen</strong>. Während der Testphase steht der volle Funktionsumfang der gewählten Abo-Stufe zur Verfügung.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Die Testphase endet automatisch. Ein kostenpflichtiges Abonnement beginnt nur, wenn der Nutzer aktiv ein Abo abschließt. Ohne Abschluss wird der Zugang nach Ablauf der Testphase eingeschränkt oder beendet.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Bei Registrierung mit einem gültigen Empfehlungscode eines Partners (z.B. Steuerberater) erhält der Nutzer 3 Monate kostenlose Nutzung statt 30 Tage.
            </p>

            <h2 style={H2}>§ 5 Preise, Zahlung und Fälligkeit</h2>
            <p>
              (1) Die aktuellen Preise ergeben sich aus der Preisliste auf der Website (Stand des Vertragsschlusses):
            </p>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li><strong style={{ color: '#fff' }}>Starter</strong> (bis 3 Objekte): 4,99 € / Monat oder 49,90 € / Jahr</li>
              <li><strong style={{ color: '#fff' }}>Pro</strong> (bis 10 Objekte): 6,99 € / Monat oder 69,90 € / Jahr</li>
              <li><strong style={{ color: '#fff' }}>Business</strong> (unbegrenzt): 12,99 € / Monat oder 129,90 € / Jahr</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              (2) Der Anbieter ist Kleinunternehmer im Sinne von § 19 Abs. 1 UStG. Es wird keine Umsatzsteuer berechnet.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe (Kreditkarte, SEPA-Lastschrift) oder PayPal. Das monatliche Entgelt ist im Voraus zu Beginn des Abrechnungszeitraums fällig.
            </p>
            <p style={{ marginTop: 10 }}>
              (4) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang bis zur vollständigen Zahlung zu sperren.
            </p>

            <h2 style={H2}>§ 6 Laufzeit und Kündigung</h2>
            <p>
              (1) Der Vertrag wird auf unbestimmte Zeit geschlossen.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Bei monatlicher Zahlung ist das Abonnement jederzeit <strong style={{ color: '#fff' }}>zum Ende des laufenden Abrechnungsmonats</strong> kündbar.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Bei jährlicher Zahlung ist das Abonnement zum Ende der Jahreslaufzeit kündbar. Eine unterjährige Kündigung ist nicht möglich, bereits gezahlte Jahresbeträge werden nicht erstattet.
            </p>
            <p style={{ marginTop: 10 }}>
              (4) Die Kündigung kann formlos per E-Mail an leonboomgaarden@gmail.com erfolgen oder direkt im Benutzerkonto.
            </p>
            <p style={{ marginTop: 10 }}>
              (5) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>

            <h2 style={H2}>§ 7 Widerrufsrecht für Verbraucher</h2>
            <p>
              Verbraucher (§ 13 BGB) haben das folgende Widerrufsrecht:
            </p>

            <h3 style={H3}>Widerrufsbelehrung</h3>
            <p>
              Du hast das Recht, binnen <strong style={{ color: '#fff' }}>vierzehn Tagen</strong> ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
            </p>
            <p style={{ marginTop: 10 }}>
              Um dein Widerrufsrecht auszuüben, musst du uns (Leon Boomgaarden, Kastanienallee 13, 59320 Ennigerloh, E-Mail: leonboomgaarden@gmail.com) mittels einer eindeutigen Erklärung (z.B. E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung vor Ablauf der Widerrufsfrist absendest.
            </p>

            <h3 style={H3}>Folgen des Widerrufs</h3>
            <p>
              Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist.
            </p>
            <p style={{ marginTop: 10 }}>
              <strong style={{ color: '#fff' }}>Vorzeitiges Erlöschen des Widerrufsrechts:</strong> Das Widerrufsrecht erlischt vorzeitig, wenn du während der Testphase oder nach Vertragsschluss ausdrücklich zugestimmt hast, dass wir mit der Ausführung des Vertrages vor Ende der Widerrufsfrist beginnen und du deine Kenntnis davon bestätigt hast, dass du durch die vollständige Vertragserfüllung dein Widerrufsrecht verlierst (§ 356 Abs. 4 BGB).
            </p>

            <h2 style={H2}>§ 8 Verfügbarkeit und Wartung</h2>
            <p>
              (1) Der Anbieter bemüht sich um eine durchschnittliche Jahresverfügbarkeit von 99%. Unterbrechungen durch technische Störungen Dritter (z.B. Supabase, Vercel, Internet-Provider) sowie geplante Wartungsfenster sind ausgenommen.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Wartungsarbeiten werden nach Möglichkeit außerhalb der üblichen Geschäftszeiten durchgeführt und rechtzeitig angekündigt.
            </p>

            <h2 style={H2}>§ 9 Datenschutz und Datensicherung</h2>
            <p>
              (1) Für die Verarbeitung personenbezogener Daten gilt ausschließlich die <a href="/datenschutz" style={{ color: G }}>Datenschutzerklärung</a>.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Der Nutzer ist verantwortlich für die Rechtmäßigkeit der von ihm in ImmoNIQ eingegebenen Daten — insbesondere hinsichtlich Daten seiner Mieter. Der Nutzer stellt sicher, dass er die gesetzlichen Informations­pflichten gegenüber betroffenen Personen erfüllt.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Der Anbieter führt regelmäßige Backups durch. Der Nutzer wird dennoch ausdrücklich darauf hingewiesen, wichtige Daten zusätzlich selbst zu sichern (Export-Funktion innerhalb der Anwendung).
            </p>

            <h2 style={H2}>§ 10 Pflichten des Nutzers</h2>
            <p>Der Nutzer verpflichtet sich:</p>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li>Keine rechtswidrigen, beleidigenden, bedrohenden oder gegen geltendes Recht verstoßenden Inhalte einzugeben.</li>
              <li>Die Zugangsdaten geheim zu halten und nicht an Dritte weiterzugeben.</li>
              <li>ImmoNIQ nicht für automatisierte Massen-Abfragen, Scraping oder zum Nachbau ähnlicher Dienste zu verwenden.</li>
              <li>Rechte Dritter (z.B. Urheberrecht, Datenschutz) nicht zu verletzen.</li>
            </ul>

            <h2 style={H2}>§ 11 Haftung</h2>
            <p>
              (1) Der Anbieter haftet unbeschränkt für Schäden aus Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung des Anbieters oder seiner gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen, sowie für Schäden, die vom Anwendungsbereich einer gegebenen Garantie oder Zusicherung umfasst sind.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit.
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p style={{ marginTop: 10 }}>
              (4) Im Übrigen ist die Haftung ausgeschlossen.
            </p>
            <p style={{ marginTop: 14, padding: 14, background: 'rgba(212,175,106,0.08)', border: '0.5px solid rgba(212,175,106,0.25)', borderRadius: 10 }}>
              <strong style={{ color: '#fff' }}>(5) Besonderer Haftungsausschluss für Berechnungen:</strong> Alle in ImmoNIQ dargestellten Berechnungen — insbesondere AfA-Berechnungen (§§ 7, 7b EStG), Prüfung anschaffungsnaher Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG), Renditen, Wertschätzungen und Nebenkosten­abrechnungen — sind ausschließlich Arbeitshilfen zur Datenvorbereitung. Sie ersetzen nicht die steuerliche oder rechtliche Prüfung durch einen qualifizierten Fachberater. Der Anbieter übernimmt keine Haftung für steuerliche oder rechtliche Folgen, die aus der Nutzung dieser Berechnungen entstehen.
            </p>

            <h2 style={H2}>§ 12 Änderungen der AGB</h2>
            <p>
              Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern, wenn dies aus triftigen Gründen (z.B. gesetzliche Änderungen, höchstrichterliche Rechtsprechung, wirtschaftliche Notwendigkeiten) erforderlich wird. Änderungen werden dem Nutzer per E-Mail mitgeteilt. Widerspricht der Nutzer nicht binnen 6 Wochen nach Zugang der Änderungsmitteilung, gelten die Änderungen als akzeptiert. Der Nutzer wird in der Änderungsmitteilung auf sein Widerspruchsrecht und die Folgen hingewiesen.
            </p>

            <h2 style={H2}>§ 13 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p style={{ marginTop: 10 }}>
              (2) Erfüllungsort und Gerichtsstand für alle Streitigkeiten ist — soweit gesetzlich zulässig — der Wohnsitz des Anbieters (Ennigerloh, Deutschland).
            </p>
            <p style={{ marginTop: 10 }}>
              (3) Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.
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
