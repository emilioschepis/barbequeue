import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import "./styles.css";

const FEEDBACK_URL =
  import.meta.env.VITE_FEEDBACK_URL || "https://forms.gle/cyaSrZMk9PWd4WKm9";

const sections = ["hero", "problem", "reveal", "outcome", "cta"] as const;
const sectionLabels = ["Hero", "Problem", "Reveal", "Outcome", "Call to action"] as const;
const REVEAL_WHEEL_THRESHOLD = 280;
const REVEAL_WHEEL_LOCK_MS = 760;
const REVEAL_WHEEL_REST_MS = 220;

const contributions = [
  {
    text: "Keep raw repo files in the host's Codex workspace.",
    kind: "idea",
    x: 25,
    y: 31,
  },
  {
    text: "Share the decision, not the repository.",
    kind: "idea",
    x: 73,
    y: 29,
  },
  {
    text: "Which excerpts should participants see?",
    kind: "clarify",
    x: 29,
    y: 72,
  },
  {
    text: "Objection: raw files expose too much context.",
    kind: "object",
    x: 67,
    y: 72,
  },
] as const;

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [revealBeat, setRevealBeat] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeSectionRef = useRef(activeSection);
  const activeIdRef = useRef<(typeof sections)[number]>(sections[0]);
  const revealBeatRef = useRef(revealBeat);
  const wheelDeltaRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelUnlockRef = useRef<number | null>(null);
  const wheelRestRef = useRef<number | null>(null);
  const revealWheelIntent = useMotionValue(0);
  const revealWheelProgress = useSpring(revealWheelIntent, {
    stiffness: 160,
    damping: 28,
    mass: 0.7,
  });

  const activeId = sections[activeSection];

  useEffect(() => {
    activeSectionRef.current = activeSection;
    activeIdRef.current = activeId;
    revealBeatRef.current = revealBeat;
    if (activeId !== "reveal") {
      wheelDeltaRef.current = 0;
      revealWheelIntent.set(0);
    }
  }, [activeId, activeSection, revealBeat, revealWheelIntent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const index = sections.indexOf(visible.target.id as (typeof sections)[number]);
        if (index >= 0) setActiveSection(index);
      },
      { threshold: [0.52, 0.72] },
    );

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowRight", "PageDown", " ", "ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        return;
      }

      event.preventDefault();

      const forward = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key);
      if (forward) {
        if (activeId === "reveal" && revealBeat < 3) {
          revealWheelIntent.set(0);
          setRevealBeat((beat) => Math.min(3, beat + 1));
          return;
        }
        goToSection(Math.min(sections.length - 1, activeSection + 1));
        return;
      }

      if (activeId === "reveal" && revealBeat > 0) {
        revealWheelIntent.set(0);
        setRevealBeat((beat) => Math.max(0, beat - 1));
        return;
      }
      goToSection(Math.max(0, activeSection - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, activeSection, revealBeat]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (activeIdRef.current !== "reveal") return;
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      event.preventDefault();

      if (wheelLockedRef.current) {
        wheelDeltaRef.current = 0;
        revealWheelIntent.set(0);
        return;
      }

      wheelDeltaRef.current = Math.max(
        -REVEAL_WHEEL_THRESHOLD,
        Math.min(REVEAL_WHEEL_THRESHOLD, wheelDeltaRef.current + event.deltaY),
      );
      revealWheelIntent.set(Math.min(1, Math.abs(wheelDeltaRef.current) / REVEAL_WHEEL_THRESHOLD));

      if (wheelRestRef.current) window.clearTimeout(wheelRestRef.current);
      wheelRestRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
        revealWheelIntent.set(0);
      }, REVEAL_WHEEL_REST_MS);

      if (Math.abs(wheelDeltaRef.current) < REVEAL_WHEEL_THRESHOLD) return;

      const forward = wheelDeltaRef.current > 0;
      wheelDeltaRef.current = 0;
      wheelLockedRef.current = true;
      revealWheelIntent.set(1);

      if (wheelUnlockRef.current) window.clearTimeout(wheelUnlockRef.current);
      if (wheelRestRef.current) window.clearTimeout(wheelRestRef.current);
      wheelRestRef.current = window.setTimeout(() => {
        revealWheelIntent.set(0);
      }, 140);
      wheelUnlockRef.current = window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, REVEAL_WHEEL_LOCK_MS);

      if (forward) {
        if (revealBeatRef.current < 3) {
          const nextBeat = revealBeatRef.current + 1;
          revealBeatRef.current = nextBeat;
          setRevealBeat(nextBeat);
          return;
        }
        goToSection(Math.min(sections.length - 1, activeSectionRef.current + 1));
        return;
      }

      if (revealBeatRef.current > 0) {
        const nextBeat = revealBeatRef.current - 1;
        revealBeatRef.current = nextBeat;
        setRevealBeat(nextBeat);
        return;
      }
      goToSection(Math.max(0, activeSectionRef.current - 1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (wheelUnlockRef.current) window.clearTimeout(wheelUnlockRef.current);
      if (wheelRestRef.current) window.clearTimeout(wheelRestRef.current);
    };
  }, [revealWheelIntent]);

  function goToSection(index: number) {
    const next = sectionRefs.current[index];
    if (!next) return;
    window.scrollTo({ top: next.offsetTop, behavior: "smooth" });
  }

  const progressLabel = useMemo(
    () => `${activeSection + 1}${activeId === "reveal" ? `.${revealBeat + 1}` : ""}/${sections.length}`,
    [activeId, activeSection, revealBeat],
  );

  return (
    <main className="deck-shell">
      <StageRail
        activeSection={activeSection}
        progressLabel={progressLabel}
        onJump={goToSection}
      />

      <section
        id="hero"
        ref={(node) => {
          sectionRefs.current[0] = node;
        }}
        className="section hero-section"
      >
        <div className="hero-masthead">
          <img src="/brand/barbequeue-logo.svg" alt="Barbequeue" className="wordmark" />
        </div>
        <HeroHeatLens />
        <div className="hero-copy">
          <h1>Nobody grills alone.</h1>
          <p>
            One host brings a plan. The team pressure-tests it. Barbequeue
            turns the heat into an accepted outcome.
          </p>
        </div>
        <div className="next-peek" aria-hidden="true">
          <span>Welcome to your digital campfire</span>
        </div>
      </section>

      <section
        id="problem"
        ref={(node) => {
          sectionRefs.current[1] = node;
        }}
        className="section problem-section"
      >
        <div className="solo-prompt" aria-label="Single-player AI prompt">
          <span className="prompt-cursor" />
          <span>AI can sharpen the plan. It cannot align the team alone.</span>
        </div>
        <p className="problem-line">
          The agreement still happens later, somewhere else, and off the record.
        </p>
      </section>

      <section
        id="reveal"
        ref={(node) => {
          sectionRefs.current[2] = node;
        }}
        className="section reveal-section"
      >
        <div className="reveal-copy">
          <h2>Many human inputs. One shared decision.</h2>
          <p>
            Step through the room forming, the question landing, the team contributing,
            and one answer candidate resolving the session.
          </p>
        </div>

        <RevealStage beat={revealBeat} progress={revealWheelProgress} />

        <div className="beat-controls" aria-label="Reveal beat controls">
          {["Join", "Ask", "Contribute", "Resolve"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === revealBeat ? "active" : ""}
              onClick={() => {
                wheelDeltaRef.current = 0;
                revealWheelIntent.set(0);
                setRevealBeat(index);
              }}
              aria-pressed={index === revealBeat}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section
        id="outcome"
        ref={(node) => {
          sectionRefs.current[3] = node;
        }}
        className="section outcome-section"
      >
        <div className="outcome-head">
          <h2>A sharper plan. A team that agrees on it.</h2>
        </div>
        <div className="outcome-band">
          <div className="doc-change">
            <span>Documentation Change</span>
            <strong>Host-reviewed, repo-ready summary</strong>
            <p>
              Shared context and accepted outcomes become a clean documentation change.
              Raw repository files stay in the host's environment.
            </p>
          </div>
          <div className="session-record">
            <span>Session Record</span>
            <div className="record-row accepted">
              <b>Accepted</b>
              <p>Use hosted participant rooms.</p>
            </div>
            <div className="record-row dismissed">
              <b>Dismissed objection</b>
              <p>Repository files stay local to the host.</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="cta"
        ref={(node) => {
          sectionRefs.current[4] = node;
        }}
        className="section cta-section"
      >
        <div className="cta-ember-field" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="cta-lockup">
          <div className="cta-copy">
            <span className="cta-kicker">Hackathon feedback</span>
            <h2>Grill the plan. Leave with the record.</h2>
            <p>
              Run a focused grill with your team, resolve objections, and leave with
              a host-reviewed documentation change.
            </p>
            <div className="cta-actions">
              <a className="primary-action" href={FEEDBACK_URL}>
                Send feedback after the session
              </a>
            </div>
          </div>

          <div className="qr-block">
            <span>Scan after the pitch</span>
            <QRCodeSVG
              value={FEEDBACK_URL}
              title="QR code for the Barbequeue feedback form"
              size={178}
              bgColor="transparent"
              fgColor="#f4f0e8"
              level="M"
              marginSize={2}
            />
            <b>{shortUrl(FEEDBACK_URL)}</b>
          </div>
        </div>
      </section>
    </main>
  );
}

