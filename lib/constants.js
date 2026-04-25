export const FRISTEN = {
  nk_abrechnung:   { tage: 365,  label: 'NK-Abrechnung erstellen', gesetz: '§ 556 BGB',   icon: '🧾', prioritaet: 'r', link: 'https://www.gesetze-im-internet.de/bgb/__556.html' },
  rauchmelder:     { tage: 365,  label: 'Rauchmelder prüfen',      gesetz: 'DIN 14676',   icon: '🔴', prioritaet: 'y', link: 'https://www.din.de/de/mitwirken/normenausschuesse/nabau/veroeffentlichungen/wdc-beuth:din21:211649334' },
  heizung_wartung: { tage: 365,  label: 'Heizungswartung',         gesetz: '1. BImSchV',  icon: '🔥', prioritaet: 'y', link: 'https://www.gesetze-im-internet.de/bimschv_1_2010/' },
  schornstein:     { tage: 365,  label: 'Schornsteinfeger',        gesetz: 'SchfHwG',     icon: '🏭', prioritaet: 'y', link: 'https://www.gesetze-im-internet.de/schfhwg/' },
  elektro:         { tage: 1460, label: 'E-Check (alle 4 Jahre)',  gesetz: 'DGUV V3',     icon: '⚡', prioritaet: 'g', link: 'https://publikationen.dguv.de/regelwerk/publikationen-nach-fachbereich/elektrotechnik/betrieb-elektrischer-anlagen/466/dguv-vorschrift-3' },
  feuerloescher:   { tage: 730,  label: 'Feuerlöscher (alle 2 Jahre)', gesetz: 'DIN 14406', icon: '🧯', prioritaet: 'y', link: 'https://www.beuth.de/de/norm/din-14406-4/114321836' },
  trinkwasser:     { tage: 1095, label: 'Trinkwasserprüfung Legionellen (alle 3 Jahre)', gesetz: 'TrinkwV § 14b', icon: '💧', prioritaet: 'g', link: 'https://www.gesetze-im-internet.de/trinkwv_2023/' },
  aufzug:          { tage: 365,  label: 'Aufzugsprüfung (ZÜS)',    gesetz: 'BetrSichV § 16', icon: '🛗', prioritaet: 'y', link: 'https://www.gesetze-im-internet.de/betrsichv_2015/' },
}

export const SANIERUNG_INTERVALLE = [
  { typ: 'Dach',             jahre: 30, icon: '🏠', gesetz: 'Empfehlung Deutsches Dachdeckerhandwerk', quelle: 'https://www.dachdecker.de/' },
  { typ: 'Heizung',          jahre: 20, icon: '🔥', gesetz: 'GEG § 72 (Betriebsverbot nach 30 Jahren)', quelle: 'https://www.gesetze-im-internet.de/geg/__72.html' },
  { typ: 'Fenster',          jahre: 25, icon: '🪟', gesetz: 'GEG § 48 (Anforderungen U-Wert)', quelle: 'https://www.gesetze-im-internet.de/geg/__48.html' },
  { typ: 'Elektroanlage',    jahre: 30, icon: '⚡', gesetz: 'DIN VDE 0100 / DGUV V3', quelle: 'https://www.vde.com/de/fnn/arbeitsgebiete/anschlussnutzung/tar-niederspannung' },
  { typ: 'Wasserleitungen',  jahre: 40, icon: '🔧', gesetz: 'DIN 1988-200 (Trinkwasser)', quelle: 'https://www.beuth.de/de/norm/din-1988-200/153148835' },
  { typ: 'Fassade / Dämmung', jahre: 20, icon: '🏢', gesetz: 'GEG § 47 (nachträgliche Dämmpflicht bei Sanierung)', quelle: 'https://www.gesetze-im-internet.de/geg/__47.html' },
  { typ: 'Bad / Sanitär',    jahre: 25, icon: '🛁', gesetz: 'Empfehlung Zentralverband Sanitär', quelle: 'https://www.zvshk.de/' },
  { typ: 'Bodenbelag',       jahre: 20, icon: '🪵', gesetz: 'Empfehlung BVT Teppich', quelle: 'https://www.bvt-teppich.de/' },
  { typ: 'Schornstein',      jahre: 30, icon: '🏭', gesetz: 'SchfHwG (regelmäßige Kehrung)', quelle: 'https://www.gesetze-im-internet.de/schfhwg/' },
]

