import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// TYPEWRITER HOOK
// ============================================================
const useTypewriter = (text, speed = 30, startDelay = 0, shouldStart = true) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!shouldStart) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay, shouldStart]);
  return { displayed, done };
};

// ============================================================
// INTERSECTION OBSERVER HOOK (for scroll-triggered animations)
// ============================================================
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ============================================================
// MOBILE RESPONSIVE HOOK
// ============================================================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// ============================================================
// STYLES (inline to stay single-file, Mach Industries aesthetic)
// ============================================================
const COLORS = {
  bg: "#000000",
  text: "#b9b9b9",
  heading: "#ffffff",
  accent: "#3b82f6",
  accentMuted: "#1e3a5f",
  cardBg: "#0a0a0a",
  cardBorder: "#1a1a1a",
  inputBg: "#111111",
  tabActive: "#ffffff",
  tabInactive: "#555555",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  orange: "#f97316",
};

const FONT = "'Chakra Petch', sans-serif";

// ============================================================
// ANIMATED NUMBER COMPONENT
// ============================================================
const AnimNum = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 600;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prev.current = end;
  }, [value]);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
    </span>
  );
};

// ============================================================
// TYPEWRITER TEXT COMPONENT (scroll-triggered)
// ============================================================
const TypewriterBlock = ({ text, speed = 20, delay = 0, style = {} }) => {
  const [ref, inView] = useInView(0.3);
  const { displayed } = useTypewriter(text, speed, delay, inView);
  return (
    <span ref={ref} style={style}>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ opacity: 1, animation: "blink 1s step-end infinite" }}>|</span>
      )}
    </span>
  );
};

