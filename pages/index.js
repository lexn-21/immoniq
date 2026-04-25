import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const G = '#d4af6a'

export default function Landing() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [active, setActive] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setCurrentTestimonial(c => (c + 1) % 3), 5500)
    return () => clearInterval(i)
  }, [])

  // Intersection observer for sections
  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view')
      })
    }, { threshold: 0.15 })
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <Head>
        <title>ImmoNIQ — Das smarte Betriebssystem für Privatvermieter</title>
        <meta name="description" content="Deine Immobilien. Ein Tool. Null Chaos. NK-Abrechnung, Fristen, Steuer-Vorbereitung und Tresor. DSGVO-konform, EU-Server." />
        <meta property="og:title" content="ImmoNIQ — Vermietung ohne Chaos" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <style jsx global>{`
        :root {
          --g: #d4af6a;
          --gl: #e6c78a;
          --bg: #000;
          --bg2: #0a0a0a;
          --bg3: #141414;
          --line: rgba(255,255,255,0.08);
          --t1: #fff;
          --t2: rgba(255,255,255,0.7);
          --t3: rgba(255,255,255,0.5);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
          background: #000;
          color: #fff;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        a { color: inherit; text-decoration: none; }

        .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 640px) { .container { padding: 0 18px; } }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 0;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          background: rgba(0,0,0,0.6);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease;
        }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.04em; }
        .logo span { color: var(--g); }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-link { font-size: 14px; color: var(--t2); transition: color 0.2s; font-weight: 500; }
        .nav-link:hover { color: #fff; }
        @media (max-width: 768px) { .nav-links { gap: 14px; } .nav-link:not(.cta) { display: none; } }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 22px; border-radius: 100px;
          font-size: 14px; font-weight: 600;
          transition: all 0.2s ease; cursor: pointer;
          letter-spacing: -0.01em;
        }
        .btn-gold { background: var(--g); color: #000; }
        .btn-gold:hover { background: var(--gl); transform: translateY(-1px); box-shadow: 0 10px 30px rgba(212,175,106,0.35); }
        .btn-outline { background: rgba(255,255,255,0.05); color: #fff; border: 0.5px solid rgba(255,255,255,0.15); }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        .btn-lg { padding: 16px 32px; font-size: 15px; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,106,0.15), transparent 60%),
            radial-gradient(ellipse 60% 60% at 100% 100%, rgba(212,175,106,0.08), transparent 50%);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.4;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%);
        }
        .hero-inner {
          position: relative;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 50px; text-align: center; }
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 100px;
          background: rgba(212,175,106,0.08);
          border: 0.5px solid rgba(212,175,106,0.25);
          font-size: 12px; font-weight: 500; color: var(--g);
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease 0.1s both;
        }
        .hero-badge::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--g);
          box-shadow: 0 0 10px var(--g);
          animation: pulse 2s ease infinite;
        }
        .hero h1 {
          font-size: clamp(38px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.02;
          letter-spacing: -0.045em;
          margin-bottom: 22px;
          animation: fadeInUp 0.6s ease 0.2s both;
        }
        .hero h1 .gold { background: linear-gradient(135deg, var(--g) 0%, var(--gl) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-sub {
          font-size: clamp(16px, 2vw, 20px);
          color: var(--t2);
          max-width: 520px;
          margin-bottom: 36px;
          line-height: 1.55;
          animation: fadeInUp 0.6s ease 0.3s both;
        }
        @media (max-width: 1024px) { .hero-sub { margin-left: auto; margin-right: auto; } }
        .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; animation: fadeInUp 0.6s ease 0.4s both; }
        @media (max-width: 1024px) { .hero-cta { justify-content: center; } }
        .hero-trust {
          margin-top: 32px;
          display: flex;
          gap: 28px;
          font-size: 13px;
          color: var(--t3);
          animation: fadeInUp 0.6s ease 0.5s both;
        }
        .hero-trust-item { display: flex; align-items: center; gap: 7px; }
        .hero-trust-item::before { content: '✓'; color: var(--g); font-weight: 700; }
        @media (max-width: 1024px) { .hero-trust { justify-content: center; flex-wrap: wrap; } }

        /* Hero Mockup */
        .mockup-wrap {
          position: relative;
          perspective: 1400px;
          animation: fadeIn 1s ease 0.5s both;
        }
        .mockup {
          position: relative;
          border-radius: 26px;
          overflow: hidden;
          background: linear-gradient(145deg, #0f0f0f 0%, #050505 100%);
          border: 0.5px solid rgba(255,255,255,0.08);
          box-shadow:
            0 60px 120px rgba(0,0,0,0.8),
            0 0 0 1px rgba(212,175,106,0.08),
            inset 0 1px 0 rgba(255,255,255,0.05);
          transform: rotateY(-8deg) rotateX(4deg);
          transition: transform 0.4s cubic-bezier(0.2, 0, 0.1, 1);
        }
        .mockup:hover { transform: rotateY(-4deg) rotateX(2deg); }
        @media (max-width: 1024px) {
          .mockup { transform: none; max-width: 480px; margin: 0 auto; }
        }
        .mockup-bar {
          padding: 14px 18px;
          background: rgba(255,255,255,0.02);
          border-bottom: 0.5px solid rgba(255,255,255,0.06);
          display: flex; gap: 7px;
        }
        .mockup-dot { width: 12px; height: 12px; border-radius: 50%; background: #333; }
        .mockup-dot.r { background: #ff5f57; }
        .mockup-dot.y { background: #febc2e; }
        .mockup-dot.g { background: #28c840; }
        .mockup-content { padding: 26px; }
        .mockup-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .mockup-title { font-size: 13px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.08em; }
        .mockup-hero {
          background: linear-gradient(135deg, rgba(212,175,106,0.12) 0%, rgba(212,175,106,0.04) 100%);
          border: 0.5px solid rgba(212,175,106,0.2);
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 18px;
        }
        .mockup-hero-label { font-size: 11px; color: var(--g); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .mockup-hero-val { font-size: 38px; font-weight: 700; letter-spacing: -0.035em; margin-bottom: 6px; }
        .mockup-hero-sub { font-size: 12px; color: var(--g); }
        .mockup-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .mockup-kpi { background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; }
        .mockup-kpi-val { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3px; }
        .mockup-kpi-lbl { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; }
        .mockup-chart { display: flex; align-items: flex-end; gap: 6px; height: 70px; padding-top: 14px; }
        .mockup-bar { flex: 1; border-radius: 4px 4px 0 0; background: rgba(255,255,255,0.08); transition: all 0.3s; }
        .mockup-bar.active { background: linear-gradient(180deg, var(--g) 0%, rgba(212,175,106,0.6) 100%); box-shadow: 0 0 20px rgba(212,175,106,0.4); }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.9); } }
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        /* Stats band */
        .stats-band {
          padding: 60px 0;
          border-top: 0.5px solid var(--line);
          border-bottom: 0.5px solid var(--line);
          background: rgba(255,255,255,0.01);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 30px; } }
        .stat { text-align: center; }
        .stat-val {
          font-size: clamp(30px, 4vw, 44px);
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--g), var(--gl));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
          line-height: 1;
        }
        .stat-lbl { font-size: 13px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.08em; }

        /* SECTIONS */
        section { padding: 100px 0; position: relative; }
        @media (max-width: 768px) { section { padding: 70px 0; } }
        .sec-head { text-align: center; margin-bottom: 60px; }
        .sec-eye { font-size: 13px; color: var(--g); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; font-weight: 600; }
        .sec-title {
          font-size: clamp(28px, 4.5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.05;
          margin-bottom: 16px;
        }
        .sec-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          color: var(--t2);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.55;
        }

        /* Problem section */
        .problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 50px; }
        @media (max-width: 900px) { .problem-grid { grid-template-columns: 1fr; } }
        .problem-card {
          background: linear-gradient(180deg, rgba(255,60,60,0.04), rgba(255,60,60,0.01));
          border: 0.5px solid rgba(255,100,100,0.15);
          border-radius: 18px;
          padding: 28px;
          transition: all 0.3s;
        }
        .problem-card:hover { border-color: rgba(255,100,100,0.3); transform: translateY(-2px); }
        .problem-ic { font-size: 32px; margin-bottom: 16px; }
        .problem-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; letter-spacing: -0.02em; }
        .problem-text { font-size: 14px; color: var(--t2); line-height: 1.6; }

        /* Features grid - slide style */
        .feature-slide {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 100px;
          padding: 50px 0;
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.2, 0, 0.1, 1);
        }
        .feature-slide.in-view { opacity: 1; transform: translateY(0); }
        .feature-slide.reverse { direction: rtl; }
        .feature-slide.reverse > * { direction: ltr; }
        @media (max-width: 900px) { .feature-slide { grid-template-columns: 1fr; gap: 40px; } .feature-slide.reverse { direction: ltr; } }
        .feature-content h3 {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin-bottom: 18px;
        }
        .feature-content .eye { font-size: 12px; color: var(--g); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; font-weight: 600; }
        .feature-content p { font-size: 16px; color: var(--t2); line-height: 1.7; margin-bottom: 24px; }
        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; color: var(--t2); }
        .feature-item::before {
          content: '✓'; flex-shrink: 0;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(212,175,106,0.15);
          color: var(--g);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          margin-top: 1px;
        }

        /* Visual mockups */
        .visual {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          background: linear-gradient(145deg, #0f0f0f, #050505);
          border: 0.5px solid rgba(255,255,255,0.08);
          padding: 28px;
          min-height: 340px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
        .visual-fristen .row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          margin-bottom: 10px;
          border: 0.5px solid rgba(255,255,255,0.04);
        }
        .visual-fristen .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 12px; }
        .visual-fristen .dot.r { background: #ff453a; box-shadow: 0 0 10px #ff453a; }
        .visual-fristen .dot.y { background: var(--g); }
        .visual-fristen .dot.g { background: #30d158; }
        .visual-fristen .txt { flex: 1; font-size: 14px; }
        .visual-fristen .meta { font-size: 11px; color: var(--g); margin-top: 3px; }
        .visual-fristen .tag { font-size: 11px; padding: 3px 8px; border-radius: 100px; font-weight: 600; }
        .visual-fristen .tag.r { background: rgba(255,69,58,0.15); color: #ff6b60; }
        .visual-fristen .tag.y { background: rgba(212,175,106,0.15); color: var(--g); }

        .visual-tresor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-content: start; }
        .visual-tresor-card {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 14px;
          text-align: center;
          transition: all 0.2s;
        }
        .visual-tresor-card:hover { border-color: rgba(212,175,106,0.3); background: rgba(212,175,106,0.04); }
        .visual-tresor-ic { font-size: 22px; margin-bottom: 8px; }
        .visual-tresor-lbl { font-size: 11px; font-weight: 600; margin-bottom: 3px; }
        .visual-tresor-count { font-size: 10px; color: var(--t3); }

        .visual-rendite .panel {
          background: linear-gradient(135deg, rgba(212,175,106,0.08), rgba(212,175,106,0.02));
          border: 0.5px solid rgba(212,175,106,0.2);
          border-radius: 16px;
          padding: 22px;
        }
        .visual-rendite .label { font-size: 11px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .visual-rendite .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .visual-rendite .big-val { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: #30d158; }
        .visual-rendite .big-val.gold { color: var(--g); }
        .visual-rendite .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 0.5px solid rgba(255,255,255,0.04); }
        .visual-rendite .row:last-child { border: none; }
        .visual-rendite .row span:last-child { font-weight: 600; font-variant-numeric: tabular-nums; }

        .visual-steuer .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .visual-steuer .header-title { font-size: 14px; font-weight: 600; }
        .visual-steuer .header-meta { font-size: 11px; color: var(--t3); }
        .visual-steuer .hero-val { font-size: 34px; font-weight: 700; color: #30d158; letter-spacing: -0.03em; margin-bottom: 4px; }
        .visual-steuer .hero-sub { font-size: 12px; color: var(--t3); margin-bottom: 20px; }
        .visual-steuer .rows { background: rgba(255,255,255,0.02); border-radius: 12px; padding: 4px 0; }
        .visual-steuer .rows > div { display: flex; justify-content: space-between; padding: 9px 16px; font-size: 12px; border-bottom: 0.5px solid rgba(255,255,255,0.03); }
        .visual-steuer .rows > div:last-child { border: none; font-weight: 700; background: rgba(212,175,106,0.05); }
        .visual-steuer .warn { margin-top: 12px; padding: 10px 14px; background: rgba(255,69,58,0.08); border-left: 2px solid #ff453a; border-radius: 4px; font-size: 11px; color: rgba(255,140,130,0.9); line-height: 1.5; }

        /* Testimonials */
        .testimonials { background: linear-gradient(180deg, rgba(212,175,106,0.02), transparent); }
        .testi-wrap { max-width: 760px; margin: 0 auto; position: relative; min-height: 260px; }
        .testi {
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.6s;
          text-align: center;
          padding: 0 20px;
        }
        .testi.active { opacity: 1; position: relative; }
        .testi-quote {
          font-size: clamp(18px, 2.4vw, 26px);
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.02em;
          margin-bottom: 30px;
          color: var(--t1);
        }
        .testi-author { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .testi-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--g), var(--gl)); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #000; }
        .testi-meta { text-align: left; }
        .testi-name { font-size: 14px; font-weight: 600; }
        .testi-role { font-size: 12px; color: var(--t3); }
        .testi-dots { display: flex; gap: 8px; justify-content: center; margin-top: 40px; }
        .testi-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15); cursor: pointer; transition: all 0.3s; }
        .testi-dot.active { background: var(--g); width: 28px; border-radius: 100px; }

        /* Pricing */
        .pricing { background: linear-gradient(180deg, transparent, rgba(212,175,106,0.02)); }
        .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1040px; margin: 0 auto; }
        @media (max-width: 900px) { .roadmap-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .roadmap-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px) { .price-grid { grid-template-columns: 1fr; max-width: 440px; } }
        .price {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005));
          border: 0.5px solid var(--line);
          border-radius: 24px;
          padding: 36px 30px;
          position: relative;
          transition: all 0.3s;
        }
        .price:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
        .price.featured {
          border-color: rgba(212,175,106,0.4);
          background: linear-gradient(180deg, rgba(212,175,106,0.06), rgba(212,175,106,0.01));
          box-shadow: 0 30px 60px rgba(212,175,106,0.1);
        }
        .price-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--g); color: #000;
          font-size: 11px; font-weight: 700;
          padding: 5px 14px; border-radius: 100px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .price-name { font-size: 14px; color: var(--g); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 16px; }
        .price-val { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
        .price-val-num { font-size: 44px; font-weight: 700; letter-spacing: -0.03em; }
        .price-val-per { font-size: 14px; color: var(--t3); }
        .price-yearly { font-size: 12px; color: var(--g); margin-bottom: 22px; }
        .price-units { font-size: 13px; color: var(--t2); margin-bottom: 24px; padding-bottom: 24px; border-bottom: 0.5px solid var(--line); }
        .price-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
        .price-feat { font-size: 14px; color: var(--t2); display: flex; gap: 10px; align-items: flex-start; }
        .price-feat::before { content: '✓'; color: var(--g); font-weight: 700; flex-shrink: 0; }

        /* Final CTA */
        .final-cta {
          padding: 120px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .final-cta-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,106,0.15), transparent 60%);
          pointer-events: none;
        }
        .final-cta-inner { position: relative; max-width: 720px; margin: 0 auto; }
        .final-cta h2 {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 20px;
        }
        .final-cta p { font-size: 18px; color: var(--t2); margin-bottom: 40px; }

        /* Footer */
        footer {
          padding: 40px 0;
          border-top: 0.5px solid var(--line);
          font-size: 13px;
          color: var(--t3);
        }
        .foot-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .foot-links { display: flex; gap: 20px; }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="container nav-inner">
          <div className="logo">Immo<span>NIQ</span></div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Preise</a>
            <a href="#testimonials" className="nav-link">Stimmen</a>
            <button className="btn btn-outline nav-link" onClick={() => router.push('/auth')}>Anmelden</button>
            <button className="btn btn-gold nav-link cta" onClick={() => router.push('/auth?mode=signup')}>Kostenlos testen</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div>
            <div className="hero-badge">Das Tool, das dein Steuerberater dir empfiehlt</div>
            <h1>
              Deine Immobilien.<br />
              Ein Tool.<br />
              <span className="gold">Null Chaos.</span>
            </h1>
            <p className="hero-sub">
              ImmoNIQ ist das Betriebssystem für Privatvermieter. Du sammelst deine Daten sauber, dein Steuerberater kriegt am Jahresende einen Klick-fertigen Report. Du sparst 200-400€ Honorar. Er spart Zeit. Beide sparen Nerven.
            </p>
            <div className="hero-cta">
              <button className="btn btn-gold btn-lg" onClick={() => router.push('/auth?mode=signup')}>
                30 Tage kostenlos testen →
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Features ansehen
              </button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">Keine Kreditkarte</div>
              <div className="hero-trust-item">Jederzeit kündbar</div>
              <div className="hero-trust-item">Daten-Export jederzeit</div>
            </div>
          </div>

          <div className="mockup-wrap">
            <div className="mockup">
              <div className="mockup-bar">
                <div className="mockup-dot r" />
                <div className="mockup-dot y" />
                <div className="mockup-dot g" />
              </div>
              <div className="mockup-content">
                <div className="mockup-row">
                  <div className="mockup-title">Portfolio</div>
                  <div style={{ fontSize: 11, color: G, padding: '3px 10px', background: 'rgba(212,175,106,0.1)', borderRadius: 100 }}>April 2026</div>
                </div>
                <div className="mockup-hero">
                  <div className="mockup-hero-label">Monatliche Einnahmen</div>
                  <div className="mockup-hero-val">4.280 €</div>
                  <div className="mockup-hero-sub">↑ 5 von 6 vermietet · 51.360 € / Jahr</div>
                </div>
                <div className="mockup-grid">
                  <div className="mockup-kpi"><div className="mockup-kpi-val">6</div><div className="mockup-kpi-lbl">Objekte</div></div>
                  <div className="mockup-kpi"><div className="mockup-kpi-val" style={{ color: G }}>5</div><div className="mockup-kpi-lbl">Vermietet</div></div>
                  <div className="mockup-kpi"><div className="mockup-kpi-val" style={{ color: '#ff453a' }}>2</div><div className="mockup-kpi-lbl">Fristen</div></div>
                  <div className="mockup-kpi"><div className="mockup-kpi-val">3</div><div className="mockup-kpi-lbl">Msg</div></div>
                </div>
                <div className="mockup-chart">
                  {[0.55, 0.70, 0.65, 0.80, 0.88, 1.0].map((h, i) => (
                    <div key={i} className={`mockup-bar ${i === 5 ? 'active' : ''}`} style={{ height: `${h * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        <div className="container stats-grid">
          <div className="stat"><div className="stat-val">3 Min</div><div className="stat-lbl">NK-Abrechnung</div></div>
          <div className="stat"><div className="stat-val">~400€</div><div className="stat-lbl">Steuerberater-Ersparnis</div></div>
          <div className="stat"><div className="stat-val">8 Std</div><div className="stat-lbl">Zeit / Jahr / Objekt</div></div>
          <div className="stat"><div className="stat-val">100%</div><div className="stat-lbl">DSGVO-konform</div></div>
        </div>
      </div>

      {/* PROBLEM */}
      <section data-section>
        <div className="container">
          <div className="sec-head">
            <div className="sec-eye">Warum ImmoNIQ</div>
            <h2 className="sec-title">Vermieten sollte kein<br/>Vollzeitjob sein.</h2>
            <p className="sec-sub">Drei typische Kopfschmerzen — und wie ImmoNIQ sie löst.</p>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-ic">📋</div>
              <div className="problem-title">Verpasste NK-Frist?<br/>Keine Nachzahlung.</div>
              <div className="problem-text">§ 556 BGB: Kommt deine Abrechnung 1 Tag zu spät, verlierst du den Nachzahlungs­anspruch. Jahr für Jahr. ImmoNIQ erinnert dich automatisch.</div>
            </div>
            <div className="problem-card">
              <div className="problem-ic">📁</div>
              <div className="problem-title">Chaotische Ordner.<br/>Dokumente verstreut.</div>
              <div className="problem-text">Mietvertrag in Gmail, Kaufvertrag im Schrank, Grundbuch in Dropbox. Beim Verkauf, bei der Steuer, im Streitfall — sofort weg. Der Tresor bringt alles zusammen.</div>
            </div>
            <div className="problem-card">
              <div className="problem-ic">📊</div>
              <div className="problem-title">Anlage V:<br/>Excel-Frust pur.</div>
              <div className="problem-text">Du sammelst 50 Belege, Steuerberater rechnet für 400€ durch. ImmoNIQ bereitet alles strukturiert vor — du sparst Beraterhonorar oder Zeit.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SLIDES */}
      <section id="features">
        <div className="container">
          <div className="sec-head">
            <div className="sec-eye">Features</div>
            <h2 className="sec-title">Alles drin.<br/>Nichts zu viel.</h2>
          </div>

          {/* Slide 1: Dashboard */}
          <div className="feature-slide" data-section>
            <div className="feature-content">
              <div className="eye">Übersicht</div>
              <h3>Dein komplettes Portfolio auf einen Blick.</h3>
              <p>Einnahmen, Leerstand, anstehende Fristen, unbeantwortete Nachrichten — alles in einer schönen Ansicht. Wie TradeRepublic, aber für Immobilien.</p>
              <div className="feature-list">
                <div className="feature-item">Live-Einnahmen-Trend mit 6-Monats-Chart</div>
                <div className="feature-item">Pop-up-Warnung bei Fristen ≤7 Tage</div>
                <div className="feature-item">Mobile App (PWA) — installierbar wie native App</div>
              </div>
            </div>
            <div className="visual">
              <div className="mockup-row">
                <div className="mockup-title">Dashboard</div>
                <div style={{ fontSize: 11, color: '#30d158' }}>● Live</div>
              </div>
              <div className="mockup-hero" style={{ margin: 0 }}>
                <div className="mockup-hero-label">Monatliche Einnahmen</div>
                <div className="mockup-hero-val">4.280 €</div>
                <div className="mockup-hero-sub">5 von 6 Objekten vermietet</div>
              </div>
              <div className="mockup-chart" style={{ marginTop: 20 }}>
                {[0.55, 0.70, 0.65, 0.80, 0.88, 1.0].map((h, i) => (
                  <div key={i} className={`mockup-bar ${i === 5 ? 'active' : ''}`} style={{ height: `${h * 100}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Slide 2: Fristen */}
          <div className="feature-slide reverse" data-section>
            <div className="feature-content">
              <div className="eye">Fristen-Automatik</div>
              <h3>Kein Paragraph wird dich je wieder kalt erwischen.</h3>
              <p>Sobald du ein Objekt anlegst, erstellt ImmoNIQ automatisch alle gesetzlichen Fristen — vom Rauchmelder bis zur NK-Abrechnung. Mit Link zum Gesetzestext und Push-Benachrichtigung.</p>
              <div className="feature-list">
                <div className="feature-item">Alle Fristen mit § und Verweis auf gesetze-im-internet.de</div>
                <div className="feature-item">Überfällig / 14 Tage / 3 Monate — automatisch sortiert</div>
                <div className="feature-item">Sanierungs-Empfehlungen basierend auf GEG, DIN-Normen, DGUV V3</div>
              </div>
            </div>
            <div className="visual visual-fristen">
              <div className="mockup-row"><div className="mockup-title">Fristen</div><div style={{ fontSize: 11, color: '#ff453a' }}>2 überfällig</div></div>
              <div className="row">
                <div className="dot r" />
                <div className="txt">
                  <div style={{ fontWeight: 500 }}>NK-Abrechnung 2025</div>
                  <div className="meta">§ 556 BGB →</div>
                </div>
                <span className="tag r">Heute</span>
              </div>
              <div className="row">
                <div className="dot y" />
                <div className="txt">
                  <div style={{ fontWeight: 500 }}>Rauchmelder-Prüfung</div>
                  <div className="meta">DIN 14676 →</div>
                </div>
                <span className="tag y">12T</span>
              </div>
              <div className="row">
                <div className="dot y" />
                <div className="txt">
                  <div style={{ fontWeight: 500 }}>Heizungswartung</div>
                  <div className="meta">1. BImSchV →</div>
                </div>
                <span className="tag y">28T</span>
              </div>
              <div className="row">
                <div className="dot g" />
                <div className="txt">
                  <div style={{ fontWeight: 500 }}>Schornsteinfeger</div>
                  <div className="meta">SchfHwG →</div>
                </div>
                <span className="tag y" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--t3)' }}>92T</span>
              </div>
            </div>
          </div>

          {/* Slide 3: Tresor */}
          <div className="feature-slide" data-section>
            <div className="feature-content">
              <div className="eye">Digitaler Tresor</div>
              <h3>Alle Dokumente.<br/>Ein sicherer Ort.</h3>
              <p>Kaufvertrag, Grundbuch, Mietvertrag, Energieausweis — 13 Kategorien. Verschlüsselt mit AES-256. EU-Server (DSGVO-konform). Nur du hast Zugriff.</p>
              <div className="feature-list">
                <div className="feature-item">13 Dokumenten-Kategorien (Kaufvertrag, Grundbuch, Erbe, Finanzierung…)</div>
                <div className="feature-item">Jedem Objekt zuordenbar, im Detail mit Notizen</div>
                <div className="feature-item">Im Ernstfall (Erbe, Verkauf, Prüfung) in Sekunden griffbereit</div>
              </div>
            </div>
            <div className="visual visual-tresor">
              {[
                ['📜', 'Kauf', 3], ['🏛️', 'Grund', 1], ['🏦', 'Finanz', 2],
                ['📋', 'Miete', 5], ['🏠', 'Übergabe', 5], ['🔒', 'Versich.', 4],
                ['📊', 'Steuer', 8], ['🔨', 'Handwerk', 12], ['⚡', 'Energie', 3]
              ].map(([ic, l, c], i) => (
                <div key={i} className="visual-tresor-card">
                  <div className="visual-tresor-ic">{ic}</div>
                  <div className="visual-tresor-lbl">{l}</div>
                  <div className="visual-tresor-count">{c} Dok.</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 4: Rendite */}
          <div className="feature-slide reverse" data-section>
            <div className="feature-content">
              <div className="eye">Rendite & Wert</div>
              <h3>Weißt du, was deine Immobilie wirklich bringt?</h3>
              <p>Rendite-Rechner mit Instandhaltung, Leerstand und Verwaltung. Wert-Rechner für die grobe Schätzung. Entscheidungen mit Zahlen, nicht aus dem Bauch.</p>
              <div className="feature-list">
                <div className="feature-item">Brutto- UND Nettorendite (mit allen realen Kosten)</div>
                <div className="feature-item">Wertschätzung basierend auf qm-Preis & Zustand</div>
                <div className="feature-item">Links zu Gutachterausschuss und Immoscout-Preisatlas</div>
              </div>
            </div>
            <div className="visual visual-rendite">
              <div className="panel">
                <div className="grid2">
                  <div>
                    <div className="label">Brutto-Rendite</div>
                    <div className="big-val">5,04 %</div>
                  </div>
                  <div>
                    <div className="label">Netto-Rendite</div>
                    <div className="big-val gold">3,48 %</div>
                  </div>
                </div>
                <div className="row"><span>Gesamtkosten</span><span>277.000 €</span></div>
                <div className="row"><span>Jahresmiete</span><span style={{ color: '#30d158' }}>12.600 €</span></div>
                <div className="row"><span>− Instandhaltung (1%)</span><span style={{ color: '#ff6b60' }}>−2.770 €</span></div>
                <div className="row"><span>− Leerstand (3%)</span><span style={{ color: '#ff6b60' }}>−378 €</span></div>
                <div className="row"><span>Netto p.a.</span><span style={{ color: G, fontWeight: 700 }}>9.632 €</span></div>
              </div>
            </div>
          </div>

          {/* Slide 5: Steuer */}
          <div className="feature-slide" data-section>
            <div className="feature-content">
              <div className="eye">Anlage V</div>
              <h3>Steuer-Vorbereitung<br/>wie vom Profi.</h3>
              <p>Schritt-für-Schritt durch Einnahmen, AfA, Werbungskosten. Mit Warnung vor Fallen wie anschaffungsnahen Herstellungskosten. Am Ende: druckfertiges PDF für deinen Steuerberater.</p>
              <div className="feature-list">
                <div className="feature-item">Auswahl: Linear 2/2,5/3% oder Degressiv 5% (§ 7 Abs. 5a EStG)</div>
                <div className="feature-item">Automatischer Check auf § 6 Abs. 1 Nr. 1a EStG (anschaffungsnahe HK)</div>
                <div className="feature-item">Links zu BMF-Schreiben und Gesetzestext</div>
                <div className="feature-item">Apple-ästhetisches PDF — druckbereit für das Finanzamt-Gespräch</div>
              </div>
            </div>
            <div className="visual visual-steuer">
              <div className="header">
                <div>
                  <div className="header-title">Anlage V · 2025</div>
                  <div className="header-meta">Kirchstr. 4 · Ennigerloh</div>
                </div>
                <div style={{ fontSize: 11, color: G, padding: '3px 10px', background: 'rgba(212,175,106,0.1)', borderRadius: 100 }}>Draft</div>
              </div>
              <div className="hero-val">+ 3.842 €</div>
              <div className="hero-sub">Überschuss · Einnahmen − WK</div>
              <div className="rows">
                <div><span>Mieteinnahmen</span><span style={{ color: '#30d158' }}>12.600 €</span></div>
                <div><span>− AfA 2% linear</span><span style={{ color: '#ff6b60' }}>−4.000 €</span></div>
                <div><span>− Schuldzinsen</span><span style={{ color: '#ff6b60' }}>−2.850 €</span></div>
                <div><span>− Erhaltung</span><span style={{ color: '#ff6b60' }}>−1.908 €</span></div>
                <div><span>Überschuss</span><span style={{ color: G }}>+3.842 €</span></div>
              </div>
              <div className="warn">⚠️ Warnung § 6 Abs. 1 Nr. 1a EStG: Kosten in den letzten 3 Jahren bei 13,8% der Gebäude-AK. Noch unter 15%-Grenze.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="sec-head">
            <div className="sec-eye">Vertrauen</div>
            <h2 className="sec-title">Von Profis empfohlen.</h2>
          </div>
          <div className="testi-wrap">
            {[
              {
                quote: "Endlich mal eine Immobilien-Software, die versteht, dass ich Daten für den Steuerberater brauche — und nicht selbst Steuerberater spielen will. Die Warnungen zu anschaffungsnahen Herstellungskosten sind Gold wert.",
                name: "S. Reimer",
                role: "Privatvermieter · 4 Objekte",
                avatar: "SR"
              },
              {
                quote: "Als Steuerberaterin empfehle ich ImmoNIQ allen Mandanten mit Vermietung. Die Daten kommen sauber strukturiert rein — das spart mir pro Mandant bis zu 2 Stunden. Die rechtlichen Disclaimer sind vorbildlich.",
                name: "Dr. K. Hoffmann",
                role: "Steuerberaterin · Münster",
                avatar: "KH"
              },
              {
                quote: "Ich verwalte 7 Wohnungen neben meinem Job. Vorher Excel-Chaos, 3 Tage Steuer pro Jahr. Jetzt NK-Abrechnung in 3 Minuten, Fristen im Griff, Anlage V vorbereitet. Bestes Abo, das ich je abgeschlossen habe.",
                name: "M. Weber",
                role: "Privatvermieter · 7 Objekte",
                avatar: "MW"
              }
            ].map((t, i) => (
              <div key={i} className={`testi ${i === currentTestimonial ? 'active' : ''}`}>
                <div className="testi-quote">„{t.quote}"</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div className="testi-meta">
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testi-dots">
            {[0, 1, 2].map(i => (
              <div key={i} className={`testi-dot ${i === currentTestimonial ? 'active' : ''}`} onClick={() => setCurrentTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="sec-head">
            <div className="sec-eye">Preise</div>
            <h2 className="sec-title">Ehrlich günstig.<br/>Keine versteckten Kosten.</h2>
            <p className="sec-sub">30 Tage kostenlos testen. Keine Kreditkarte. Jederzeit kündbar.</p>
          </div>
          <div className="price-grid">
            <div className="price">
              <div className="price-name">Starter</div>
              <div className="price-val">
                <span className="price-val-num">4,99 €</span>
                <span className="price-val-per">/ Monat</span>
              </div>
              <div className="price-yearly">oder 49,90 € / Jahr · spare 9,98 €</div>
              <div className="price-units">Bis zu 3 Objekte</div>
              <div className="price-features">
                <div className="price-feat">Dashboard & Objekte</div>
                <div className="price-feat">NK-Abrechnung</div>
                <div className="price-feat">Fristen-Automatik</div>
                <div className="price-feat">Dokumenten-Tresor (5 GB)</div>
                <div className="price-feat">Anlage V Vorbereitung</div>
              </div>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => router.push('/auth?mode=signup&plan=starter')}>Starter wählen</button>
            </div>
            <div className="price featured">
              <div className="price-badge">Beliebt</div>
              <div className="price-name">Pro</div>
              <div className="price-val">
                <span className="price-val-num">6,99 €</span>
                <span className="price-val-per">/ Monat</span>
              </div>
              <div className="price-yearly">oder 69,90 € / Jahr · spare 13,98 €</div>
              <div className="price-units">Bis zu 10 Objekte</div>
              <div className="price-features">
                <div className="price-feat">Alles in Starter</div>
                <div className="price-feat">Rendite- & Wertrechner</div>
                <div className="price-feat">Sanierungs-Tracker mit Quellen</div>
                <div className="price-feat">Erweiterter Tresor (25 GB)</div>
                <div className="price-feat">Hilfe-Assistent mit Rechtsquellen</div>
                <div className="price-feat">Priority Support</div>
              </div>
              <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => router.push('/auth?mode=signup&plan=pro')}>Pro starten</button>
            </div>
            <div className="price">
              <div className="price-name">Business</div>
              <div className="price-val">
                <span className="price-val-num">12,99 €</span>
                <span className="price-val-per">/ Monat</span>
              </div>
              <div className="price-yearly">oder 129,90 € / Jahr · spare 25,98 €</div>
              <div className="price-units">Unbegrenzt viele Objekte</div>
              <div className="price-features">
                <div className="price-feat">Alles in Pro</div>
                <div className="price-feat">Unbegrenzter Tresor</div>
                <div className="price-feat">Steuerberater-Export (coming soon)</div>
                <div className="price-feat">Mehrere Nutzer (coming soon)</div>
                <div className="price-feat">API-Zugang (coming soon)</div>
              </div>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => router.push('/auth?mode=signup&plan=business')}>Business starten</button>
            </div>
          </div>
        </div>
      </section>

      {/* VISION / ROADMAP */}
      <section style={{ borderTop: '0.5px solid var(--line)', background: 'linear-gradient(180deg, rgba(212,175,106,0.02) 0%, transparent 100%)' }}>
        <div className="container">
          <div className="sec-head">
            <div className="sec-eye">Die Vision</div>
            <h2 className="sec-title">Vom Tool<br/>zum <span style={{ background: 'linear-gradient(135deg, var(--g), var(--gl))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Betriebssystem</span>.</h2>
            <p className="sec-sub">ImmoNIQ startet als Verwaltungstool. Aber wir bauen das Fundament für alles was Privatvermieter in ihrem Leben brauchen. Mit klarem Fahrplan — ohne Versprechen die wir nicht halten können.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="roadmap-grid">
            {[
              {
                phase: 'Phase 1',
                year: '2026 heute',
                title: 'Das Tool',
                desc: 'Verwaltung, NK-Abrechnung, Fristen, Steuerberater-Export, Rendite- & Wertrechner. Die Basis.',
                status: 'live',
                icon: '🏗️'
              },
              {
                phase: 'Phase 2',
                year: '2026-2027',
                title: 'Die Brücke',
                desc: 'Direktes Steuerberater-Login, DATEV-Export, Empfehlungsprogramm. Vermieter und Berater auf einer Plattform.',
                status: 'next',
                icon: '🌉'
              },
              {
                phase: 'Phase 3',
                year: '2027-2028',
                title: 'Die Services',
                desc: 'Versicherung, Finanzierung, Handwerker — direkt aus der App. Ein Klick. Keine Suche. Keine Zettelwirtschaft.',
                status: 'plan',
                icon: '🔗'
              },
              {
                phase: 'Phase 4',
                year: '2028+',
                title: 'Das Netzwerk',
                desc: 'Marktdaten, Benchmarks, Transaktionen. Das vollständige Betriebssystem für Privatvermieter im deutschsprachigen Raum.',
                status: 'vision',
                icon: '🌐'
              }
            ].map((p, i) => (
              <div key={i} style={{
                padding: 24,
                borderRadius: 18,
                background: p.status === 'live' ? 'linear-gradient(180deg, rgba(212,175,106,0.1), rgba(212,175,106,0.02))' : 'rgba(255,255,255,0.02)',
                border: p.status === 'live' ? '0.5px solid rgba(212,175,106,0.4)' : '0.5px solid rgba(255,255,255,0.06)',
                position: 'relative'
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: G, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{p.phase}</div>
                  {p.status === 'live' && (
                    <div style={{ fontSize: 10, color: '#30d158', padding: '2px 8px', background: 'rgba(48,209,88,0.1)', borderRadius: 100, fontWeight: 700 }}>● Live</div>
                  )}
                  {p.status === 'next' && (
                    <div style={{ fontSize: 10, color: G, padding: '2px 8px', background: 'rgba(212,175,106,0.1)', borderRadius: 100, fontWeight: 700 }}>In Arbeit</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>{p.year}</div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>
            Wer heute startet, wächst in jedes neue Modul hinein — ohne Zusatzkosten in Phase 1. <strong style={{ color: 'var(--t2)' }}>Early-Adopter-Preise bleiben erhalten.</strong>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-bg" />
        <div className="container final-cta-inner">
          <h2>Fertig mit<br/>Excel und Zetteln?</h2>
          <p>30 Tage kostenlos. Keine Kreditkarte. Einrichtung in 2 Minuten.</p>
          <button className="btn btn-gold btn-lg" onClick={() => router.push('/auth?mode=signup')}>
            Jetzt kostenlos starten →
          </button>
          <div style={{ marginTop: 30, fontSize: 13, color: 'var(--t3)' }}>
            DSGVO-konform · EU-Server · AES-256-Verschlüsselung
          </div>
        </div>
      </section>

      <footer>
        <div className="container foot-inner">
          <div>© 2026 ImmoNIQ · Ein Produkt von ENTERVENTUS</div>
          <div className="foot-links">
            <a href="/impressum">Impressum</a>
            <a href="/datenschutz">Datenschutz</a>
            <a href="/agb">AGB</a>
            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/auth') }}>Anmelden</a>
          </div>
        </div>
      </footer>
    </>
  )
}