export const HILFE_THEMEN = [
  { id: 'nk', icon: '🧾', frage: 'Wie erstelle ich eine NK-Abrechnung?',
    antwort: 'Die Nebenkostenabrechnung muss dem Mieter spätestens 12 Monate nach Ende des Abrechnungszeitraums zugehen (§ 556 BGB). Verspätete Abrechnungen sind unwirksam — du verlierst den Nachzahlungsanspruch. Nutze das NK-Tool: Kosten eingeben, Umlageschlüssel wählen, fertig. Alle Belege solltest du 10 Jahre aufbewahren.',
    link: 'https://www.gesetze-im-internet.de/bgb/__556.html' },
  { id: 'kuendigung', icon: '📋', frage: 'Welche Kündigungsfristen gelten?',
    antwort: 'Mieter: immer 3 Monate (§ 573c BGB). Vermieter: bis 5 Jahre Mietdauer = 3 Monate, 5–8 Jahre = 6 Monate, über 8 Jahre = 9 Monate. Eigenbedarfskündigung erfordert berechtigtes Interesse und muss schriftlich begründet werden. Sozialwiderspruch des Mieters ist möglich.',
    link: 'https://www.gesetze-im-internet.de/bgb/__573c.html' },
  { id: 'kaution', icon: '💰', frage: 'Kaution — was ist erlaubt?',
    antwort: 'Maximal 3 Nettokaltmieten (§ 551 BGB). Der Mieter darf in 3 gleichen Raten zahlen. Rückgabe nach Auszug: 3–6 Monate (je nach Prüfaufwand). Kaution muss zinsbringend und getrennt vom Eigenvermögen angelegt werden — z.B. Mietkautionskonto. Bei Insolvenz des Vermieters ist sie so geschützt.',
    link: 'https://www.gesetze-im-internet.de/bgb/__551.html' },
  { id: 'mieterhoehung', icon: '📈', frage: 'Wann und wie darf ich die Miete erhöhen?',
    antwort: 'Zur ortsüblichen Vergleichsmiete: frühestens 15 Monate nach Einzug oder letzter Erhöhung, max. 20% in 3 Jahren (§ 558 BGB). In Gebieten mit Mietpreisbremse: max. 15%. Immer schriftlich mit Begründung (Mietspiegel, Vergleichswohnungen oder Sachverständigengutachten). Mieter hat 2 Monate Zustimmungsfrist.',
    link: 'https://www.gesetze-im-internet.de/bgb/__558.html' },
  { id: 'renovierung', icon: '🔨', frage: 'Wer zahlt Renovierungen und Reparaturen?',
    antwort: 'Instandhaltungspflicht liegt beim Vermieter. Schönheitsreparaturen können per Klausel übertragen werden — aber viele Standardklauseln sind unwirksam! Kleinreparaturen bis ca. 100€ pro Einzelfall können dem Mieter auferlegt werden. Modernisierungen: 8% der Kosten p.a. auf Miete umlegbar (§ 559 BGB).',
    link: 'https://www.gesetze-im-internet.de/bgb/__559.html' },
  { id: 'afa', icon: '📊', frage: 'Was ist AfA und wie berechne ich sie?',
    antwort: 'AfA = Absetzung für Abnutzung (§ 7 EStG). Nur der Gebäudeanteil (nicht Grundstück) wird abgeschrieben: 2% p.a. (Baujahr nach 1924), 2,5% (vor 1925), 3% (Neubau ab 2023). Seit 01.10.2023 auch degressive AfA 5% möglich (§ 7 Abs. 5a EStG). Zusätzlich Sonder-AfA 5% für Mietwohnungsneubau möglich (§ 7b EStG). ACHTUNG: Anschaffungsnahe Herstellungskosten (§ 6 Abs. 1 Nr. 1a EStG) — Reparaturen in den ersten 3 Jahren über 15% des Kaufpreises sind KEINE Werbungskosten. Im Zweifel Steuerberater fragen!',
    link: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Einkommensteuer/2023-02-02-Nutzungsdauer-von-Gebaeuden.html' },
  { id: 'anschaffungsnah', icon: '⚠️', frage: 'Anschaffungsnahe Herstellungskosten — Vorsicht!',
    antwort: 'Dies ist eine der größten Steuerfallen beim Immobilienkauf. Reparaturen und Modernisierungen in den ersten 3 Jahren nach Kauf, die 15% der Gebäude-Anschaffungskosten übersteigen (netto), gelten als Herstellungskosten — nicht als sofort abzugsfähige Werbungskosten. Sie erhöhen die AfA-Basis und werden über 50 Jahre verteilt. Beispiel: Kauf 200.000€ (Gebäudeanteil 160.000€), dann sind alle Reparaturen über 24.000€ in 3 Jahren problematisch. Bitte unbedingt mit Steuerberater planen!',
    link: 'https://www.gesetze-im-internet.de/estg/__6.html' },
  { id: 'sonderafa', icon: '🏗️', frage: 'Sonder-AfA nach § 7b EStG (Mietwohnungsneubau)',
    antwort: '5% Sonder-AfA pro Jahr für 4 Jahre — zusätzlich zur normalen AfA. Voraussetzungen: Neubau (Bauantrag 01.09.2018–31.12.2021 oder 01.01.2023–30.09.2029), mindestens 10 Jahre vermietet, Baukostenobergrenze 5.200€/m² (neue Regel ab 2023), max. Bemessungsgrundlage 4.000€/m². Sehr strenge Anforderungen — bei Verstoß Rückabwicklung. Unbedingt Steuerberater konsultieren.',
    link: 'https://www.gesetze-im-internet.de/estg/__7b.html' },
  { id: 'dsgvo', icon: '🔒', frage: 'DSGVO: Pflichten als Vermieter',
    antwort: 'Du verarbeitest personenbezogene Daten deiner Mieter. Pflichten: Datenschutzerklärung gegenüber Mietern, Löschkonzept (Unterlagen nach 10 Jahren — Steuerrecht), sichere Speicherung. Mieterdaten dürfen nicht an Dritte ohne Einwilligung. ImmoNIQ ist DSGVO-konform, alle Daten auf EU-Servern (Supabase, Region Irland, AES-256 verschlüsselt).',
    link: 'https://dsgvo-gesetz.de/' },
  { id: 'nebenkosten_arten', icon: '📋', frage: 'Welche Nebenkosten sind umlagefähig?',
    antwort: 'Umlagefähig nach BetrKV: Heizung, Warmwasser, Aufzug, Straßenreinigung, Müllabfuhr, Hausmeister, Gebäudeversicherung, Grundsteuer, Allgemeinstrom, Gartenpflege, Schornsteinfeger, Wasserversorgung und -entwässerung. NICHT umlagefähig: Verwaltungskosten, Reparaturen, Instandhaltung, Kontoführungsgebühren.',
    link: 'https://www.gesetze-im-internet.de/betrkv/' },
  { id: 'rendite', icon: '💹', frage: 'Wie berechne ich meine Mietrendite?',
    antwort: 'Bruttorendite = (Jahres-Kaltmiete × 100) / Kaufpreis inkl. Nebenkosten. Nettorendite berücksichtigt zusätzlich: Instandhaltung (ca. 1% p.a.), Verwaltung, Mietausfallwagnis (2–4%), Leerstand. Faustregel Norddeutschland/ländlich: 4–7% brutto gut. Großstadt: 2–4%. Wichtig: Rendite allein sagt wenig — Lage, Entwicklung, Steuervorteil zählen mit.',
    link: null },
]

export const DOK_TYPEN = [
  { value: 'kaufvertrag',  label: 'Kaufvertrag',           icon: '📜' },
  { value: 'grundbuch',    label: 'Grundbuchauszug',       icon: '🏛️' },
  { value: 'finanzierung', label: 'Finanzierung / Kredit', icon: '🏦' },
  { value: 'erbe',         label: 'Erbe / Schenkung',      icon: '📋' },
  { value: 'mietvertrag',  label: 'Mietvertrag',           icon: '📋' },
  { value: 'protokoll',    label: 'Übergabeprotokoll',     icon: '🏠' },
  { value: 'versicherung', label: 'Versicherung',          icon: '🔒' },
  { value: 'steuer',       label: 'Steuerdokument',        icon: '📊' },
  { value: 'handwerker',   label: 'Handwerkerrechnung',    icon: '🔨' },
  { value: 'wartung',      label: 'Wartungsprotokoll',     icon: '🔧' },
  { value: 'energie',      label: 'Energieausweis',        icon: '⚡' },
  { value: 'behörde',      label: 'Behördendokument',      icon: '🏛️' },
  { value: 'sonstiges',    label: 'Sonstiges',             icon: '📁' },
]

// Pricing tiers
export const PREISE = [
  { tier: 'starter',  max_obj: 3,  monat: 4.99,  jahr: 49.90, ersparnis: 9.98,  label: 'Starter',  popular: false },
  { tier: 'pro',      max_obj: 10, monat: 6.99,  jahr: 69.90, ersparnis: 13.98, label: 'Pro',      popular: true  },
  { tier: 'business', max_obj: 999,monat: 12.99, jahr: 129.90,ersparnis: 25.98, label: 'Business', popular: false },
]

// BMF-Link zur AfA-Tabelle
export const BMF_AFA_LINK = 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Einkommensteuer/2023-02-02-Nutzungsdauer-von-Gebaeuden.html'
export const AFA_GESETZ_LINK = 'https://www.gesetze-im-internet.de/estg/__7.html'
