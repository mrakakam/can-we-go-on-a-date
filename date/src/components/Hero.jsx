import { useState, useEffect, useRef } from "react";

// ── Confetti Burst ────────────────────────────────────────────────────────────
const COLORS = ["#ff6b9d","#ff9eb5","#ffd6e0","#c9b8ff","#b8d4ff","#ffeb99","#b8f5b8","#ff8c69"];

function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -10 - Math.random() * 300,
        w: 6 + Math.random() * 10,
        h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        vx: (Math.random() - 0.5) * 3.5,
        vy: 2 + Math.random() * 4,
        opacity: 1,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.06;
        if (p.y > canvas.height) p.opacity -= 0.025;
      });
      particles = particles.filter((p) => p.opacity > 0);
      if (particles.length > 0) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}
    />
  );
}

// ── Floating Hearts Background ────────────────────────────────────────────────
function FloatingHearts() {
  const hearts = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 3 + Math.random() * 94,
    size: 14 + Math.random() * 22,
    delay: Math.random() * 10,
    duration: 9 + Math.random() * 9,
    opacity: 0.1 + Math.random() * 0.15,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {hearts.map((h) => (
        <div key={h.id} style={{
          position: "absolute", bottom: -40, left: `${h.left}%`,
          fontSize: h.size, opacity: h.opacity,
          animation: `floatHeart ${h.duration}s ${h.delay}s linear infinite`,
          color: "#ff6b9d",
        }}>♥</div>
      ))}
    </div>
  );
}