// ============================================================
// NAVIGATION
// ============================================================
const Nav = ({ currentSection, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const links = [
    { id: "hero", label: "Home" },
    { id: "bio", label: "About" },
    { id: "case-study", label: "Case Study" },
    { id: "startup", label: "AI Startup" },
    { id: "ripple", label: "Community" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" },
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "1rem 2rem",
      background: scrolled || menuOpen ? "rgba(0,0,0,0.95)" : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(10px)" : "none",
      transition: "all 0.3s ease",
      fontFamily: FONT,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          onClick={() => handleNav("hero")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img src="/favicon.png" alt="TR" style={{ height: "32px", width: "32px" }} />
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2rem" }}>
            {links.map(l => (
              <span
                key={l.id}
                onClick={() => handleNav(l.id)}
                style={{
                  color: currentSection === l.id ? COLORS.heading : COLORS.text,
                  fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.target.style.color = COLORS.heading}
                onMouseLeave={e => e.target.style.color = currentSection === l.id ? COLORS.heading : COLORS.text}
              >
                {l.label}
              </span>
            ))}
          </div>
        )}

        {/* Hamburger button */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "0.5rem", display: "flex", flexDirection: "column",
              gap: "4px", justifyContent: "center",
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: "block", width: "22px", height: "2px", background: COLORS.heading,
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none",
            }} />
            <span style={{
              display: "block", width: "22px", height: "2px", background: COLORS.heading,
              transition: "all 0.3s",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: "22px", height: "2px", background: COLORS.heading,
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
            }} />
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && (
        <div style={{
          maxHeight: menuOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}>
          <div style={{ paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {links.map(l => (
              <span
                key={l.id}
                onClick={() => handleNav(l.id)}
                style={{
                  color: currentSection === l.id ? COLORS.heading : COLORS.text,
                  fontSize: "1rem", fontWeight: 600, cursor: "pointer",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "0.75rem 0",
                  borderBottom: `1px solid ${COLORS.cardBorder}`,
                  transition: "color 0.2s",
                }}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// ============================================================
// HERO SECTION
// ============================================================
const Hero = () => {
  const { displayed: name, done: nameDone } = useTypewriter("TIMMY RAYES", 80, 300);
  const { displayed: tagline } = useTypewriter(
    "Industrial Engineer. Builder. Scaling operations for what matters.",
    25, 1500, nameDone
  );

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      padding: "2rem", position: "relative", overflow: "hidden",
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <h1 style={{
        fontFamily: FONT, fontSize: "clamp(3rem, 6vw, 7rem)", fontWeight: 600,
        color: COLORS.heading, letterSpacing: "0.15em", marginBottom: "1rem",
        textAlign: "center", position: "relative",
      }}>
        {name}
        {!nameDone && <span style={{ animation: "blink 1s step-end infinite" }}>|</span>}
      </h1>

      <p style={{
        fontFamily: FONT, fontSize: "clamp(1rem, 2vw, 1.4rem)", color: COLORS.text,
        letterSpacing: "0.05em", textAlign: "center", maxWidth: "700px",
        minHeight: "2rem", position: "relative",
      }}>
        {tagline}
        {nameDone && tagline.length < "Industrial Engineer. Builder. Scaling operations for what matters.".length && (
          <span style={{ animation: "blink 1s step-end infinite" }}>|</span>
        )}
      </p>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "2rem",
        animation: "float 2s ease-in-out infinite",
      }}>
        <div style={{
          width: "1px", height: "60px", background: "linear-gradient(transparent, rgba(255,255,255,0.3))",
          margin: "0 auto",
        }} />
        <div style={{
          color: COLORS.text, fontSize: "0.7rem", letterSpacing: "0.2em",
          textTransform: "uppercase", fontFamily: FONT, marginTop: "0.5rem",
        }}>
          Scroll
        </div>
      </div>
    </section>
  );
};

// ============================================================
// BIO SECTION (Who / What / Why)
// ============================================================
const Bio = () => {
  const [ref, inView] = useInView(0.1);
  const isMobile = useIsMobile();

  const sectionLabel = (text) => (
    <div style={{
      fontFamily: FONT, fontSize: "0.65rem", fontWeight: 600,
      color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase",
      marginBottom: "1rem",
    }}>
      {text}
    </div>
  );

  const bodyStyle = {
    fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, lineHeight: 1.8,
  };

  return (
    <section id="bio" ref={ref} style={{
      padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto",
      opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }}>
      {/* WHO */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        gap: "2.5rem", alignItems: isMobile ? "center" : "flex-start",
        marginBottom: "3.5rem",
      }}>
        {isMobile && (
          <img src="/timmy-rayes.jpg" alt="Timmy Rayes" style={{
            width: 200, height: 200, objectFit: "cover", flexShrink: 0,
            border: `2px solid ${COLORS.accent}`,
          }} />
        )}
        <div style={{ flex: 1 }}>
          {sectionLabel("Who")}
          <p style={bodyStyle}>
            I make complex operations scale — semiconductors, autonomous systems, high-volume service networks. At Intel,
            I own strategic capacity planning across global fabs and led a chamber reuse program
            that moved the needle on cost and throughput. Eagle Scout at 16, two businesses in high
            school, avid CrossFit athlete and world traveler — I've always been wired to build things
            that work at volume.
          </p>
        </div>
        {!isMobile && (
          <img src="/timmy-rayes.jpg" alt="Timmy Rayes" style={{
            width: 300, height: 300, objectFit: "cover", flexShrink: 0,
            border: `2px solid ${COLORS.accent}`,
          }} />
        )}
      </div>

      {/* WHAT */}
      <div style={{ marginBottom: "3.5rem" }}>
        {sectionLabel("What")}
        <p style={bodyStyle}>
          I'm an Industrial Engineer at Intel — factory scaling, system automations, supplier agreements,
          and capacity modeling that keeps production from becoming the bottleneck. I also build AI-native
          tools that sit at the intersection of agent orchestration and real operational workflows. The
          case study below shows how I think — the same methods I apply across global fabs, made interactive.
        </p>
      </div>

      {/* WHY */}
      <div>
        {sectionLabel("Why")}
        <p style={bodyStyle}>
          The next decade belongs to whoever can move fastest from plan to full-scale execution —
          in autonomous systems, defense hardware, global fleet operations, and the complex supply chains
          behind them. That's the gap I close. And as these systems become more autonomous, I think deeply
          about what it means to build them responsibly. If you're building at that frontier, let's talk.
        </p>
      </div>
    </section>
  );
};

// ProjectCards section removed — redundant shortcut links

// --- Tab 4: Supplier Selection & Qualification ---
const SupplierQualification = () => {
  // 3 suppliers to evaluate with different trade-off profiles
  const [suppliers, setSuppliers] = useState([
    {
      name: "Apex Sensors (Domestic)",
      devWork: 3,      // 1-10 scale, months of development work needed
      leadTime: 8,     // weeks
      yieldRate: 92,   // percent
      unitCost: 4200,  // dollars
      formFactor: 85,  // fit score 0-100
      qualRisk: 2,     // 1-5 (1=low risk, 5=high)
      itarReady: true,
      dualSource: true,
      techMaturity: 8, // TRL 1-9
      notes: "Domestic supplier with proven track record. Higher cost but ITAR-ready and low qualification risk.",
    },
    {
      name: "Shenzhen Micro (International)",
      devWork: 1,
      leadTime: 4,
      yieldRate: 88,
      unitCost: 1800,
      formFactor: 70,
      qualRisk: 4,
      itarReady: false,
      dualSource: false,
      techMaturity: 7,
      notes: "Lowest cost and fastest lead time but ITAR non-compliant. Single-source risk. May require export license.",
    },
    {
      name: "NovaTech Solutions (Domestic)",
      devWork: 6,
      leadTime: 14,
      yieldRate: 96,
      unitCost: 3100,
      formFactor: 95,
      qualRisk: 3,
      itarReady: true,
      dualSource: true,
      techMaturity: 5,
      notes: "Best yield and form factor fit but requires significant development investment. Lower TRL — needs 6+ months co-development.",
    },
  ]);

  // Weighting for scoring
  const [weights, setWeights] = useState({
    devWork: 15,
    leadTime: 15,
    yieldRate: 20,
    unitCost: 15,
    formFactor: 10,
    qualRisk: 10,
    itarReady: 10,
    techMaturity: 5,
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const demandUnits = 500; // monthly demand baseline

  // Calculate weighted score for each supplier
  const scoreSupplier = (s) => {
    const scores = {
      devWork: Math.max(0, (10 - s.devWork) / 9) * 100,
      leadTime: Math.max(0, (20 - s.leadTime) / 19) * 100,
      yieldRate: s.yieldRate,
      unitCost: Math.max(0, (5000 - s.unitCost) / 4999) * 100,
      formFactor: s.formFactor,
      qualRisk: ((5 - s.qualRisk) / 4) * 100,
      itarReady: s.itarReady ? 100 : 0,
      techMaturity: (s.techMaturity / 9) * 100,
    };
    let total = 0, wTotal = 0;
    Object.keys(weights).forEach(k => {
      total += scores[k] * weights[k];
      wTotal += weights[k];
    });
    return Math.round(total / wTotal);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return COLORS.green;
    if (score >= 50) return COLORS.orange;
    return "#ef4444";
  };

  const getRiskLabel = (risk) => {
    const labels = ["", "Very Low", "Low", "Medium", "High", "Critical"];
    return labels[risk] || "";
  };

  const getRiskColor = (risk) => {
    if (risk <= 2) return COLORS.green;
    if (risk === 3) return COLORS.orange;
    return "#ef4444";
  };

  // Total program cost estimate
  const programCost = (s) => {
    const devCost = s.devWork * 85000; // ~$85k/month dev cost
    const unitTotal = demandUnits * 12 * s.unitCost; // annual unit cost
    const yieldLoss = unitTotal * ((100 - s.yieldRate) / 100);
    return { devCost, unitTotal, yieldLoss, total: devCost + unitTotal + yieldLoss };
  };

  const formatCurrency = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  const supplierScores = suppliers.map(s => ({ ...s, score: scoreSupplier(s), costs: programCost(s) }));
  const recommended = [...supplierScores].sort((a, b) => b.score - a.score)[0];

  const criteriaLabels = {
    devWork: "Development Work",
    leadTime: "Lead Time",
    yieldRate: "Yield Rate",
    unitCost: "Unit Cost",
    formFactor: "Form Factor Fit",
    qualRisk: "Qualification Risk",
    itarReady: "ITAR Compliance",
    techMaturity: "Tech Maturity (TRL)",
  };

  return (
    <div style={{ fontFamily: FONT }}>
      <p style={{ fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7, marginBottom: "2rem", maxWidth: "700px" }}>
        Evaluating suppliers for a critical sensor module for an autonomous UAV platform.
        Adjust importance weights to match your program priorities and see how the recommendation changes.
      </p>

      {/* Weight adjustment */}
      <div style={{
        background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
      }}>
        <h4 style={{ fontSize: "0.85rem", color: COLORS.heading, fontWeight: 600, marginBottom: "1rem", letterSpacing: "0.05em" }}>
          EVALUATION WEIGHTS (adjust to match program priorities)
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.5rem" }}>
          {Object.keys(weights).map(k => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.7rem", color: COLORS.tabInactive }}>{criteriaLabels[k]}</span>
                <span style={{ fontSize: "0.7rem", color: COLORS.accent, fontWeight: 600 }}>{weights[k]}%</span>
              </div>
              <input
                type="range" min={0} max={30} value={weights[k]}
                onChange={e => setWeights({ ...weights, [k]: Number(e.target.value) })}
                style={{ width: "100%", accentColor: COLORS.accent }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Supplier comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {supplierScores.map((s, i) => (
          <div
            key={s.name}
            onClick={() => setSelectedSupplier(selectedSupplier === i ? null : i)}
            style={{
              background: COLORS.cardBg,
              border: `1px solid ${s.name === recommended.name ? COLORS.green : COLORS.cardBorder}`,
              borderRadius: "8px", padding: "1.5rem", cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: s.name === recommended.name ? `0 0 12px ${COLORS.green}33` : "none",
            }}
          >
            {/* Header with score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", color: COLORS.heading, fontWeight: 600, marginBottom: "0.3rem" }}>{s.name}</h4>
                {s.name === recommended.name && (
                  <span style={{ fontSize: "0.7rem", color: COLORS.green, background: `${COLORS.green}22`, padding: "0.15rem 0.5rem", borderRadius: "3px", fontWeight: 600 }}>
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: getScoreColor(s.score) }}>{s.score}</div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>WEIGHTED SCORE</div>
              </div>
            </div>

            {/* Key metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>DEV WORK</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>{s.devWork} months</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>LEAD TIME</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>{s.leadTime} weeks</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>YIELD RATE</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>{s.yieldRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>UNIT COST</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>${s.unitCost.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>FORM FACTOR FIT</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>{s.formFactor}/100</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>QUAL RISK</div>
                <div style={{ fontSize: "0.9rem", color: getRiskColor(s.qualRisk) }}>{getRiskLabel(s.qualRisk)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>ITAR READY</div>
                <div style={{ fontSize: "0.9rem", color: s.itarReady ? COLORS.green : "#ef4444" }}>{s.itarReady ? "Yes" : "No"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive }}>TECH MATURITY</div>
                <div style={{ fontSize: "0.9rem", color: COLORS.heading }}>TRL {s.techMaturity}</div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div style={{ borderTop: `1px solid ${COLORS.cardBorder}`, paddingTop: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.65rem", color: COLORS.tabInactive, marginBottom: "0.5rem" }}>ANNUAL PROGRAM COST ESTIMATE</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: COLORS.text, marginBottom: "0.25rem" }}>
                <span>Development</span><span>{formatCurrency(s.costs.devCost)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: COLORS.text, marginBottom: "0.25rem" }}>
                <span>Units ({demandUnits}/mo x 12)</span><span>{formatCurrency(s.costs.unitTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: COLORS.text, marginBottom: "0.25rem" }}>
                <span>Yield Loss</span><span style={{ color: "#ef4444" }}>+{formatCurrency(s.costs.yieldLoss)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: COLORS.heading, fontWeight: 600, borderTop: `1px solid ${COLORS.cardBorder}`, paddingTop: "0.5rem" }}>
                <span>Total</span><span>{formatCurrency(s.costs.total)}</span>
              </div>
            </div>

            {/* Notes */}
            <p style={{ fontSize: "0.75rem", color: COLORS.tabInactive, lineHeight: 1.5, fontStyle: "italic" }}>{s.notes}</p>

            {/* Expand hint */}
            <div style={{ fontSize: "0.7rem", color: COLORS.accent, textAlign: "center", marginTop: "0.75rem" }}>
              {selectedSupplier === i ? "▲ Click to collapse" : "▼ Click to expand trade-off analysis"}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded trade-off analysis */}
      {selectedSupplier !== null && (
        <div style={{
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem",
        }}>
          <h4 style={{ fontSize: "0.9rem", color: COLORS.heading, fontWeight: 600, marginBottom: "1rem" }}>
            Trade-Off Analysis: {suppliers[selectedSupplier].name}
          </h4>
          {/* Visual bar comparison */}
          {Object.keys(criteriaLabels).map(k => {
            const s = supplierScores[selectedSupplier];
            let pct = 0;
            if (k === "devWork") pct = Math.max(0, (10 - s.devWork) / 9) * 100;
            else if (k === "leadTime") pct = Math.max(0, (20 - s.leadTime) / 19) * 100;
            else if (k === "yieldRate") pct = s.yieldRate;
            else if (k === "unitCost") pct = Math.max(0, (5000 - s.unitCost) / 4999) * 100;
            else if (k === "formFactor") pct = s.formFactor;
            else if (k === "qualRisk") pct = ((5 - s.qualRisk) / 4) * 100;
            else if (k === "itarReady") pct = s.itarReady ? 100 : 0;
            else if (k === "techMaturity") pct = (s.techMaturity / 9) * 100;

            const barColor = pct >= 70 ? COLORS.green : pct >= 40 ? COLORS.orange : "#ef4444";
            return (
              <div key={k} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", color: COLORS.text }}>{criteriaLabels[k]}</span>
                  <span style={{ fontSize: "0.75rem", color: barColor, fontWeight: 600 }}>{Math.round(pct)}%</span>
                </div>
                <div style={{ height: "6px", background: COLORS.cardBorder, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "3px", transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}

          {/* Decision support */}
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: `${COLORS.accent}11`, borderRadius: "6px", border: `1px solid ${COLORS.accent}33` }}>
            <h5 style={{ fontSize: "0.8rem", color: COLORS.accent, fontWeight: 600, marginBottom: "0.5rem" }}>DECISION SUPPORT</h5>
            {(() => {
              const s = suppliers[selectedSupplier];
              const flags = [];
              if (!s.itarReady) flags.push({ type: "critical", text: "ITAR non-compliant — cannot supply to DoD programs without export license" });
              if (!s.dualSource) flags.push({ type: "warning", text: "Single-source supplier — creates supply chain vulnerability" });
              if (s.qualRisk >= 4) flags.push({ type: "warning", text: "High qualification risk — extended validation timeline likely" });
              if (s.devWork >= 5) flags.push({ type: "info", text: `${s.devWork} months of co-development needed before production readiness` });
              if (s.techMaturity <= 5) flags.push({ type: "info", text: `TRL ${s.techMaturity} — technology not yet production-proven` });
              if (s.leadTime >= 12) flags.push({ type: "warning", text: `${s.leadTime}-week lead time may impact production schedule` });
              if (flags.length === 0) flags.push({ type: "good", text: "No major flags — strong candidate for qualification" });
              return flags.map((f, i) => (
                <div key={i} style={{
                  display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.4rem",
                  fontSize: "0.8rem", color: f.type === "critical" ? "#ef4444" : f.type === "warning" ? COLORS.orange : f.type === "good" ? COLORS.green : COLORS.text,
                }}>
                  <span>{f.type === "critical" ? "⛔" : f.type === "warning" ? "⚠️" : f.type === "good" ? "✅" : "ℹ️"}</span>
                  <span>{f.text}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Summary recommendation */}
      <div style={{
        background: `${COLORS.green}11`, border: `1px solid ${COLORS.green}33`,
        borderRadius: "8px", padding: "1.5rem",
      }}>
        <h4 style={{ fontSize: "0.85rem", color: COLORS.green, fontWeight: 600, marginBottom: "0.75rem" }}>
          RECOMMENDATION SUMMARY
        </h4>
        <p style={{ fontSize: "0.85rem", color: COLORS.text, lineHeight: 1.7 }}>
          Based on current weights, <strong style={{ color: COLORS.heading }}>{recommended.name}</strong> scores highest
          at <strong style={{ color: getScoreColor(recommended.score) }}>{recommended.score}/100</strong> with
          an estimated annual program cost of <strong style={{ color: COLORS.heading }}>{formatCurrency(recommended.costs.total)}</strong>.
          {!recommended.itarReady && " However, this supplier is not ITAR-compliant — critical for defense programs."}
          {recommended.qualRisk >= 4 && " Note: high qualification risk may extend timeline."}
          {recommended.devWork >= 5 && ` Requires ${recommended.devWork} months of co-development before production.`}
        </p>
        <p style={{ fontSize: "0.8rem", color: COLORS.tabInactive, marginTop: "0.75rem", lineHeight: 1.6 }}>
          Adjust the evaluation weights above to explore how different program priorities shift the recommendation.
          In defense hardware, ITAR compliance and dual-source availability often outweigh pure cost optimization.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// CASE STUDY: FACTORY SCALE-UP (4 TABS)
// ============================================================
const CaseStudy = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [ref, inView] = useInView(0.1);
  const isMobile = useIsMobile();

  const tabs = [
    "What-If Demand Planner",
    "Factory Optimization",
    "Equipment Risk Tracker",
    "Supplier Qualification",
  ];

  return (
    <section id="case-study" ref={ref} style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section header */}
      <div style={{ marginBottom: "1rem" }}>
        <span style={{
          fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          Case Study
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.1,
      }}>
        {inView ? <TypewriterBlock text="How I Think About Factory Scale-Up" speed={25} /> : ""}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "3rem", maxWidth: "900px" }}>
        {[
          { title: "Problem", desc: "Advanced tech and defense companies can build incredible prototypes — but scaling to full-rate production is where most stumble. Wrong equipment mix, bad facility layout, single-source suppliers, and capital misallocation turn a 12-month ramp into a 3-year money pit." },
          { title: "Solution", desc: "Systematic capacity planning that treats factory scale-up like an engineering problem, not a guessing game. Model demand scenarios, optimize floor layouts, assess equipment risk, and qualify suppliers before a single dollar is committed." },
          { title: "What I Built", desc: "The interactive tools below — a demand planner for what-if modeling, a factory floor optimizer with 60+ equipment items and material flow paths, an equipment risk tracker, and a weighted supplier qualification system. These mirror the actual methods I use at Intel across 7 global fabs." },
          { title: "How I Built It", desc: "Designed and built entirely with Claude Code in a single collaborative session. Every component, animation, SVG layout, and algorithm — from conversation to production code." },
        ].map((card, i) => (
          <div key={card.title} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "2rem",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${i * 0.1}s`,
          }}>
            <h4 style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {card.title}
            </h4>
            <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "0", borderBottom: `1px solid ${COLORS.cardBorder}`,
        marginBottom: "2rem", flexWrap: "wrap", overflowX: "auto",
      }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            style={{
              fontFamily: FONT, fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)", fontWeight: 600,
              color: activeTab === i ? COLORS.heading : COLORS.tabInactive,
              background: "transparent", border: "none",
              padding: "0.75rem 1rem", cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: activeTab === i ? `2px solid ${COLORS.heading}` : "2px solid transparent",
              transition: "all 0.2s", letterSpacing: "0.05em",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && <WhatIfPlanner />}
      {activeTab === 1 && <FactoryOptimizer />}
      {activeTab === 2 && <EquipmentRiskTracker />}
      {activeTab === 3 && <SupplierQualification />}
    </section>
  );
};

// --- Tab 1: What-If Demand Planner with Feasibility Checks ---
const WhatIfPlanner = () => {
  const isMobile = useIsMobile();
  const [demand, setDemand] = useState(500);
  const [deadline, setDeadline] = useState(18);
  const [complexity, setComplexity] = useState(2);
  const [mode, setMode] = useState("cost"); // "cost" or "maxOutput"
  const [maxDate, setMaxDate] = useState(12);

  // Manufacturing constraints
  const MAX_FACTORY_CAPACITY = 1000000; // sq ft
  const EXISTING_STATIONS = 5;
  const EQUIPMENT_LEAD_TIME_WEEKS = 18; // avg for new equipment
  const PROCUREMENT_TO_PRODUCTION_WEEKS = 12; // installation + qualification

  // Model calculations
  const cycleTimeHrs = [1.2, 2.5, 4.8][complexity];
  const equipCostM = [0.8, 1.5, 3.2][complexity];
  const complexLabel = ["Low", "Medium", "High"][complexity];

  // Cost mode: how much to produce X by Y
  const hrsPerMonth = 24 * 22; // 2 shifts, 22 days
  const utilization = 0.82;
  const effectiveHrs = hrsPerMonth * utilization;
  const unitsPerStationPerMonth = effectiveHrs / cycleTimeHrs;
  const monthlyRate = Math.ceil(demand / deadline);
  const stationsNeeded = Math.ceil(monthlyRate / unitsPerStationPerMonth);
  const newStationsNeeded = Math.max(0, stationsNeeded - EXISTING_STATIONS);
  const laborPerStation = complexity === 0 ? 2 : complexity === 1 ? 3 : 5;
  const totalLabor = stationsNeeded * laborPerStation;
  const sqftPerStation = [800, 1500, 2800][complexity];
  const totalSqft = stationsNeeded * sqftPerStation;
  const equipCost = stationsNeeded * equipCostM;
  const facilityCost = totalSqft * 0.00035; // $350/sqft
  const totalCapex = equipCost + facilityCost;

  // Max output mode
  const maxStations = Math.ceil(MAX_FACTORY_CAPACITY / sqftPerStation * 0.6);
  const maxMonthlyOutput = Math.floor(maxStations * unitsPerStationPerMonth);
  const maxTotalByDate = maxMonthlyOutput * maxDate;

  // Feasibility checks
  const maxFeasibleUnitsInDeadline = monthlyRate * deadline; // what we can produce
  const demandExceedsCapacity = demand > maxFeasibleUnitsInDeadline && stationsNeeded > 20;
  const deadlineForFull = Math.ceil(demand / monthlyRate);

  // Lead time constraint check
  const deadlineInWeeks = deadline * 4.33; // months to weeks
  const totalLeadTimeWeeks = EQUIPMENT_LEAD_TIME_WEEKS + PROCUREMENT_TO_PRODUCTION_WEEKS;
  const leadTimeWarning = newStationsNeeded > 0 && deadlineInWeeks < totalLeadTimeWeeks;

  // Equipment lead time warning calculation
  const equipmentLeadTimeDisplay = Math.ceil((newStationsNeeded / 2) * 2); // show in pairs
  const weeksToProcure = EQUIPMENT_LEAD_TIME_WEEKS;

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "2rem" }}>
      {/* Left: Inputs */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "2rem" }}>
        <h4 style={{ fontFamily: FONT, color: COLORS.heading, fontSize: "1rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
          SCENARIO INPUTS
        </h4>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {[
            { key: "cost", label: "Cost to produce X by Y" },
            { key: "maxOutput", label: "Max output by date" },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                fontFamily: FONT, fontSize: "0.75rem", padding: "0.5rem 1rem",
                background: mode === m.key ? COLORS.heading : "transparent",
                color: mode === m.key ? COLORS.bg : COLORS.text,
                border: `1px solid ${mode === m.key ? COLORS.heading : COLORS.cardBorder}`,
                cursor: "pointer", fontWeight: 600,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "cost" ? (
          <>
            <SliderInput label="Target units" value={demand} min={50} max={5000} step={50}
              onChange={setDemand} suffix=" units" />
            <SliderInput label="Deadline" value={deadline} min={3} max={36} step={1}
              onChange={setDeadline} suffix=" months" />
          </>
        ) : (
          <SliderInput label="Timeframe" value={maxDate} min={3} max={36} step={1}
            onChange={setMaxDate} suffix=" months" />
        )}

        <SliderInput label="Product complexity" value={complexity} min={0} max={2} step={1}
          onChange={setComplexity} suffix={` (${complexLabel})`} />

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}` }}>
          <div style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.tabInactive, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            ASSUMPTIONS
          </div>
          <div style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text, lineHeight: 1.8 }}>
            Cycle time: {cycleTimeHrs} hrs/unit &bull; Utilization: 82% &bull; 2 shifts/day &bull; 22 days/mo
          </div>
        </div>
      </div>

      {/* Right: Outputs with Feasibility */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "2rem" }}>
        <h4 style={{ fontFamily: FONT, color: COLORS.heading, fontSize: "1rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
          {mode === "cost" ? "PRODUCTION REQUIREMENTS" : "MAXIMUM CAPACITY"}
        </h4>

        {/* Feasibility warnings */}
        {mode === "cost" && (
          <>
            {demandExceedsCapacity && (
              <div style={{
                background: `${COLORS.red}22`, border: `1px solid ${COLORS.red}`,
                padding: "1rem", marginBottom: "1.5rem", borderRadius: "4px",
              }}>
                <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.red, fontWeight: 600, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                  WARNING: DEMAND EXCEEDS CAPACITY
                </div>
                <div style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text, lineHeight: 1.6 }}>
                  {demand} units in {deadline} months requires {stationsNeeded} stations. Current facility cannot support this without major expansion.
                </div>
              </div>
            )}

            {leadTimeWarning && (
              <div style={{
                background: `${COLORS.yellow}22`, border: `1px solid ${COLORS.yellow}`,
                padding: "1rem", marginBottom: "1.5rem", borderRadius: "4px",
              }}>
                <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.yellow, fontWeight: 600, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                  EQUIPMENT LEAD TIME WARNING
                </div>
                <div style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text, lineHeight: 1.6 }}>
                  Need {newStationsNeeded} new stations. Procurement takes {weeksToProcure} weeks + {PROCUREMENT_TO_PRODUCTION_WEEKS} weeks for install/qual = {weeksToProcure + PROCUREMENT_TO_PRODUCTION_WEEKS} weeks total. Your deadline is {Math.round(deadlineInWeeks)} weeks.
                </div>
              </div>
            )}
          </>
        )}

        {mode === "cost" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <MetricCard label="Equipment Stations" value={stationsNeeded} />
            <MetricCard label="Monthly Rate" value={monthlyRate} suffix=" units/mo" />
            <MetricCard label="Headcount" value={totalLabor} suffix=" FTEs" />
            <MetricCard label="Floor Space" value={totalSqft} suffix=" sq ft" />
            <MetricCard label="Equipment CapEx" value={equipCost} prefix="$" suffix="M" decimals={1} highlight />
            <MetricCard label="Total CapEx" value={totalCapex} prefix="$" suffix="M" decimals={1} highlight />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <MetricCard label="Max Stations (1M sq ft)" value={maxStations} />
            <MetricCard label="Monthly Output" value={maxMonthlyOutput} suffix=" units" />
            <MetricCard label={`Total by Month ${maxDate}`} value={maxTotalByDate} suffix=" units" highlight />
            <MetricCard label="Required Headcount" value={maxStations * laborPerStation} suffix=" FTEs" />
            <MetricCard label="Equipment CapEx" value={maxStations * equipCostM} prefix="$" suffix="M" decimals={1} highlight />
            <MetricCard label="Facility" value={1000000} suffix=" sq ft" />
          </div>
        )}

        {/* Counter-offer section for cost mode */}
        {mode === "cost" && (
          <div style={{ marginTop: "2rem", padding: "1rem", background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}` }}>
            <div style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.75rem", fontWeight: 600 }}>
              COUNTER-OFFER (if demand exceeds capacity)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: COLORS.tabInactive, marginBottom: "0.3rem" }}>By your deadline ({deadline} mo):</div>
                <div style={{ fontFamily: FONT, fontSize: "1.1rem", color: COLORS.green, fontWeight: 600 }}>
                  <AnimNum value={Math.floor(monthlyRate * deadline)} suffix=" units" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: COLORS.tabInactive, marginBottom: "0.3rem" }}>For {demand} units, we need:</div>
                <div style={{ fontFamily: FONT, fontSize: "1.1rem", color: COLORS.accent, fontWeight: 600 }}>
                  <AnimNum value={deadlineForFull} suffix=" months" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment list */}
        <div style={{ marginTop: "2rem", padding: "1rem", background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}` }}>
          <div style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.tabInactive, letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            EQUIPMENT BILL (ALL NEW-BUY)
          </div>
          {[
            { name: "Primary Assembly Station", qty: stationsNeeded, cost: equipCostM * 0.4 },
            { name: "Test & Validation Rig", qty: Math.ceil(stationsNeeded * 0.5), cost: equipCostM * 0.25 },
            { name: "Material Handling System", qty: Math.ceil(stationsNeeded * 0.3), cost: equipCostM * 0.2 },
            { name: "QC Inspection Cell", qty: Math.ceil(stationsNeeded * 0.2), cost: equipCostM * 0.15 },
          ].map((eq, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.4rem 0", borderBottom: i < 3 ? `1px solid ${COLORS.cardBorder}` : "none",
              fontFamily: FONT, fontSize: "0.8rem",
            }}>
              <span style={{ color: COLORS.text }}>{eq.name}</span>
              <span style={{ color: COLORS.heading }}>
                {mode === "cost" ? eq.qty : Math.ceil(maxStations * [1, 0.5, 0.3, 0.2][i])} units &bull; ${(eq.cost * (mode === "cost" ? stationsNeeded : maxStations) / stationsNeeded).toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Tab 2: Factory Optimizer (Multi-level factory with 3 tabs) ---
const FactoryOptimizer = () => {
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [factoryLevel, setFactoryLevel] = useState("level2");
  const [showPaths, setShowPaths] = useState(true);
  const [showClearances, setShowClearances] = useState(false);
  const [showMoveIn, setShowMoveIn] = useState(false);

  // ---- LEVEL 2: FACTORY FLOOR with individual equipment ----
  const zones = [
    { id: "A", name: "Receiving Dock", x: 1, y: 2, w: 11, h: 8, color: "#1a3a1a" },
    { id: "B", name: "Raw Material Storage", x: 1, y: 11, w: 11, h: 10, color: "#3a1a1a" },
    { id: "C", name: "CNC Machining", x: 13, y: 2, w: 18, h: 10, color: "#1a1a3a" },
    { id: "D", name: "Composite Layup", x: 13, y: 13, w: 18, h: 9, color: "#1a2a2a" },
    { id: "E", name: "Robotic Welding", x: 32, y: 2, w: 16, h: 10, color: "#2a1a2a" },
    { id: "F", name: "PCB Assembly", x: 32, y: 13, w: 16, h: 9, color: "#2a2a1a" },
    { id: "G", name: "Sub-Assembly A", x: 49, y: 2, w: 14, h: 10, color: "#1a2a1a" },
    { id: "H", name: "Sub-Assembly B", x: 49, y: 13, w: 14, h: 9, color: "#1a1a2a" },
    { id: "I", name: "Final Assembly", x: 64, y: 2, w: 18, h: 10, color: "#2a2a2a" },
    { id: "J", name: "Test & Validation", x: 64, y: 13, w: 18, h: 9, color: "#1a2a3a" },
    { id: "K", name: "Paint / Coating", x: 83, y: 2, w: 15, h: 10, color: "#2a1a1a" },
    { id: "L", name: "QC / Inspection", x: 83, y: 13, w: 15, h: 9, color: "#1a3a2a" },
    { id: "M", name: "Packaging & Ship", x: 64, y: 23, w: 34, h: 8, color: "#1a1a1a" },
    { id: "N", name: "Tool Crib / Maint", x: 1, y: 23, w: 12, h: 8, color: "#222222" },
    { id: "O", name: "Eng Office / MRB", x: 14, y: 23, w: 12, h: 8, color: "#222222" },
    { id: "P", name: "Expansion (2030)", x: 1, y: 33, w: 97, h: 7, color: "#0a0a2a" },
  ];

  // Individual equipment pieces inside zones
  const equipment = [
    // Receiving Dock
    { id: "DOCK-01", zone: "A", x: 3, y: 4, w: 3.5, h: 2, status: "running", type: "Dock Door 1", util: 72 },
    { id: "DOCK-02", zone: "A", x: 7, y: 4, w: 3.5, h: 2, status: "running", type: "Dock Door 2", util: 68 },
    { id: "SCALE-01", zone: "A", x: 5, y: 7, w: 3, h: 1.5, status: "running", type: "Weigh Station", util: 55 },
    // Raw Material Storage
    { id: "RACK-01", zone: "B", x: 2, y: 12.5, w: 4, h: 3, status: "running", type: "Vertical Rack A", util: 95 },
    { id: "RACK-02", zone: "B", x: 7, y: 12.5, w: 4, h: 3, status: "warning", type: "Vertical Rack B", util: 120 },
    { id: "AGV-01", zone: "B", x: 4, y: 17, w: 2.5, h: 2, status: "running", type: "AGV Staging", util: 80 },
    // CNC Machining
    { id: "CNC-01", zone: "C", x: 14, y: 3.5, w: 3, h: 3, status: "running", type: "5-Axis Mill", util: 88 },
    { id: "CNC-02", zone: "C", x: 18, y: 3.5, w: 3, h: 3, status: "running", type: "5-Axis Mill", util: 82 },
    { id: "CNC-03", zone: "C", x: 22, y: 3.5, w: 3, h: 3, status: "maintenance", type: "5-Axis Mill", util: 0 },
    { id: "CNC-04", zone: "C", x: 26, y: 3.5, w: 3, h: 3, status: "running", type: "3-Axis Mill", util: 76 },
    { id: "LATHE-01", zone: "C", x: 14, y: 7.5, w: 3.5, h: 3, status: "running", type: "CNC Lathe", util: 84 },
    { id: "LATHE-02", zone: "C", x: 18.5, y: 7.5, w: 3.5, h: 3, status: "running", type: "CNC Lathe", util: 79 },
    { id: "CMM-01", zone: "C", x: 23, y: 7.5, w: 3, h: 3, status: "running", type: "CMM Inspect", util: 65 },
    // Composite Layup
    { id: "LAY-01", zone: "D", x: 14, y: 14, w: 4, h: 3, status: "running", type: "Layup Table 1", util: 78 },
    { id: "LAY-02", zone: "D", x: 19, y: 14, w: 4, h: 3, status: "running", type: "Layup Table 2", util: 82 },
    { id: "LAY-03", zone: "D", x: 24, y: 14, w: 4, h: 3, status: "running", type: "Layup Table 3", util: 74 },
    { id: "OVEN-01", zone: "D", x: 15, y: 18, w: 5, h: 2.5, status: "running", type: "Autoclave", util: 90 },
    { id: "TRIM-01", zone: "D", x: 22, y: 18, w: 4, h: 2.5, status: "running", type: "CNC Trim", util: 72 },
    // Robotic Welding
    { id: "WELD-01", zone: "E", x: 33, y: 3.5, w: 3, h: 3, status: "running", type: "Robot Cell 1", util: 91 },
    { id: "WELD-02", zone: "E", x: 37, y: 3.5, w: 3, h: 3, status: "running", type: "Robot Cell 2", util: 88 },
    { id: "WELD-03", zone: "E", x: 41, y: 3.5, w: 3, h: 3, status: "running", type: "Robot Cell 3", util: 85 },
    { id: "WELD-04", zone: "E", x: 33, y: 7.5, w: 3, h: 3, status: "down", type: "Robot Cell 4", util: 0 },
    { id: "WELD-05", zone: "E", x: 37, y: 7.5, w: 3, h: 3, status: "running", type: "Robot Cell 5", util: 86 },
    { id: "GRIND-01", zone: "E", x: 41, y: 7.5, w: 3, h: 3, status: "running", type: "Grind/Deburr", util: 70 },
    // PCB Assembly
    { id: "SMT-01", zone: "F", x: 33, y: 14, w: 4.5, h: 3, status: "running", type: "SMT Line 1", util: 82 },
    { id: "SMT-02", zone: "F", x: 38.5, y: 14, w: 4.5, h: 3, status: "running", type: "SMT Line 2", util: 76 },
    { id: "WAVE-01", zone: "F", x: 34, y: 18, w: 3.5, h: 2.5, status: "running", type: "Wave Solder", util: 68 },
    { id: "AOI-01", zone: "F", x: 39, y: 18, w: 3.5, h: 2.5, status: "running", type: "AOI Inspect", util: 72 },
    // Sub-Assembly A
    { id: "SUBA-01", zone: "G", x: 50, y: 3.5, w: 4, h: 3, status: "running", type: "Elec Integ 1", util: 74 },
    { id: "SUBA-02", zone: "G", x: 55, y: 3.5, w: 4, h: 3, status: "running", type: "Elec Integ 2", util: 78 },
    { id: "SUBA-03", zone: "G", x: 52, y: 7.5, w: 4, h: 3, status: "running", type: "Harness Assy", util: 70 },
    // Sub-Assembly B
    { id: "SUBB-01", zone: "H", x: 50, y: 14, w: 4, h: 3, status: "running", type: "Struct Assy 1", util: 72 },
    { id: "SUBB-02", zone: "H", x: 55, y: 14, w: 4, h: 3, status: "running", type: "Struct Assy 2", util: 68 },
    { id: "SUBB-03", zone: "H", x: 52, y: 18, w: 4, h: 3, status: "running", type: "Jig/Fixture", util: 60 },
    // Final Assembly
    { id: "FIN-01", zone: "I", x: 65, y: 3.5, w: 3.5, h: 3, status: "running", type: "Station 1", util: 84 },
    { id: "FIN-02", zone: "I", x: 69.5, y: 3.5, w: 3.5, h: 3, status: "running", type: "Station 2", util: 86 },
    { id: "FIN-03", zone: "I", x: 74, y: 3.5, w: 3.5, h: 3, status: "running", type: "Station 3", util: 80 },
    { id: "FIN-04", zone: "I", x: 65, y: 7.5, w: 3.5, h: 3, status: "running", type: "Station 4", util: 82 },
    { id: "FIN-05", zone: "I", x: 69.5, y: 7.5, w: 3.5, h: 3, status: "running", type: "Station 5", util: 78 },
    { id: "FIN-06", zone: "I", x: 74, y: 7.5, w: 3.5, h: 3, status: "planned", type: "Station 6 (2028)", util: 0 },
    // Test & Validation
    { id: "TEST-01", zone: "J", x: 65, y: 14, w: 4, h: 3, status: "running", type: "Func Test", util: 88 },
    { id: "TEST-02", zone: "J", x: 70, y: 14, w: 4, h: 3, status: "running", type: "Env Chamber", util: 82 },
    { id: "TEST-03", zone: "J", x: 75, y: 14, w: 4, h: 3, status: "running", type: "EMI/EMC", util: 76 },
    { id: "TEST-04", zone: "J", x: 67, y: 18, w: 5, h: 2.5, status: "running", type: "Flight Sim", util: 70 },
    { id: "TEST-05", zone: "J", x: 74, y: 18, w: 4, h: 2.5, status: "planned", type: "Endurance (2027)", util: 0 },
    // Paint/Coating
    { id: "PAINT-01", zone: "K", x: 84, y: 3.5, w: 5, h: 3, status: "running", type: "Paint Booth 1", util: 72 },
    { id: "PAINT-02", zone: "K", x: 90, y: 3.5, w: 5, h: 3, status: "running", type: "Paint Booth 2", util: 64 },
    { id: "CURE-01", zone: "K", x: 86, y: 7.5, w: 5, h: 3, status: "running", type: "UV Cure Oven", util: 58 },
    // QC
    { id: "QC-01", zone: "L", x: 84, y: 14, w: 4, h: 3, status: "running", type: "Visual Inspect", util: 80 },
    { id: "QC-02", zone: "L", x: 89, y: 14, w: 4, h: 3, status: "running", type: "Dimensional", util: 75 },
    { id: "QC-03", zone: "L", x: 94, y: 14, w: 3, h: 3, status: "running", type: "NDT/X-Ray", util: 68 },
    { id: "QC-04", zone: "L", x: 86, y: 18, w: 5, h: 2.5, status: "running", type: "Final QA Sign", util: 82 },
    // Packaging & Ship
    { id: "PACK-01", zone: "M", x: 65, y: 24.5, w: 5, h: 3, status: "running", type: "Custom Pack", util: 78 },
    { id: "PACK-02", zone: "M", x: 72, y: 24.5, w: 5, h: 3, status: "running", type: "Crate Build", util: 82 },
    { id: "SHIP-01", zone: "M", x: 80, y: 24.5, w: 5, h: 3, status: "warning", type: "Ship Dock 1", util: 110 },
    { id: "SHIP-02", zone: "M", x: 88, y: 24.5, w: 5, h: 3, status: "running", type: "Ship Dock 2", util: 85 },
  ];

  // Optimized overrides — what changes when we fix the factory
  const optimizedOverrides = {
    "CNC-03": { status: "running", util: 84, type: "5-Axis Mill (repaired)" },
    "WELD-04": { status: "running", util: 82, type: "Robot Cell 4 (repaired)" },
    "RACK-02": { status: "running", util: 78, type: "Vertical Rack B (expanded)" },
    "SHIP-01": { status: "running", util: 82, type: "Ship Dock 1 (expanded)" },
    "FIN-06": { status: "running", util: 75, type: "Station 6 (installed)" },
    "TEST-05": { status: "running", util: 70, type: "Endurance (installed)" },
  };

  const getEquipment = (eq) => {
    if (!showOptimized || !optimizedOverrides[eq.id]) return eq;
    return { ...eq, ...optimizedOverrides[eq.id] };
  };

  const equipmentStatusColor = (s) => {
    if (s === "running") return COLORS.green;
    if (s === "maintenance") return COLORS.yellow;
    if (s === "down") return COLORS.red;
    if (s === "warning") return COLORS.orange;
    if (s === "planned") return COLORS.accent;
    return COLORS.text;
  };

  // Material flow paths (production sequence)
  const flowPaths = [
    { from: "A", to: "B", label: "Inbound", d: "M 7,9 L 7,11" },
    { from: "B", to: "C", label: "Material", d: "M 12,16 L 13,8" },
    { from: "C", to: "D", label: "Parts", d: "M 22,12 L 22,13" },
    { from: "C", to: "E", label: "Machined", d: "M 31,7 L 32,7" },
    { from: "D", to: "E", label: "Composite", d: "M 31,17 L 32,10" },
    { from: "E", to: "G", label: "Welded", d: "M 48,7 L 49,7" },
    { from: "F", to: "H", label: "PCBs", d: "M 48,17 L 49,17" },
    { from: "G", to: "I", label: "Sub-A", d: "M 63,7 L 64,7" },
    { from: "H", to: "I", label: "Sub-B", d: "M 63,17 L 64,10" },
    { from: "I", to: "J", label: "Units", d: "M 73,12 L 73,13" },
    { from: "I", to: "K", label: "Paint", d: "M 82,7 L 83,7" },
    { from: "K", to: "L", label: "Coated", d: "M 90,12 L 90,13" },
    { from: "J", to: "M", label: "Tested", d: "M 73,22 L 73,23" },
    { from: "L", to: "M", label: "QC Pass", d: "M 90,22 L 90,23" },
  ];

  // Move-in / rigging paths (from dock to equipment install locations)
  const moveInPaths = [
    { label: "CNC Install Route", d: "M 7,6 L 7,1 L 22,1 L 22,2", color: COLORS.accent },
    { label: "Weld Cell Route", d: "M 7,6 L 7,1 L 38,1 L 38,2", color: COLORS.accent },
    { label: "Final Assy Route", d: "M 7,6 L 7,1 L 73,1 L 73,2", color: COLORS.accent },
    { label: "Test Equip Route", d: "M 7,6 L 7,1 L 73,1 L 82,1 L 82,12 L 73,12 L 73,13", color: "#818cf8" },
    { label: "Paint Booth Route", d: "M 7,6 L 7,1 L 90,1 L 90,2", color: "#818cf8" },
    { label: "SMT Line Route", d: "M 7,6 L 7,1 L 13,1 L 13,12 L 36,12 L 36,13", color: COLORS.accent },
  ];

  // Clearance markers (aisle widths)
  const clearances = [
    { x1: 12.2, y1: 5, x2: 12.2, y2: 22, label: "6ft Aisle", ok: true },
    { x1: 31.2, y1: 2, x2: 31.2, y2: 22, label: "8ft Main", ok: true },
    { x1: 48.2, y1: 2, x2: 48.2, y2: 22, label: "6ft Aisle", ok: true },
    { x1: 63.2, y1: 2, x2: 63.2, y2: 22, label: "4ft Aisle", ok: false },
    { x1: 82.2, y1: 2, x2: 82.2, y2: 22, label: "6ft Aisle", ok: true },
    { x1: 1, y1: 22, x2: 63, y2: 22, label: "10ft Cross Aisle", ok: true },
  ];

  // ---- LEVEL 3: OVERHEAD (rich detail) ----
  const overheadTracks = [
    // AMHS main tracks
    { id: "AMHS-1", type: "amhs", d: "M 7,6 L 7,1 L 90,1", label: "AMHS Main N", speed: "40 u/hr" },
    { id: "AMHS-2", type: "amhs", d: "M 12,11 L 12,32", label: "AMHS Spine W", speed: "35 u/hr" },
    { id: "AMHS-3", type: "amhs", d: "M 31,2 L 31,32", label: "AMHS Spine C1", speed: "40 u/hr" },
    { id: "AMHS-4", type: "amhs", d: "M 48,2 L 48,32", label: "AMHS Spine C2", speed: "35 u/hr" },
    { id: "AMHS-5", type: "amhs", d: "M 63,2 L 63,32", label: "AMHS Spine E", speed: "40 u/hr" },
    { id: "AMHS-6", type: "amhs", d: "M 82,2 L 82,32", label: "AMHS Spine F", speed: "30 u/hr" },
    { id: "AMHS-7", type: "amhs", d: "M 7,12 L 90,12", label: "AMHS Cross Mid", speed: "30 u/hr" },
    { id: "AMHS-8", type: "amhs", d: "M 7,22 L 90,22", label: "AMHS Cross S", speed: "25 u/hr" },
    // Feeder spurs
    { id: "SPUR-1", type: "spur", d: "M 22,1 L 22,4", label: "CNC Feed" },
    { id: "SPUR-2", type: "spur", d: "M 38,1 L 38,4", label: "Weld Feed" },
    { id: "SPUR-3", type: "spur", d: "M 55,1 L 55,4", label: "SubA Feed" },
    { id: "SPUR-4", type: "spur", d: "M 73,1 L 73,4", label: "FinalA Feed" },
    { id: "SPUR-5", type: "spur", d: "M 90,1 L 90,4", label: "Paint Feed" },
    { id: "SPUR-6", type: "spur", d: "M 22,12 L 22,14", label: "Comp Feed" },
    { id: "SPUR-7", type: "spur", d: "M 38,12 L 38,14", label: "PCB Feed" },
    { id: "SPUR-8", type: "spur", d: "M 55,12 L 55,14", label: "SubB Feed" },
    { id: "SPUR-9", type: "spur", d: "M 73,12 L 73,14", label: "Test Feed" },
    { id: "SPUR-10", type: "spur", d: "M 90,12 L 90,14", label: "QC Feed" },
  ];

  const craneZones = [
    { id: "CR-1", x: 1, y: 2, w: 30, h: 20, label: "5-Ton Bridge Crane 1", capacity: "5 ton" },
    { id: "CR-2", x: 32, y: 2, w: 30, h: 20, label: "5-Ton Bridge Crane 2", capacity: "5 ton" },
    { id: "CR-3", x: 64, y: 2, w: 34, h: 20, label: "10-Ton Bridge Crane 3", capacity: "10 ton" },
  ];

  const utilityDrops = [
    { x: 15, y: 5, type: "power", label: "480V" },
    { x: 22, y: 5, type: "power", label: "480V" },
    { x: 35, y: 5, type: "power", label: "480V" },
    { x: 42, y: 5, type: "power", label: "480V" },
    { x: 52, y: 5, type: "power", label: "208V" },
    { x: 67, y: 5, type: "power", label: "208V" },
    { x: 75, y: 5, type: "power", label: "208V" },
    { x: 86, y: 5, type: "power", label: "208V" },
    { x: 18, y: 16, type: "gas", label: "N2" },
    { x: 36, y: 16, type: "gas", label: "Ar" },
    { x: 40, y: 16, type: "gas", label: "Ar" },
    { x: 85, y: 5, type: "exhaust", label: "EXH" },
    { x: 90, y: 5, type: "exhaust", label: "EXH" },
    { x: 16, y: 18, type: "exhaust", label: "EXH" },
    { x: 22, y: 18, type: "compressed", label: "CDA" },
    { x: 35, y: 8, type: "compressed", label: "CDA" },
    { x: 67, y: 16, type: "compressed", label: "CDA" },
  ];

  const handoffPoints = [
    { x: 12, y: 7, label: "HP-1" },
    { x: 31, y: 7, label: "HP-2" },
    { x: 48, y: 7, label: "HP-3" },
    { x: 63, y: 7, label: "HP-4" },
    { x: 82, y: 7, label: "HP-5" },
    { x: 12, y: 17, label: "HP-6" },
    { x: 31, y: 17, label: "HP-7" },
    { x: 48, y: 17, label: "HP-8" },
    { x: 63, y: 17, label: "HP-9" },
    { x: 82, y: 17, label: "HP-10" },
  ];

  // ---- LEVEL 1: SUB-FAB ----
  const subfabSystems = [
    // Pipe runs
    { id: "PIPE-CW", type: "pipe", d: "M 5,8 L 95,8", color: "#3b82f6", label: "Chilled Water Supply", size: "8-inch" },
    { id: "PIPE-CWR", type: "pipe", d: "M 5,10 L 95,10", color: "#60a5fa", label: "Chilled Water Return", size: "8-inch" },
    { id: "PIPE-N2", type: "pipe", d: "M 5,15 L 50,15", color: "#a78bfa", label: "N2 Bulk Supply", size: "4-inch" },
    { id: "PIPE-AR", type: "pipe", d: "M 5,17 L 48,17", color: "#c084fc", label: "Argon Supply", size: "3-inch" },
    { id: "PIPE-VAC", type: "pipe", d: "M 10,20 L 80,20", color: "#6b7280", label: "Vacuum Main", size: "6-inch" },
    { id: "PIPE-EXH", type: "pipe", d: "M 15,25 L 95,25", color: "#f87171", label: "General Exhaust", size: "12-inch" },
    { id: "PIPE-SEXH", type: "pipe", d: "M 30,27 L 45,27", color: "#fb923c", label: "Solvent Exhaust", size: "8-inch" },
    // Cable trays
    { id: "TRAY-1", type: "tray", d: "M 5,32 L 95,32", color: "#fbbf24", label: "Power Cable Tray (480V)", size: "24-inch" },
    { id: "TRAY-2", type: "tray", d: "M 5,34 L 95,34", color: "#fde047", label: "Signal Cable Tray", size: "12-inch" },
    { id: "TRAY-3", type: "tray", d: "M 5,36 L 95,36", color: "#a3e635", label: "Fiber/Network Tray", size: "6-inch" },
    // Vertical risers
    { id: "RISER-1", type: "riser", x: 12, y: 5, label: "Riser A" },
    { id: "RISER-2", type: "riser", x: 31, y: 5, label: "Riser B" },
    { id: "RISER-3", type: "riser", x: 48, y: 5, label: "Riser C" },
    { id: "RISER-4", type: "riser", x: 63, y: 5, label: "Riser D" },
    { id: "RISER-5", type: "riser", x: 82, y: 5, label: "Riser E" },
  ];

  const subfabEquipment = [
    { id: "AHU-01", x: 5, y: 40, w: 12, h: 6, label: "Air Handler 1", status: "running", util: 78 },
    { id: "AHU-02", x: 20, y: 40, w: 12, h: 6, label: "Air Handler 2", status: "running", util: 82 },
    { id: "CHILLER-01", x: 35, y: 40, w: 10, h: 6, label: "Chiller 1", status: "running", util: 72 },
    { id: "CHILLER-02", x: 48, y: 40, w: 10, h: 6, label: "Chiller 2", status: "running", util: 68 },
    { id: "UPS-01", x: 62, y: 40, w: 8, h: 6, label: "UPS System", status: "running", util: 45 },
    { id: "XFMR-01", x: 73, y: 40, w: 10, h: 6, label: "Main Transformer", status: "running", util: 62 },
    { id: "WASTE-01", x: 86, y: 40, w: 10, h: 6, label: "Waste Treatment", status: "warning", util: 95 },
  ];

  const levelLabels = {
    level1: "Level 1: Sub-Fab (Utilities & Infrastructure)",
    level2: "Level 2: Factory Floor (Production)",
    level3: "Level 3: Overhead (Material Handling & Utilities)",
  };

  return (
    <div>
      <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, lineHeight: 1.7, marginBottom: "1.5rem" }}>
        Multi-level factory layout for a 1M sq ft autonomous systems production facility.
        Click equipment to see details. Toggle paths, clearances, and move-in routes.
      </p>

      {/* Level tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { key: "level1", label: "Sub-Fab" },
          { key: "level2", label: "Factory Floor" },
          { key: "level3", label: "Overhead" },
        ].map(lv => (
          <button
            key={lv.key}
            onClick={() => { setFactoryLevel(lv.key); setSelectedItem(null); }}
            style={{
              fontFamily: FONT, fontSize: "0.75rem", fontWeight: 600, padding: "0.5rem 1rem",
              background: factoryLevel === lv.key ? COLORS.heading : "transparent",
              color: factoryLevel === lv.key ? COLORS.bg : COLORS.text,
              border: `1px solid ${factoryLevel === lv.key ? COLORS.heading : COLORS.cardBorder}`,
              cursor: "pointer", borderRadius: "2px",
            }}
          >
            {lv.label}
          </button>
        ))}
      </div>

      {/* Toggle buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {factoryLevel === "level2" && (
          <>
            <button onClick={() => setShowPaths(!showPaths)} style={{
              fontFamily: FONT, fontSize: "0.7rem", padding: "0.4rem 0.8rem",
              background: showPaths ? `${COLORS.green}22` : "transparent",
              color: showPaths ? COLORS.green : COLORS.tabInactive,
              border: `1px solid ${showPaths ? COLORS.green : COLORS.cardBorder}`,
              cursor: "pointer", borderRadius: "2px",
            }}>Material Flow</button>
            <button onClick={() => setShowMoveIn(!showMoveIn)} style={{
              fontFamily: FONT, fontSize: "0.7rem", padding: "0.4rem 0.8rem",
              background: showMoveIn ? `${COLORS.accent}22` : "transparent",
              color: showMoveIn ? COLORS.accent : COLORS.tabInactive,
              border: `1px solid ${showMoveIn ? COLORS.accent : COLORS.cardBorder}`,
              cursor: "pointer", borderRadius: "2px",
            }}>Move-In Routes</button>
            <button onClick={() => setShowClearances(!showClearances)} style={{
              fontFamily: FONT, fontSize: "0.7rem", padding: "0.4rem 0.8rem",
              background: showClearances ? `${COLORS.orange}22` : "transparent",
              color: showClearances ? COLORS.orange : COLORS.tabInactive,
              border: `1px solid ${showClearances ? COLORS.orange : COLORS.cardBorder}`,
              cursor: "pointer", borderRadius: "2px",
            }}>Clearances</button>
            <button onClick={() => setShowOptimized(!showOptimized)} style={{
              fontFamily: FONT, fontSize: "0.7rem", padding: "0.4rem 0.8rem",
              background: showOptimized ? `${COLORS.green}22` : "transparent",
              color: showOptimized ? COLORS.green : COLORS.tabInactive,
              border: `1px solid ${showOptimized ? COLORS.green : COLORS.cardBorder}`,
              cursor: "pointer", borderRadius: "2px",
            }}>{showOptimized ? "Optimized View" : "Current View"}</button>
          </>
        )}
        {/* Legend */}
        <div style={{ display: "flex", gap: "0.8rem", marginLeft: "auto", alignItems: "center", flexWrap: "wrap" }}>
          {[
            ["running", "Running", COLORS.green],
            ["maintenance", "Maintenance", COLORS.yellow],
            ["down", "Down", COLORS.red],
            ["warning", "Over-Util", COLORS.orange],
            ["planned", "Planned", COLORS.accent],
          ].map(([, label, color]) => (
            <span key={label} style={{ fontFamily: FONT, fontSize: "0.6rem", color: COLORS.text, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: 6, height: 6, background: color, display: "inline-block", borderRadius: "1px" }} /> {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : (selectedItem ? "2.5fr 1fr" : "1fr"), gap: "1.5rem" }}>
        {/* Main factory SVG */}
        <div style={{
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
          padding: "1rem", position: "relative",
        }}>
          <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: COLORS.tabInactive, marginBottom: "0.5rem", letterSpacing: "0.1em" }}>
            {levelLabels[factoryLevel]}
          </div>
          <svg viewBox="0 0 100 42" style={{ width: "100%", height: "auto", minHeight: "300px" }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrowG" markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0, 4 1.5, 0 3" fill={COLORS.green} opacity="0.6" />
              </marker>
              <marker id="arrowB" markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0, 4 1.5, 0 3" fill={COLORS.accent} opacity="0.7" />
              </marker>
              <marker id="arrowW" markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0, 4 1.5, 0 3" fill={COLORS.heading} opacity="0.5" />
              </marker>
            </defs>

            {/* ---- LEVEL 2: Factory Floor ---- */}
            {factoryLevel === "level2" && (
              <>
                {/* Zone backgrounds */}
                {zones.map(z => (
                  <rect key={z.id} x={z.x} y={z.y} width={z.w} height={z.h}
                    fill={z.color} stroke={COLORS.cardBorder} strokeWidth="0.15" rx="0.3" opacity="0.7"
                  />
                ))}
                {/* Zone labels */}
                {zones.map(z => (
                  <text key={"lbl-"+z.id} x={z.x + 0.5} y={z.y + 1.2}
                    fill={COLORS.tabInactive} fontSize="1" fontFamily="sans-serif" opacity="0.7"
                  >{z.id}: {z.name}</text>
                ))}

                {/* Material flow paths */}
                {showPaths && flowPaths.map((p, i) => (
                  <g key={"flow-"+i}>
                    <path d={p.d} stroke={COLORS.green} strokeWidth="0.25" fill="none"
                      strokeDasharray="1,0.5" markerEnd="url(#arrowG)" opacity="0.5" />
                    <text x={p.d.split(" ")[1]} y={Number(p.d.split(" ")[2]) - 0.5}
                      fill={COLORS.green} fontSize="0.7" fontFamily="sans-serif" opacity="0.5"
                    >{p.label}</text>
                  </g>
                ))}

                {/* Move-in routes */}
                {showMoveIn && moveInPaths.map((p, i) => (
                  <path key={"movein-"+i} d={p.d} stroke={p.color} strokeWidth="0.3" fill="none"
                    strokeDasharray="0.8,0.4" markerEnd="url(#arrowB)" opacity="0.6" />
                ))}

                {/* Clearance markers */}
                {showClearances && clearances.map((c, i) => (
                  <g key={"clr-"+i}>
                    <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke={c.ok ? COLORS.orange : COLORS.red} strokeWidth="0.15"
                      strokeDasharray="0.5,0.5" opacity="0.6"
                    />
                    <text x={c.x1 + 0.3} y={(c.y1 + c.y2) / 2}
                      fill={c.ok ? COLORS.orange : COLORS.red} fontSize="0.7" fontFamily="sans-serif"
                      transform={`rotate(-90, ${c.x1 + 0.3}, ${(c.y1 + c.y2) / 2})`} opacity="0.7"
                    >{c.label}</text>
                  </g>
                ))}

                {/* Individual equipment */}
                {equipment.map(raw => {
                  const eq = getEquipment(raw);
                  const isUpgraded = showOptimized && optimizedOverrides[raw.id];
                  return (
                  <g key={eq.id} onClick={() => setSelectedItem(eq)} style={{ cursor: "pointer" }}>
                    <rect x={eq.x} y={eq.y} width={eq.w} height={eq.h}
                      fill={`${equipmentStatusColor(eq.status)}15`}
                      stroke={selectedItem?.id === eq.id ? COLORS.heading : isUpgraded ? COLORS.green : equipmentStatusColor(eq.status)}
                      strokeWidth={selectedItem?.id === eq.id ? "0.3" : isUpgraded ? "0.25" : "0.15"}
                      rx="0.2"
                    />
                    {/* Upgrade glow */}
                    {isUpgraded && (
                      <rect x={eq.x - 0.2} y={eq.y - 0.2} width={eq.w + 0.4} height={eq.h + 0.4}
                        fill="none" stroke={COLORS.green} strokeWidth="0.1" rx="0.3" opacity="0.4"
                      />
                    )}
                    {/* Status indicator dot */}
                    <circle cx={eq.x + eq.w - 0.5} cy={eq.y + 0.5} r="0.3"
                      fill={equipmentStatusColor(eq.status)} />
                    {/* Equipment ID */}
                    <text x={eq.x + eq.w / 2} y={eq.y + eq.h / 2 - 0.2}
                      textAnchor="middle" fill={isUpgraded ? COLORS.green : COLORS.heading}
                      fontSize="0.7" fontFamily="sans-serif" fontWeight="600"
                    >{eq.id}</text>
                    {/* Equipment type */}
                    <text x={eq.x + eq.w / 2} y={eq.y + eq.h / 2 + 0.7}
                      textAnchor="middle" fill={isUpgraded ? COLORS.green : COLORS.tabInactive}
                      fontSize="0.5" fontFamily="sans-serif"
                    >{eq.type}</text>
                    {/* Utilization bar */}
                    {eq.util > 0 && (
                      <>
                        <rect x={eq.x + 0.3} y={eq.y + eq.h - 0.6} width={eq.w - 0.6} height="0.3"
                          fill={COLORS.cardBorder} rx="0.1" />
                        <rect x={eq.x + 0.3} y={eq.y + eq.h - 0.6}
                          width={Math.min((eq.w - 0.6) * (eq.util / 100), eq.w - 0.6)} height="0.3"
                          fill={eq.util > 100 ? COLORS.red : eq.util > 85 ? COLORS.orange : COLORS.green}
                          rx="0.1" />
                      </>
                    )}
                  </g>
                  );
                })}
              </>
            )}

            {/* ---- LEVEL 3: OVERHEAD ---- */}
            {factoryLevel === "level3" && (
              <>
                {/* Factory floor outline (ghost) */}
                {zones.map(z => (
                  <rect key={z.id} x={z.x} y={z.y} width={z.w} height={z.h}
                    fill="none" stroke={COLORS.cardBorder} strokeWidth="0.1" rx="0.3" strokeDasharray="0.5,0.5" opacity="0.3"
                  />
                ))}
                {zones.map(z => (
                  <text key={"ghost-"+z.id} x={z.x + z.w/2} y={z.y + z.h/2}
                    textAnchor="middle" fill={COLORS.cardBorder} fontSize="0.9" fontFamily="sans-serif" opacity="0.3"
                  >{z.id}</text>
                ))}

                {/* Crane coverage zones */}
                {craneZones.map(c => (
                  <g key={c.id} onClick={() => setSelectedItem({ id: c.id, type: c.label, status: "running", util: 75, zone: "OH", notes: `Coverage: ${c.w}x${c.h}m. Capacity: ${c.capacity}. Shared across ${Math.floor(c.w/10)} zones.` })} style={{ cursor: "pointer" }}>
                    <rect x={c.x} y={c.y} width={c.w} height={c.h}
                      fill="none" stroke={COLORS.orange} strokeWidth="0.15"
                      strokeDasharray="1,0.5" opacity="0.35"
                    />
                    <text x={c.x + c.w/2} y={c.y + c.h - 1}
                      textAnchor="middle" fill={COLORS.orange} fontSize="0.8" fontFamily="sans-serif" opacity="0.5"
                    >{c.label}</text>
                  </g>
                ))}

                {/* AMHS tracks */}
                {overheadTracks.map(t => (
                  <g key={t.id} onClick={() => setSelectedItem({ id: t.id, type: t.type === "amhs" ? `AMHS Track` : "Feeder Spur", status: "running", util: 80, zone: "OH", notes: t.speed ? `Speed: ${t.speed}` : "Connects main track to zone" })} style={{ cursor: "pointer" }}>
                    <path d={t.d}
                      stroke={t.type === "amhs" ? COLORS.heading : COLORS.accent}
                      strokeWidth={t.type === "amhs" ? "0.4" : "0.2"}
                      fill="none" markerEnd={t.type === "amhs" ? "url(#arrowW)" : "url(#arrowB)"}
                      opacity={t.type === "amhs" ? 0.6 : 0.4}
                    />
                    <text x={t.d.split("L")[0].split(" ")[1]} y={Number(t.d.split("L")[0].split(" ")[2] || t.d.split(",")[1]) - 0.5}
                      fill={t.type === "amhs" ? COLORS.heading : COLORS.accent}
                      fontSize="0.6" fontFamily="sans-serif" opacity="0.5"
                    >{t.label}</text>
                  </g>
                ))}

                {/* Utility drops */}
                {utilityDrops.map((u, i) => {
                  const colors = { power: "#fbbf24", gas: "#a78bfa", exhaust: "#f87171", compressed: "#38bdf8" };
                  const shapes = { power: "⚡", gas: "●", exhaust: "▲", compressed: "◆" };
                  return (
                    <g key={"util-"+i} onClick={() => setSelectedItem({ id: `UTIL-${i}`, type: `${u.type} Drop: ${u.label}`, status: "running", util: 0, zone: "OH", notes: `Utility drop point. Type: ${u.type}. Rating: ${u.label}` })} style={{ cursor: "pointer" }}>
                      <text x={u.x} y={u.y} textAnchor="middle" fill={colors[u.type]} fontSize="1.2" opacity="0.6">
                        {shapes[u.type]}
                      </text>
                      <text x={u.x} y={u.y + 1.5} textAnchor="middle" fill={colors[u.type]} fontSize="0.5" fontFamily="sans-serif" opacity="0.5">
                        {u.label}
                      </text>
                    </g>
                  );
                })}

                {/* Handoff points */}
                {handoffPoints.map(h => (
                  <g key={h.label}>
                    <polygon points={`${h.x},${h.y-0.8} ${h.x+0.6},${h.y} ${h.x},${h.y+0.8} ${h.x-0.6},${h.y}`}
                      fill={COLORS.green} opacity="0.4" />
                    <text x={h.x} y={h.y + 0.25} textAnchor="middle" fill={COLORS.bg} fontSize="0.45" fontFamily="sans-serif" fontWeight="700">
                      {h.label.replace("HP-","")}
                    </text>
                  </g>
                ))}

                {/* Overhead legend */}
                <g>
                  <rect x="1" y="35" width="30" height="6" fill={COLORS.cardBg} stroke={COLORS.cardBorder} strokeWidth="0.1" rx="0.3" />
                  <text x="2" y="36.5" fill={COLORS.heading} fontSize="0.7" fontFamily="sans-serif" fontWeight="600">LEGEND</text>
                  <line x1="2" y1="37.3" x2="5" y2="37.3" stroke={COLORS.heading} strokeWidth="0.3" />
                  <text x="5.5" y="37.6" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">AMHS Main Track</text>
                  <line x1="2" y1="38.3" x2="5" y2="38.3" stroke={COLORS.accent} strokeWidth="0.2" />
                  <text x="5.5" y="38.6" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Feeder Spur</text>
                  <rect x="2" y="39" width="3" height="1" fill="none" stroke={COLORS.orange} strokeWidth="0.15" strokeDasharray="0.5,0.3" />
                  <text x="5.5" y="39.8" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Crane Coverage</text>
                  <text x="14" y="37.6" fill="#fbbf24" fontSize="0.8">⚡</text>
                  <text x="15" y="37.6" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Power</text>
                  <text x="14" y="38.6" fill="#a78bfa" fontSize="0.8">●</text>
                  <text x="15" y="38.6" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Gas</text>
                  <text x="14" y="39.8" fill="#f87171" fontSize="0.8">▲</text>
                  <text x="15" y="39.8" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Exhaust</text>
                  <text x="19" y="37.6" fill="#38bdf8" fontSize="0.8">◆</text>
                  <text x="20" y="37.6" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">CDA</text>
                  <polygon points="19,38.4 19.4,39 19,39.6 18.6,39" fill={COLORS.green} opacity="0.5" />
                  <text x="20" y="39.2" fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">Handoff Point</text>
                </g>
              </>
            )}

            {/* ---- LEVEL 1: SUB-FAB ---- */}
            {factoryLevel === "level1" && (
              <>
                {/* Pipe runs */}
                {subfabSystems.filter(s => s.type === "pipe" || s.type === "tray").map(s => (
                  <g key={s.id} onClick={() => setSelectedItem({ id: s.id, type: s.label, status: "running", util: 0, zone: "SF", notes: `${s.type === "pipe" ? "Pipe" : "Cable tray"} run. Size: ${s.size}.` })} style={{ cursor: "pointer" }}>
                    <path d={s.d} stroke={s.color} strokeWidth={s.type === "pipe" ? "0.4" : "0.3"} fill="none" opacity="0.6" />
                    <text x="3" y={Number(s.d.split(",")[1].split(" ")[0]) - 0.3}
                      fill={s.color} fontSize="0.6" fontFamily="sans-serif" opacity="0.6"
                    >{s.label} ({s.size})</text>
                  </g>
                ))}

                {/* Vertical risers */}
                {subfabSystems.filter(s => s.type === "riser").map(s => (
                  <g key={s.id}>
                    <rect x={s.x - 1} y={s.y} width="2" height="32" fill="none" stroke={COLORS.heading} strokeWidth="0.15" strokeDasharray="0.5,0.5" opacity="0.3" />
                    <circle cx={s.x} cy={s.y + 1} r="0.8" fill={COLORS.heading} opacity="0.2" stroke={COLORS.heading} strokeWidth="0.1" />
                    <text x={s.x} y={s.y + 1.3} textAnchor="middle" fill={COLORS.heading} fontSize="0.55" fontFamily="sans-serif">{s.label}</text>
                  </g>
                ))}

                {/* Sub-fab equipment */}
                {subfabEquipment.map(eq => (
                  <g key={eq.id} onClick={() => setSelectedItem({ id: eq.id, type: eq.label, status: eq.status, util: eq.util, zone: "SF", notes: `${eq.label}. Utilization: ${eq.util}%. ${eq.util > 90 ? "Near capacity — plan for redundancy." : "Operating within normal range."}` })} style={{ cursor: "pointer" }}>
                    <rect x={eq.x} y={eq.y} width={eq.w} height={eq.h}
                      fill={`${equipmentStatusColor(eq.status)}10`}
                      stroke={selectedItem?.id === eq.id ? COLORS.heading : equipmentStatusColor(eq.status)}
                      strokeWidth="0.15" rx="0.3"
                    />
                    <text x={eq.x + eq.w/2} y={eq.y + eq.h/2 - 0.3} textAnchor="middle"
                      fill={COLORS.heading} fontSize="0.7" fontFamily="sans-serif" fontWeight="600"
                    >{eq.id}</text>
                    <text x={eq.x + eq.w/2} y={eq.y + eq.h/2 + 0.8} textAnchor="middle"
                      fill={COLORS.tabInactive} fontSize="0.55" fontFamily="sans-serif"
                    >{eq.label}</text>
                    {/* Util bar */}
                    <rect x={eq.x + 0.5} y={eq.y + eq.h - 0.8} width={eq.w - 1} height="0.3" fill={COLORS.cardBorder} rx="0.1" />
                    <rect x={eq.x + 0.5} y={eq.y + eq.h - 0.8}
                      width={Math.min((eq.w - 1) * eq.util / 100, eq.w - 1)} height="0.3"
                      fill={eq.util > 90 ? COLORS.orange : COLORS.green} rx="0.1"
                    />
                  </g>
                ))}

                {/* Sub-fab legend */}
                <g>
                  <rect x="60" y="35" width="37" height="6" fill={COLORS.cardBg} stroke={COLORS.cardBorder} strokeWidth="0.1" rx="0.3" />
                  <text x="61" y="36.5" fill={COLORS.heading} fontSize="0.7" fontFamily="sans-serif" fontWeight="600">UTILITY LEGEND</text>
                  {[
                    ["#3b82f6", "Chilled Water"], ["#a78bfa", "N2/Process Gas"], ["#f87171", "Exhaust"],
                    ["#fbbf24", "Power (480V)"], ["#fde047", "Signal/Control"], ["#a3e635", "Fiber/Network"],
                  ].map(([color, label], i) => (
                    <g key={label}>
                      <line x1={i < 3 ? 61 : 78} y1={37.3 + (i % 3) * 1} x2={i < 3 ? 64 : 81} y2={37.3 + (i % 3) * 1}
                        stroke={color} strokeWidth="0.4" />
                      <text x={i < 3 ? 64.5 : 81.5} y={37.6 + (i % 3) * 1}
                        fill={COLORS.text} fontSize="0.55" fontFamily="sans-serif">{label}</text>
                    </g>
                  ))}
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontFamily: FONT, color: COLORS.heading, fontSize: "0.95rem", fontWeight: 600 }}>
                {selectedItem.id}
              </h4>
              <span style={{
                fontFamily: FONT, fontSize: "0.6rem", fontWeight: 600, padding: "0.2rem 0.5rem",
                background: `${equipmentStatusColor(selectedItem.status)}22`,
                color: equipmentStatusColor(selectedItem.status), letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {selectedItem.status}
              </span>
            </div>

            <div style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text, lineHeight: 1.8, marginBottom: "0.8rem" }}>
              <div><strong style={{ color: COLORS.heading }}>Type:</strong> {selectedItem.type}</div>
              {selectedItem.zone && <div><strong style={{ color: COLORS.heading }}>Zone:</strong> {selectedItem.zone}</div>}
              {selectedItem.util > 0 && (
                <div>
                  <strong style={{ color: COLORS.heading }}>Utilization:</strong>{" "}
                  <span style={{ color: selectedItem.util > 100 ? COLORS.red : selectedItem.util > 85 ? COLORS.orange : COLORS.green }}>
                    {selectedItem.util}%
                  </span>
                </div>
              )}
            </div>

            {selectedItem.util > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ height: "6px", background: COLORS.cardBorder, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "3px",
                    width: `${Math.min(selectedItem.util, 130)}%`,
                    background: selectedItem.util > 100 ? COLORS.red : selectedItem.util > 85 ? COLORS.orange : COLORS.green,
                    transition: "width 0.3s",
                  }} />
                </div>
              </div>
            )}

            {selectedItem.notes && (
              <div style={{ padding: "0.8rem", background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}` }}>
                <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.3rem", fontWeight: 600 }}>
                  NOTES
                </div>
                <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, lineHeight: 1.5 }}>
                  {selectedItem.notes}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                fontFamily: FONT, fontSize: "0.7rem", color: COLORS.tabInactive,
                background: "transparent", border: `1px solid ${COLORS.cardBorder}`,
                padding: "0.4rem 1rem", cursor: "pointer", marginTop: "1rem", width: "100%",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {factoryLevel === "level2" && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "0.75rem", marginTop: "1.5rem",
        }}>
          {[
            { label: "Total Equipment", value: equipment.length, color: COLORS.heading },
            { label: "Running", value: equipment.map(getEquipment).filter(e => e.status === "running").length, color: COLORS.green },
            { label: "Maintenance", value: equipment.map(getEquipment).filter(e => e.status === "maintenance").length, color: COLORS.yellow },
            { label: "Down", value: equipment.map(getEquipment).filter(e => e.status === "down").length, color: COLORS.red },
            { label: "Over-Utilized", value: equipment.map(getEquipment).filter(e => e.util > 100).length, color: COLORS.orange },
            { label: "Planned (Future)", value: equipment.map(getEquipment).filter(e => e.status === "planned").length, color: COLORS.accent },
          ].map(s => (
            <div key={s.label} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: COLORS.tabInactive, letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Tab 3: Equipment Risk Tracker with Procurement Workflow ---
const EquipmentRiskTracker = () => {
  const isMobile = useIsMobile();
  const [sortBy, setSortBy] = useState("risk");
  const [expandedEquip, setExpandedEquip] = useState(null);

  const equipment = [
    {
      name: "CNC Milling Station", qty: 12, leadWeeks: 24, supplier: "Haas", risk: "high",
      reuse: 4, newBuy: 8, costPerUnit: 0.45, throughput: "8 units/day",
      devEngNotes: "12-spindle configuration. ±0.0001\" tolerance required for aerospace components.",
      ieAssessment: "4 units available from warehouse (2020 acquisition). Refurbish 2, cannibalize 2. Saves $0.9M. Need 8 new.",
      scStatus: "Single-source. Haas capacity tight. PO issued Jan 2026. Delivery June 2026. Installation: 4 weeks.",
      installTimeline: "Site prep: 2 weeks. Install: 3 weeks. Qual: 4 weeks. Production release: Aug 2026.",
      criticalPath: true,
    },
    {
      name: "Robotic Welding Cell", qty: 8, leadWeeks: 18, supplier: "Fanuc", risk: "high",
      reuse: 2, newBuy: 6, costPerUnit: 0.65, throughput: "12 units/day",
      devEngNotes: "Custom end-effectors for composite/metal hybrid joints. High heat tolerance.",
      ieAssessment: "2 units in warehouse (Fanuc M-710iC). Need custom tooling. Reuse adds 4 weeks eng time.",
      scStatus: "Fanuc can deliver base units in 18 weeks. Tooling qualification adds 6 weeks.",
      installTimeline: "Unpack/test: 1 week. Install: 2 weeks. Tooling qual: 6 weeks. Prod release: May 2026.",
      criticalPath: true,
    },
    {
      name: "Composite Layup Table", qty: 6, leadWeeks: 12, supplier: "Multiple", risk: "medium",
      reuse: 3, newBuy: 3, costPerUnit: 0.28, throughput: "4 units/day",
      devEngNotes: "Vacuum-assisted layup. 8ft x 12ft surface. Temperature controlled.",
      ieAssessment: "3 units in warehouse (2019). Refurb cost: $15K each. Still cheaper than new-buy at $280K.",
      scStatus: "3 suppliers approved. Stock available. Lead time: 8 weeks for new units.",
      installTimeline: "Refurb: 3 weeks. Install: 1 week. No qual needed. Prod ready: Feb 2026.",
      criticalPath: false,
    },
    {
      name: "Environmental Test Chamber", qty: 4, leadWeeks: 30, supplier: "Thermotron", risk: "high",
      reuse: 1, newBuy: 3, costPerUnit: 1.2, throughput: "2 units/day",
      devEngNotes: "Thermal cycle -40°C to +150°C. Humidity 20-95%. Only vendor with this spec.",
      ieAssessment: "1 reuse candidate (2015 acquisition). Overhaul: $50K. Need 3 new-buy.",
      scStatus: "Thermotron only supplier. 30-week lead. Qualification: 8 weeks after delivery.",
      installTimeline: "Delivery: 30 weeks. Install/connect: 2 weeks. Qual: 8 weeks. Total: 40 weeks.",
      criticalPath: true,
    },
    {
      name: "PCB Assembly Line", qty: 3, leadWeeks: 16, supplier: "Juki", risk: "medium",
      reuse: 1, newBuy: 2, costPerUnit: 0.85, throughput: "20 units/day",
      devEngNotes: "SMT placement rate: 5,000 CPH. Fine-pitch BGA capable.",
      ieAssessment: "1 unit in warehouse (Juki KE2080). Refurb $40K vs new-buy $850K. Reuse approved.",
      scStatus: "2 new units on order. Juki can deliver in 16 weeks. Spare parts: 12-week lead.",
      installTimeline: "Refurb: 4 weeks. Install: 2 weeks. Programming/qual: 3 weeks. Ready: Apr 2026.",
      criticalPath: false,
    },
    {
      name: "Paint / Coating Booth", qty: 2, leadWeeks: 8, supplier: "Multiple", risk: "low",
      reuse: 2, newBuy: 0, costPerUnit: 0.15, throughput: "15 units/day",
      devEngNotes: "Automated spray system. HVAC-integrated. VOC capture required.",
      ieAssessment: "2 units in warehouse (2018 acquisition). Full reuse. No upgrade needed.",
      scStatus: "Reuse from warehouse. No supply chain impact.",
      installTimeline: "Delivery from warehouse: 1 week. Install: 1 week. HVAC connect: 2 weeks. Ready: Dec 2025.",
      criticalPath: false,
    },
    {
      name: "Final Assembly Fixture", qty: 10, leadWeeks: 6, supplier: "Custom/Internal", risk: "low",
      reuse: 5, newBuy: 5, costPerUnit: 0.08, throughput: "6 units/day",
      devEngNotes: "Custom-designed for final assy of X-series platform.",
      ieAssessment: "5 fixtures from prior program. Design is modular. Add 5 new units.",
      scStatus: "Internal fabrication. On schedule. Engineering complete.",
      installTimeline: "Fabrication: 4 weeks. Install: 1 week. Fixture qual: 1 week. Ready: Jan 2026.",
      criticalPath: false,
    },
    {
      name: "Automated Inspection System", qty: 5, leadWeeks: 20, supplier: "Keyence", risk: "medium",
      reuse: 0, newBuy: 5, costPerUnit: 0.55, throughput: "10 units/day",
      devEngNotes: "AI vision for defect detection. 98% accuracy required. Custom software.",
      ieAssessment: "All new-buy. No legacy systems compatible. Keyence has capacity.",
      scStatus: "PO issued. Keyence confirming delivery in 20 weeks. Software build: 3 weeks post-delivery.",
      installTimeline: "Delivery: 20 weeks. Install: 2 weeks. Software config: 3 weeks. Qual: 2 weeks. Prod: Sep 2026.",
      criticalPath: true,
    },
  ];

  const procurementStages = [
    { stage: "Dev Engineering", desc: "Define specs & requirements", icon: "📋" },
    { stage: "Industrial Engineering", desc: "Validate capacity, reuse evaluation", icon: "⚙️" },
    { stage: "Supply Chain", desc: "Qualify suppliers, lead times, pricing", icon: "🔗" },
    { stage: "Supplier", desc: "Delivery, install, qualification", icon: "📦" },
  ];

  const sorted = [...equipment].sort((a, b) => {
    if (sortBy === "risk") {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.risk] - order[b.risk];
    }
    if (sortBy === "lead") return b.leadWeeks - a.leadWeeks;
    if (sortBy === "cost") return (b.newBuy * b.costPerUnit) - (a.newBuy * a.costPerUnit);
    return 0;
  });

  const totalNewBuyCost = equipment.reduce((s, e) => s + e.newBuy * e.costPerUnit, 0);
  const totalReuse = equipment.reduce((s, e) => s + e.reuse, 0);
  const totalNewBuy = equipment.reduce((s, e) => s + e.newBuy, 0);
  const reuseSavings = equipment.reduce((s, e) => s + e.reuse * e.costPerUnit, 0);
  const criticalPathItems = equipment.filter(e => e.criticalPath);

  return (
    <div>
      <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, lineHeight: 1.7, marginBottom: "1.5rem" }}>
        Equipment procurement pipeline from Development Engineering through Supplier qualification.
        Click equipment to expand and see detailed workflow, status, and installation timelines.
      </p>

      {/* Procurement Workflow */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "1rem", fontWeight: 600 }}>
          PROCUREMENT WORKFLOW
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          {procurementStages.map((p, i) => (
            <div key={p.stage} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "150px" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{p.icon}</div>
                <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.heading, fontWeight: 600, marginBottom: "0.2rem" }}>
                  {p.stage}
                </div>
                <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: COLORS.text }}>
                  {p.desc}
                </div>
              </div>
              {i < procurementStages.length - 1 && (
                <div style={{ fontSize: "1.2rem", color: COLORS.cardBorder, margin: "0 0.5rem" }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Critical Path Summary */}
      <div style={{ background: `${COLORS.red}15`, border: `1px solid ${COLORS.red}`, padding: "1rem", marginBottom: "1.5rem", borderRadius: "4px" }}>
        <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.red, letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 600 }}>
          CRITICAL PATH ({criticalPathItems.length} items)
        </div>
        <div style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text }}>
          {criticalPathItems.map(e => e.name).join(", ")} — These items have long lead times or supplier constraints and will gate production start.
        </div>
      </div>

      {/* Summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <MetricCard label="Total Equipment" value={equipment.reduce((s, e) => s + e.qty, 0)} suffix=" units" />
        <MetricCard label="Reuse from Warehouse" value={totalReuse} suffix={` units ($${reuseSavings.toFixed(1)}M)`} />
        <MetricCard label="New-Buy Required" value={totalNewBuy} suffix=" units" />
        <MetricCard label="New-Buy CapEx" value={totalNewBuyCost} prefix="$" suffix="M" decimals={1} highlight />
      </div>

      {/* Sort controls */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.tabInactive, alignSelf: "center", marginRight: "0.5rem" }}>SORT:</span>
        {[["risk", "Risk Level"], ["lead", "Lead Time"], ["cost", "Cost"]].map(([key, label]) => (
          <button key={key} onClick={() => setSortBy(key)} style={{
            fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, padding: "0.3rem 0.8rem",
            background: sortBy === key ? COLORS.heading : "transparent",
            color: sortBy === key ? COLORS.bg : COLORS.text,
            border: `1px solid ${sortBy === key ? COLORS.heading : COLORS.cardBorder}`,
            cursor: "pointer",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Equipment table */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, overflow: isMobile ? "auto" : "hidden" }}>
        <div style={{ minWidth: isMobile ? "750px" : "auto" }}>
          {sorted.map((eq, i) => (
            <div key={eq.name}>
              <div
                onClick={() => setExpandedEquip(expandedEquip === eq.name ? null : eq.name)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr",
                  padding: "0.8rem 1rem", borderBottom: `1px solid ${COLORS.cardBorder}`,
                  background: COLORS.cardBg, cursor: "pointer", alignItems: "center",
                  borderLeft: `3px solid ${eq.criticalPath ? COLORS.red : "transparent"}`,
                }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.inputBg}
              onMouseLeave={e => e.currentTarget.style.background = COLORS.cardBg}
            >
              <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.heading }}>{eq.name}</span>
              <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text }}>{eq.qty}</span>
              <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: eq.leadWeeks >= 20 ? COLORS.red : COLORS.text }}>{eq.leadWeeks}</span>
              <span style={{
                fontFamily: FONT, fontSize: "0.6rem", fontWeight: 600, padding: "0.15rem 0.4rem",
                background: `${eq.risk === "high" ? COLORS.red : eq.risk === "medium" ? COLORS.yellow : COLORS.green}22`,
                color: eq.risk === "high" ? COLORS.red : eq.risk === "medium" ? COLORS.yellow : COLORS.green,
                textTransform: "uppercase", letterSpacing: "0.05em", width: "fit-content",
              }}>
                {eq.risk}
              </span>
              <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: eq.reuse > 0 ? COLORS.green : COLORS.text }}>
                {eq.reuse > 0 ? `${eq.reuse} avail` : "—"}
              </span>
              <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.heading }}>
                ${(eq.newBuy * eq.costPerUnit).toFixed(1)}M
              </span>
              <span style={{ fontSize: "0.9rem", color: COLORS.text, textAlign: "right" }}>
                {expandedEquip === eq.name ? "▼" : "▶"}
              </span>
            </div>

            {/* Expandable detail section */}
            {expandedEquip === eq.name && (
              <div style={{ background: COLORS.inputBg, padding: "1rem", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <h5 style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 600 }}>
                      DEV ENG REQUIREMENT
                    </h5>
                    <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, lineHeight: 1.6 }}>
                      {eq.devEngNotes}
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 600 }}>
                      IE ASSESSMENT
                    </h5>
                    <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, lineHeight: 1.6 }}>
                      {eq.ieAssessment}
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 600 }}>
                      SUPPLY CHAIN STATUS
                    </h5>
                    <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, lineHeight: 1.6 }}>
                      {eq.scStatus}
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 600 }}>
                      INSTALLATION TIMELINE
                    </h5>
                    <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, lineHeight: 1.6 }}>
                      {eq.installTimeline}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
const _REMOVED_BuiltWithClaude = () => {
  const [ref, inView] = useInView(0.1);
  const isMobile = useIsMobile();

  const products = [
    {
      name: "Claude.ai",
      icon: "💬",
      usage: "Strategic thinking partner",
      examples: [
        "Scenario modeling for capacity planning decisions",
        "Drafting and refining stakeholder communications",
        "Analyzing complex trade-offs across factory buildouts",
        "Research synthesis for defense tech market landscape",
      ],
    },
    {
      name: "Claude Code",
      icon: "⌨️",
      usage: "Personal engineering co-pilot",
      examples: [
        "Built this entire portfolio site — every component, animation, and interactive tool",
        "Rapid prototyping of full-stack features for GoDeepr.ai",
        "Personal automation scripts and data visualization tools",
        "Intel now testing Claude Code for department-wide adoption",
      ],
    },
    {
      name: "Claude Cowork",
      icon: "📋",
      usage: "Document & workflow automation",
      examples: [
        "Generating tailored resumes with precise formatting (docx)",
        "Building role tracker spreadsheets with conditional formatting (xlsx)",
        "Creating professional presentations and reports",
        "Automating multi-step document workflows end-to-end",
      ],
    },
    {
      name: "Claude API",
      icon: "🔌",
      usage: "Production AI integration",
      examples: [
        "Used at Intel for capacity planning analysis and strategic decision support",
        "Powers the conversational AI engine behind Convos / GoDeepr.ai",
        "Real-time voice agent integration for customer interactions",
        "API orchestration across scheduling, CRM, and messaging systems",
      ],
    },
  ];

  const communityVision = [
    {
      title: "Hands-On Workshops",
      desc: "Monthly sessions showing how non-developers can use Claude Cowork to automate their work — creating docs, analyzing data, building presentations — no code required.",
    },
    {
      title: "Builder Nights",
      desc: "Technical deep-dives for engineers and developers. Live coding with Claude Code, API integrations, building real tools from scratch in a single evening.",
    },
    {
      title: "Industry Meetups",
      desc: "Connecting Phoenix's manufacturing, aerospace, and defense tech community with AI builders. Bridging the gap between traditional industry and frontier AI tools.",
    },
  ];

  return (
    <section id="built-with-claude" ref={ref} style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <span style={{
          fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          How I Build
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.1,
      }}>
        {inView ? <TypewriterBlock text="Built with Claude" speed={30} /> : ""}
      </h2>
      <p style={{
        fontFamily: FONT, fontSize: "1rem", color: COLORS.text, maxWidth: "700px",
        lineHeight: 1.7, marginBottom: "3rem",
      }}>
        Claude isn't just a tool I use — it's how I build. At Intel I use the Claude API for strategic
        capacity planning and analysis. On the side, I build with Claude Code — from launching an AI
        startup to creating this site. Intel is now testing Claude Code for department-wide adoption,
        and Claude is embedded in my daily workflow across every product Anthropic ships.
      </p>

      {/* Product usage cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem", marginBottom: "4rem",
      }}>
        {products.map((p, i) => (
          <div key={p.name} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            padding: "1.5rem",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${i * 0.1}s`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{p.icon}</span>
              <div>
                <h4 style={{ fontFamily: FONT, fontSize: "1rem", color: COLORS.heading, fontWeight: 600 }}>
                  {p.name}
                </h4>
                <span style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.05em" }}>
                  {p.usage}
                </span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {p.examples.map((ex, j) => (
                <li key={j} style={{
                  fontFamily: FONT, fontSize: "0.8rem", color: COLORS.text, lineHeight: 1.6,
                  paddingLeft: "1rem", position: "relative", marginBottom: "0.4rem",
                }}>
                  <span style={{ position: "absolute", left: 0, color: COLORS.accent }}>—</span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Meta callout: This site is proof */}
      <div style={{
        background: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}33`,
        borderRadius: "8px", padding: "2rem", marginBottom: "4rem",
        opacity: inView ? 1 : 0, transition: "opacity 0.6s ease 0.4s",
      }}>
        <h3 style={{ fontFamily: FONT, fontSize: "1.1rem", color: COLORS.heading, fontWeight: 600, marginBottom: "0.75rem" }}>
          This site is the proof.
        </h3>
        <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7, maxWidth: "700px" }}>
          Every section of this portfolio — the interactive factory optimizer with 60+ equipment items,
          the supplier qualification tool, the what-if demand planner, the resume timeline — was designed
          and built entirely with Claude Code in a single collaborative session. No templates, no boilerplate.
          Just a conversation about what I wanted to show and Claude helping me build it.
        </p>
      </div>

      {/* Community Ambassador Vision */}
      <div style={{ marginBottom: "1rem" }}>
        <span style={{
          fontFamily: FONT, fontSize: "0.75rem", color: COLORS.green,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          Community Vision
        </span>
      </div>
      <h3 style={{
        fontFamily: FONT, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.2,
      }}>
        What I'd build for Phoenix
      </h3>
      <p style={{
        fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, maxWidth: "700px",
        lineHeight: 1.7, marginBottom: "2rem",
      }}>
        Phoenix doesn't have a Claude community yet, but the builder energy is here —
        engineers, founders, and operators who think in systems but haven't discovered how
        Claude changes the way they work. I want to be the person who brings them together.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: "1.5rem",
      }}>
        {communityVision.map((v, i) => (
          <div key={v.title} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            padding: "1.5rem",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${0.5 + i * 0.1}s`,
          }}>
            <h4 style={{
              fontFamily: FONT, fontSize: "0.75rem", color: COLORS.green,
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem",
            }}>
              {v.title}
            </h4>
            <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: COLORS.text, lineHeight: 1.7 }}>
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// STARTUP PAGE (CONVOS / GODEEPR.AI)
// ============================================================
const StartupSection = () => {
  const [ref, inView] = useInView(0.1);
  const isMobile = useIsMobile();

  return (
    <section id="startup" ref={ref} style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <span style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          AI Startup
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.1,
      }}>
        {inView ? <TypewriterBlock text="Convos / GoDeepr.ai" speed={30} /> : ""}
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "1rem", color: COLORS.text, maxWidth: "700px", lineHeight: 1.7, marginBottom: "3rem" }}>
        An AI-driven workflow automation platform I designed, built, and deployed from zero to one.
        Integrating APIs, data flows, and operational logic to automate lead qualification, routing,
        and scheduling.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
        {[
          { title: "Problem", desc: "Small businesses lose revenue every day from missed calls, slow follow-up, and inconsistent outreach. When a lead calls and nobody picks up — or the callback takes 48 hours — that deal is gone." },
          { title: "Solution", desc: "AI-driven orchestration platform that automates the entire lead-to-meeting pipeline. Voice agents handle qualification, APIs route and schedule, operational logic handles edge cases." },
          { title: "What I Built", desc: "End-to-end system architecture: voice agent integration, API orchestration layer, data flow pipelines, scheduling logic, and rapid iterative deployment infrastructure." },
          { title: "How I Built It", desc: "Sole technical and strategic decision-maker. Scoped requirements, evaluated tools, built initial architecture, shipped fast, and iterated based on real user feedback and operational edge cases." },
        ].map((card, i) => (
          <div key={card.title} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "2rem",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${i * 0.1}s`,
          }}>
            <h4 style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {card.title}
            </h4>
            <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};

// ============================================================
// RIPPLE / COMMUNITY SECTION
// ============================================================
const RippleSection = () => {
  const [ref, inView] = useInView(0.1);
  const isMobile = useIsMobile();

  return (
    <section id="ripple" ref={ref} style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <span style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Community
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.1,
      }}>
        {inView ? <TypewriterBlock text="Ripple / GoDeepr.ai" speed={30} /> : ""}
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "1rem", color: COLORS.text, maxWidth: "700px", lineHeight: 1.7, marginBottom: "3rem" }}>
        A platform for sharing ripples of gratitude through your community.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
        {[
          { title: "Problem", desc: "Gratitude is one of the most powerful forces for building community — but we don't have a good way to share it beyond a passing comment or a text that gets buried. Workplaces, neighborhoods, and friend groups lack a simple way to publicly recognize the people who make a difference." },
          { title: "Solution", desc: "Ripple — a platform for sharing ripples of gratitude through your community. Send a ripple to someone who helped you, and it becomes visible to the people around them. Small recognitions compound into culture." },
          { title: "What I Built", desc: "Full-stack web app with social mechanics for sending, receiving, and discovering ripples. Community feeds, notification system, and shareable ripple cards. Built for both organic communities and workplace teams." },
          { title: "How I Built It", desc: "Solo builder using Claude Code and Claude API. Designed the UX, built the architecture, and shipped iteratively — testing with real communities to refine what resonates." },
        ].map((card, i) => (
          <div key={card.title} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "2rem",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.5s ease ${i * 0.1}s`,
          }}>
            <h4 style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {card.title}
            </h4>
            <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, lineHeight: 1.8,
        maxWidth: "700px", fontStyle: "italic", marginTop: "1rem",
      }}>
        I'm also actively engaged in AI builder communities across multiple cities — attending meetups,
        workshops, and connecting people in manufacturing and defense tech with frontier AI tools.
      </p>
    </section>
  );
};

// ============================================================
// RESUME / BACKGROUND SECTION
// ============================================================
const ResumeSection = () => {
  const [ref, inView] = useInView(0.1);
  const [showEarly, setShowEarly] = useState(false);

  const earlyTimeline = [
    { year: "2005-2009", title: "Yard Brothers Lawn Care & Online Shoe Sales", org: "Chandler/Scottsdale, AZ", desc: "Started at 15 with my brother and a friend — built a lawn care business and an online shoe reselling operation. First taste of hiring, scheduling, and scaling.", color: COLORS.orange },
    { year: "2006", title: "Eagle Scout", org: "Boy Scouts of America", desc: "Earned Eagle Scout badge at age 16.", color: COLORS.orange },
    { year: "2009-2012", title: "B.S. Systems Engineering (started)", org: "University of Arizona", desc: "RA mentoring 40+ students. Foundations in optimization, control systems, and complex problem-solving.", color: COLORS.text },
    { year: "2011-2012", title: "Process Improvement Intern", org: "Northrop Grumman", desc: "Led a process improvement project to fix delays in spare parts delivery for F/A-18 fighter jets. Designed a new delivery system that restored reliable parts flow to keep production on schedule.", color: COLORS.accent },
    { year: "2013-2015", title: "Turnaround Coordinator", org: "British Airways", desc: "Led aircraft turnaround operations, coordinating ground teams to optimize aircraft ground time and on-time departure performance.", color: COLORS.text },
    { year: "2015", title: "Started CrossFit", org: "", desc: "Committed to discipline, health, and building a new chapter.", color: COLORS.green },
  ];

  const careerTimeline = [
    { year: "2016-2018", title: "Station Agent & Operations", org: "American Airlines", desc: "Operations coordination and crew scheduling. Real-time disruption management and resource allocation.", color: COLORS.text },
    { year: "2016-2019", title: "B.S. Industrial Engineering", org: "Texas Tech University", desc: "Graduated Cum Laude. Alpha Pi Mu President. Green Belt Six Sigma certification.", color: COLORS.green },
    { year: "2018-2019", title: "IE Consultant", org: "Breedlove Foods", desc: "Redesigned food manufacturing processes, implementing automation and process optimization to drive a 40% increase in production output while minimizing downtime.", color: COLORS.text },
    { year: "2019-Present", title: "Strategic Capacity Planning IE", org: "Intel Corporation", desc: "Own capacity model for $30B+ equipment fleet across 7 global fabs. Built optimization tools, dashboards, and planning systems. $80M+ annual capital decisions. $250M in cost avoidance.", color: COLORS.green },
    { year: "2024-Present", title: "Founder & Builder", org: "Convos / GoDeepr.ai", desc: "Designed and deployed AI-driven workflow automation platform from zero to one. Full-stack system architecture, API integrations, rapid iterative deployment.", color: COLORS.orange },
  ];

  const skills = [
    { category: "Capacity & Planning", items: ["Long-Range Capacity Modeling", "Scenario Analysis", "Demand Forecasting", "S&OP", "Capital Planning", "Factory Readiness", "Crew/Workforce Planning", "Resource Allocation Optimization"] },
    { category: "Systems & Analytics", items: ["Python", "SQL", "Power BI Dashboards", "Data Pipelines", "Discrete-Event Simulation", "FlexSim", "ERP/MES Systems"] },
    { category: "Manufacturing", items: ["Factory Layout (AutoCAD)", "Equipment Deployment", "AMHS Material Flow", "Greenfield/Brownfield", "Throughput Optimization", "Lean Six Sigma"] },
    { category: "Program Execution", items: ["Cross-Functional Leadership", "Stakeholder Alignment", "Risk Assessment", "NPI Launch", "MS Project", "Zero-to-One Initiatives"] },
  ];

  return (
    <section id="resume" ref={ref} style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1rem" }}>
        <span style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Background
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1rem", lineHeight: 1.1,
      }}>
        {inView ? <TypewriterBlock text="Resume & Experience" speed={30} /> : ""}
      </h2>

      {/* Personal narrative */}
      <div style={{
        fontFamily: FONT, fontSize: "0.95rem", color: COLORS.text, lineHeight: 1.8,
        maxWidth: "700px", marginBottom: "3rem", fontStyle: "italic", color: COLORS.tabInactive,
      }}>
        Eagle Scout at 16. Started a business at 15. Worked airline ramps, sold shoes on eBay, got a Systems Engineering degree then switched to Industrial Engineering. None of it was wasted.
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", marginBottom: "4rem" }}>
        {/* Early Years Toggle */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => setShowEarly(!showEarly)}
            style={{
              fontFamily: FONT, fontSize: "0.8rem", color: COLORS.tabInactive,
              background: "transparent", border: `1px solid ${COLORS.cardBorder}`,
              padding: "0.5rem 1rem", cursor: "pointer", borderRadius: "4px",
              transition: "all 0.2s", letterSpacing: "0.05em",
            }}
            onMouseOver={e => e.target.style.borderColor = COLORS.accent}
            onMouseOut={e => e.target.style.borderColor = COLORS.cardBorder}
          >
            {showEarly ? "Hide Earlier Years ▲" : "Show Earlier Years ▼"}
          </button>
        </div>

        {/* Early timeline - collapsible */}
        <div style={{
          maxHeight: showEarly ? "2000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.5s ease-in-out",
          marginBottom: showEarly ? "1rem" : "0",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "120px", top: 0, bottom: 0, width: "1px", background: COLORS.cardBorder, opacity: 0.5 }} />
            {earlyTimeline.map((t, i) => (
              <div key={t.year + t.title} style={{
                display: "flex", gap: "2rem", marginBottom: "1.5rem",
                opacity: showEarly ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.06}s`,
              }}>
                <div style={{ width: "100px", textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontFamily: FONT, fontSize: "0.8rem", color: t.color, fontWeight: 600 }}>{t.year}</span>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "-1.35rem", top: "0.35rem", width: "6px", height: "6px", background: t.color, borderRadius: "50%", opacity: 0.7 }} />
                  <h4 style={{ fontFamily: FONT, fontSize: "0.9rem", color: COLORS.heading, fontWeight: 600, marginBottom: "0.15rem" }}>{t.title}</h4>
                  {t.org && <div style={{ fontFamily: FONT, fontSize: "0.75rem", color: t.color, marginBottom: "0.3rem" }}>{t.org}</div>}
                  <p style={{ fontFamily: FONT, fontSize: "0.8rem", color: COLORS.tabInactive, lineHeight: 1.5, maxWidth: "550px" }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderBottom: `1px solid ${COLORS.cardBorder}`, marginBottom: "1.5rem", opacity: 0.5 }} />
        </div>

        {/* Career timeline - always visible */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "120px", top: 0, bottom: 0, width: "1px", background: COLORS.cardBorder }} />
          {careerTimeline.map((t, i) => (
            <div key={t.year + t.title} style={{
              display: "flex", gap: "2rem", marginBottom: "2rem",
              opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-20px)",
              transition: `all 0.5s ease ${i * 0.08}s`,
            }}>
              <div style={{ width: "100px", textAlign: "right", flexShrink: 0 }}>
                <span style={{ fontFamily: FONT, fontSize: "0.85rem", color: t.color, fontWeight: 600 }}>{t.year}</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-1.35rem", top: "0.4rem", width: "8px", height: "8px", background: t.color, borderRadius: "50%" }} />
                <h4 style={{ fontFamily: FONT, fontSize: "1rem", color: COLORS.heading, fontWeight: 600, marginBottom: "0.2rem" }}>{t.title}</h4>
                {t.org && <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: t.color, marginBottom: "0.4rem" }}>{t.org}</div>}
                <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: COLORS.text, lineHeight: 1.6, maxWidth: "600px" }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {skills.map((s, i) => (
          <div key={s.category} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, padding: "1.5rem",
            opacity: inView ? 1 : 0, transition: `opacity 0.5s ease ${0.3 + i * 0.1}s`,
          }}>
            <h4 style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {s.category}
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {s.items.map(item => (
                <span key={item} style={{
                  fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text,
                  padding: "0.25rem 0.6rem", background: COLORS.inputBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// CONTACT / FOOTER
// ============================================================
const Contact = () => {
  const [ref, inView] = useInView(0.2);
  return (
    <section id="contact" ref={ref} style={{ padding: "6rem 2rem", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 600,
        color: COLORS.heading, marginBottom: "1.5rem",
      }}>
        {inView ? <TypewriterBlock text="Let's build something that matters." speed={30} /> : ""}
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "1rem", color: COLORS.text, marginBottom: "2rem", lineHeight: 1.7 }}>
        I'm an Industrial Engineer who scales operations. At Intel, I own strategic capacity planning
        across global semiconductor fabs — greenfield and brownfield buildouts, equipment forecasting,
        install sequencing, and capital planning for billions in production infrastructure. I'm curious
        about opportunities where I can bring that same rigor to operationally complex businesses — autonomous systems,
        defense tech, global fleet operations — anywhere the path from plan to full-scale execution is the bottleneck.
        Let's talk.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Email", value: "tnrayes@gmail.com", href: "mailto:tnrayes@gmail.com" },
          { label: "LinkedIn", value: "linkedin.com/in/trayes", href: "https://linkedin.com/in/trayes" },
          { label: "Phone", value: "480-234-9809", href: "tel:4802349809" },
        ].map(c => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: FONT, textDecoration: "none", color: COLORS.text,
            padding: "1rem 2rem", border: `1px solid ${COLORS.cardBorder}`,
            transition: "all 0.3s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.heading; e.currentTarget.style.color = COLORS.heading; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.cardBorder; e.currentTarget.style.color = COLORS.text; }}
          >
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: COLORS.tabInactive }}>{c.label}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{c.value}</span>
          </a>
        ))}
      </div>
      <div style={{ marginTop: "2.5rem" }}>
        <button
          onClick={() => {
            const vcf = [
              "BEGIN:VCARD",
              "VERSION:3.0",
              "N:Rayes;Timmy;;;",
              "FN:Timmy Rayes",
              "ORG:Intel Corporation",
              "TITLE:Strategic Capacity Planning Industrial Engineer",
              "EMAIL:tnrayes@gmail.com",
              "TEL:480-234-9809",
              "ADR;TYPE=WORK:;;Phoenix;AZ;;;US",
              "URL:https://timmyrayes.com",
              "URL:https://www.linkedin.com/in/trayes/",
              "END:VCARD",
            ].join("\r\n");
            const blob = new Blob([vcf], { type: "text/vcard" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "Timmy_Rayes.vcf";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
          style={{
            fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600,
            background: "transparent", color: COLORS.heading,
            border: `1px solid ${COLORS.heading}`, padding: "0.8rem 2rem",
            cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.3s",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.heading; e.currentTarget.style.color = "#000"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.heading; }}
        >
          <span style={{ fontSize: "1.1rem" }}>&#128197;</span> Save My Contact
        </button>
      </div>
      <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: `1px solid ${COLORS.cardBorder}` }}>
        <span style={{ fontFamily: FONT, fontSize: "0.7rem", color: COLORS.tabInactive, letterSpacing: "0.1em" }}>
          &copy; 2026 Timmy Rayes. Built with Claude Code.
        </span>
      </div>
    </section>
  );
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
const SliderInput = ({ label, value, min, max, step, onChange, suffix = "" }) => (
  <div style={{ marginBottom: "1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
      <span style={{ fontFamily: FONT, fontSize: "0.75rem", color: COLORS.text, letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: "0.85rem", color: COLORS.heading, fontWeight: 600 }}>
        {typeof value === "number" && value > 100 ? value.toLocaleString() : value}{suffix}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.heading, background: COLORS.inputBg, cursor: "pointer" }}
    />
  </div>
);

const MetricCard = ({ label, value, prefix = "", suffix = "", decimals = 0, highlight = false }) => (
  <div style={{
    background: COLORS.inputBg, border: `1px solid ${COLORS.cardBorder}`,
    padding: "1rem", textAlign: "center",
  }}>
    <div style={{
      fontFamily: FONT, fontSize: highlight ? "1.6rem" : "1.4rem", fontWeight: 600,
      color: highlight ? COLORS.accent : COLORS.heading, marginBottom: "0.3rem",
    }}>
      <AnimNum value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
    </div>
    <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: COLORS.tabInactive, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {label}
    </div>
  </div>
);

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [currentSection, setCurrentSection] = useState("hero");

  const onNavigate = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setCurrentSection(id);
  }, []);

  // Track current section on scroll
  useEffect(() => {
    const sections = ["hero", "bio", "case-study", "startup", "ripple", "resume", "contact"];
    const onScroll = () => {
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
          setCurrentSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text, minHeight: "100vh",
      fontFamily: FONT,
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #000; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        input[type="range"] { -webkit-appearance: none; height: 4px; border-radius: 2px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; }
        ::selection { background: rgba(59,130,246,0.3); }
      `}</style>

      <Nav currentSection={currentSection} onNavigate={onNavigate} />
      <Hero />
      <Bio />
      <CaseStudy />
      <StartupSection />
      <RippleSection />
      <ResumeSection />
      <Contact />
    </div>
  );
}