function StageRail({
  activeSection,
  progressLabel,
  onJump,
}: {
  activeSection: number;
  progressLabel: string;
  onJump: (index: number) => void;
}) {
  return (
    <nav className="stage-rail" aria-label="Pitch sections">
      <span className="stage-progress">{progressLabel}</span>
      <div>
        {sections.map((section, index) => (
          <button
            key={section}
            type="button"
            className={index === activeSection ? "active" : ""}
            onClick={() => onJump(index)}
            aria-label={`Go to ${sectionLabels[index]}`}
          />
        ))}
      </div>
    </nav>
  );
}

function HeroHeatLens() {
  return (
    <div className="hero-heat-lens" aria-hidden="true">
      <div className="lens-core" />
      <div className="hero-orbit-marks">
        <span className="circle" />
        <span className="square" />
        <span className="circle" />
        <span className="square" />
        <span className="circle" />
      </div>
    </div>
  );
}

function RevealStage({ beat, progress }: { beat: number; progress: MotionValue<number> }) {
  const stageStyle = {
    "--scroll-progress": progress,
  } as MotionStyle;

  return (
    <motion.div
      className={`reveal-stage beat-${beat}`}
      style={stageStyle}
      aria-label="Animated consensus workflow"
    >
      <motion.div className="stage-scroll-charge" style={{ scaleX: progress }} aria-hidden="true" />

      <div className="reveal-abstract-field" aria-hidden="true">
        <span className="field-core" />
        <span className="field-ring ring-one" />
        <span className="field-ring ring-two" />
        <span className="field-ember ember-one" />
        <span className="field-ember ember-two" />
        <span className="field-ember ember-three" />
      </div>

      <div className="room-marks" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span key={index} />
        ))}
      </div>

      <div className="question-frame">
        <span>Grilling Question</span>
        <strong>What should participants see without opening the repository?</strong>
      </div>

      <div className="contribution-layer">
        {contributions.map((contribution, index) => (
          <p
            key={contribution.text}
            className={`contribution ${contribution.kind}`}
            style={{
              left: `${contribution.x}%`,
              top: `${contribution.y}%`,
              transitionDelay: `${index * 110}ms`,
            }}
          >
            {contribution.text}
          </p>
        ))}
      </div>

      <div className="answer-candidate">
        <span>Answer Candidate</span>
        <strong>Keep raw repository files local. Share only host-approved context.</strong>
      </div>

      <div className="consensus-badge">Session Consensus</div>
    </motion.div>
  );
}

function shortUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.host + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