// ── Envelope SVG with real flap open ─────────────────────────────────────────
function Envelope({ phase, onClick }) {
  const isClosed = phase === "idle";
  const flapDeg  = isClosed ? 0 : -175;
  const letterTY = (phase === "body" || phase === "done") ? -32 : 2;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: isClosed ? "pointer" : "default",
        width: "min(280px, 75vw)",
        filter: "drop-shadow(0 10px 30px rgba(255,100,150,0.28))",
        transition: "transform 0.2s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => isClosed && (e.currentTarget.style.transform = "scale(1.06) rotate(-1deg)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg viewBox="0 0 280 195" xmlns="http://www.w3.org/2000/svg" overflow="visible">

        {/* envelope body */}
        <rect x="4" y="44" width="272" height="147" rx="11" fill="#ffd6e7" stroke="#ffb3cc" strokeWidth="1.5"/>

        {/* letter rising out */}
        <g style={{ transform: `translateY(${letterTY}px)`, transition: "transform 0.55s ease" }}>
          <rect x="42" y="30" width="196" height="108" rx="7" fill="#fff9fb" stroke="#ffc8d8" strokeWidth="1"/>
          <line x1="66" y1="58"  x2="214" y2="58"  stroke="#ffb3cc" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="66" y1="73"  x2="214" y2="73"  stroke="#ffb3cc" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="66" y1="88"  x2="170" y2="88"  stroke="#ffb3cc" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M140 112 C140 112 126 100 126 92 C126 85 133 80 140 88 C147 80 154 85 154 92 C154 100 140 112 140 112Z" fill="#ff6b9d"/>
        </g>

        {/* side folds */}
        <polygon points="4,191 96,128 4,44"   fill="#ffc0d4"/>
        <polygon points="276,191 184,128 276,44" fill="#ffc0d4"/>
        {/* bottom triangle */}
        <polygon points="4,191 140,120 276,191" fill="#ffccd8"/>

        {/* flap — rotates open around hinge at y=44 */}
        <g style={{
          transformOrigin: "140px 44px",
          transform: `rotateX(${flapDeg}deg)`,
          transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
          transformBox: "fill-box",
        }}>
          <polygon points="4,44 140,122 276,44" fill="#ffb3cc" stroke="#ffa4bc" strokeWidth="1.2"/>
          {isClosed && (
            <path d="M140 94 C140 94 128 83 128 75 C128 68 134 63 140 70 C146 63 152 68 152 75 C152 83 140 94 140 94Z" fill="#ff6b9d"/>
          )}
        </g>
      </svg>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const [stage, setStage] = useState(0);
  // 0=envelope  1=question  2=celebrate

  const [envPhase, setEnvPhase] = useState("idle"); // idle→flap→body→done
  const [noCount, setNoCount]   = useState(0);
  const [confetti, setConfetti] = useState(false);

  const openEnvelope = () => {
    if (envPhase !== "idle") return;
    setEnvPhase("flap");
    setTimeout(() => setEnvPhase("body"), 720);
    setTimeout(() => setEnvPhase("done"), 1350);
    setTimeout(() => setStage(1), 1800);
  };

  const handleYes = () => { setConfetti(true); setStage(2); };
  const handleNo  = () => setNoCount((n) => n + 1);

  const yesScale = 1 + noCount * 0.22;
  const noScale  = Math.max(0.35, 1 - noCount * 0.13);

  const noLabels = [
    "No 😶","Nah","Never 😤","Absolutely not","Hard pass 🙅",
    "Not a chance","...really?? 🥺","c'mon...","ok fine, still no 😂",
  ];
  const noLabel = noLabels[Math.min(noCount, noLabels.length - 1)];

  const reset = () => {
    setStage(0); setEnvPhase("idle"); setNoCount(0); setConfetti(false);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fff0f5 0%,#ffe4f0 55%,#ffd6e8 100%)",
      fontFamily: "'Georgia',serif",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes zoomIn  { from{opacity:0;transform:scale(0.55)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse   { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes bounce  { from{transform:translateY(0)} to{transform:translateY(-14px)} }
        @keyframes floatHeart {
          0%   { transform:translateY(0) scale(1);   opacity:var(--op); }
          100% { transform:translateY(-110vh) scale(0.4); opacity:0; }
        }
        @keyframes popIn { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        * { box-sizing:border-box; }
      `}</style>

      <FloatingHearts />
      {confetti && <Confetti />}

      {/* ── STAGE 0: Envelope ── */}
      {stage === 0 && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"1.2rem",animation:"fadeUp 0.7s ease",zIndex:1 }}>
          <p style={{ fontStyle:"italic",color:"#c0697a",fontSize:"clamp(0.92rem,2.5vw,1.1rem)",letterSpacing:"0.04em",margin:0 }}>
            Something for you... 💌
          </p>
          <Envelope phase={envPhase} onClick={openEnvelope} />
          {envPhase === "idle" && (
            <p style={{ fontSize:"0.72rem",color:"#e895a8",letterSpacing:"0.12em",textTransform:"uppercase",animation:"pulse 1.8s ease-in-out infinite",margin:0 }}>
              tap to open
            </p>
          )}
        </div>
      )}

      {/* ── STAGE 1: Question ── */}
      {stage === 1 && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"2rem",animation:"fadeUp 0.6s ease",textAlign:"center",maxWidth:480,zIndex:1 }}>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(1.9rem,6.5vw,2.9rem)",color:"#b83055",lineHeight:1.2,margin:0 }}>
            Can we go on a date? 🌹
          </h1>

          <div style={{ display:"flex",flexWrap:"wrap",gap:"1rem",justifyContent:"center",alignItems:"center" }}>
            {/* YES — grows */}
            <button
              onClick={handleYes}
              style={{
                padding:"0.78rem 2.4rem",
                background:"linear-gradient(135deg,#ff6b9d,#ff3f6c)",
                color:"#fff",
                border:"none",
                borderRadius:50,
                fontFamily:"'Playfair Display',Georgia,serif",
                fontStyle:"italic",
                fontSize:"clamp(1rem,3vw,1.18rem)",
                cursor:"pointer",
                boxShadow:"0 6px 22px rgba(255,60,100,0.42)",
                transform:`scale(${yesScale})`,
                transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                zIndex:2,
                position:"relative",
              }}
            >
              Yes! 💕
            </button>

            {/* NO — shrinks */}
            {noScale > 0.05 && (
              <button
                onClick={handleNo}
                style={{
                  padding:"0.65rem 1.6rem",
                  background:"transparent",
                  color:"#d07a90",
                  border:"1.5px solid #f0b8c8",
                  borderRadius:50,
                  fontFamily:"Georgia,serif",
                  fontSize:"0.9rem",
                  cursor:"pointer",
                  transform:`scale(${noScale})`,
                  opacity: noScale,
                  transition:"transform 0.3s ease, opacity 0.3s",
                }}
              >
                {noLabel}
              </button>
            )}
          </div>

          {noCount > 0 && (
            <p style={{ color:"#e895a8",fontStyle:"italic",fontSize:"clamp(0.82rem,2.5vw,0.9rem)",animation:"popIn 0.4s ease",margin:"-0.5rem 0 0" }}>
              {noCount >= 7
                ? "The No button is basically gone now 😂"
                : noCount >= 4
                ? "The yes button is taking over the screen 🥺"
                : noCount >= 2
                ? "Come on... you know you want to 🥹"
                : "Are you sure about that? 👀"}
            </p>
          )}

        </div>
      )}

      {/* ── STAGE 2: Celebration ── */}
      {stage === 2 && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"1.8rem",animation:"zoomIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",textAlign:"center",position:"relative",zIndex:1,maxWidth:440 }}>
          <div style={{ fontSize:"clamp(2.5rem,10vw,4.5rem)",animation:"bounce 0.55s ease infinite alternate" }}>🎉</div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(2.1rem,7.5vw,3.2rem)",color:"#c0394f",margin:0,lineHeight:1.1 }}>
            Yay!! I can't wait! 💖
          </h1>
          <p style={{ fontStyle:"italic",color:"#a04060",fontSize:"clamp(0.95rem,3vw,1.1rem)",margin:0 }}>
            Get ready for the best date ever ✨
          </p>
          <img
            src="https://media.giphy.com/media/3oEdvaqMOF3VpCtzuo/giphy.gif"
            alt="Curry shooting a 3"
            style={{ width:"min(300px,80vw)", borderRadius:12, boxShadow:"0 12px 40px rgba(200,80,120,0.28)" }}
          />
          <div style={{ fontSize:"clamp(2rem,8vw,3rem)", display:"flex", gap:"0.5rem", flexWrap:"wrap", justifyContent:"center", animation:"popIn 0.6s ease" }}>
            🌹💕🎊💖🌸🎉💗🌷💝
          </div>
          <button onClick={reset} style={{ background:"none",border:"1px solid #f0b8c8",color:"#d47a8f",padding:"0.4rem 1.2rem",borderRadius:20,cursor:"pointer",fontSize:"0.76rem",letterSpacing:"0.06em" }}>
            start over
          </button>
        </div>
      )}
    </div>
  );
}