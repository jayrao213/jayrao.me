/* ====================================== */
/* ABOUT PAGE SPECIFIC JAVASCRIPT         */
/* ====================================== */

function anim(el, keyframes, options) {
  return new Promise(resolve => {
    const a = el.animate(keyframes, { fill: 'forwards', ...options });
    a.onfinish = resolve;
  });
}

// ─── SHARD GENERATOR ──────────────────────────────────────────────────────────
// 12×12 grid = 144 shards, each a random irregular polygon clipped from the image
function generateShards() {
  const ROWS = 12, COLS = 12;
  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;
  const shards = [];

  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      // Center roams anywhere across the full cell — breaks up grid regularity
      const cx = gx * cellW + cellW * Math.random();
      const cy = gy * cellH + cellH * Math.random();

      const numVerts = 4 + Math.floor(Math.random() * 5); // 4–8 — more variety
      const rx = cellW * (0.4 + Math.random() * 0.95);    // much wider size range
      const ry = cellH * (0.4 + Math.random() * 0.95);

      const verts = [];
      for (let i = 0; i < numVerts; i++) {
        const base   = (i / numVerts) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * (Math.PI * 2 / numVerts) * 0.72; // more angular chaos
        const r      = 0.38 + Math.random() * 0.78;
        const px     = cx + Math.cos(base + jitter) * rx * r;
        const py     = cy + Math.sin(base + jitter) * ry * r;
        verts.push(`${Math.max(-6, Math.min(106, px)).toFixed(1)}% ${Math.max(-6, Math.min(106, py)).toFixed(1)}%`);
      }

      shards.push({ cx, cy, clipPath: `polygon(${verts.join(', ')})` });
    }
  }
  return shards;
}

// ─── EXPLOSION ────────────────────────────────────────────────────────────────
function buildExplosion(container) {
  const shards = generateShards();

  shards.forEach(({ cx, cy, clipPath }) => {
    const p = document.createElement('div');
    p.className = 'particle';

    p.style.width              = '100%';
    p.style.height             = '100%';
    p.style.left               = '0';
    p.style.top                = '0';
    p.style.backgroundSize     = '100% 100%';
    p.style.backgroundPosition = '0 0';
    p.style.clipPath           = clipPath;

    // Radially outward from centre (50%, 50%)
    const dx    = cx - 50;
    const dy    = cy - 50;
    const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.55;
    const speed = 90 + dist * 2.8 + Math.random() * 80;
    const tx    = Math.cos(angle) * speed;
    const ty    = Math.sin(angle) * speed;
    const rot   = (Math.random() - 0.5) * 70;
    const delay = dist * 1.2 + Math.random() * 30;
    const dur   = 480 + Math.random() * 160;

    p.animate([
      { transform: 'translate(0,0) rotate(0deg)',                                  opacity: 1, offset: 0    },
      { transform: `translate(${tx*.5}px,${ty*.5}px) rotate(${rot*.45}deg)`,      opacity: 1, offset: 0.35 },
      { transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`,                opacity: 0, offset: 1    },
    ], { duration: dur, delay, easing: 'cubic-bezier(0.15, 0, 0.45, 1)', fill: 'forwards' });

    container.appendChild(p);
  });
}

// ─── DROP + BOUNCE ────────────────────────────────────────────────────────────
async function dropAndBounce(profile) {
  profile.style.transition      = 'none';
  profile.style.opacity         = '0';
  profile.style.transform       = 'translateY(-300vh)';
  profile.style.transformOrigin = 'center bottom'; // squash anchors to ground
  profile.style.visibility      = 'visible';
  void profile.offsetWidth;

  const RISE   = 'cubic-bezier(0.15, 0.85, 0.45, 1)';
  const FALL   = 'cubic-bezier(0.55, 0, 0.85, 0.2)';
  // Slight overshoot on recovery → subtle springiness
  const SPRING = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

  // ── Fall from sky ──
  await anim(profile, [
    { transform: 'translateY(-300vh)', opacity: 0               },
    { transform: 'translateY(-294vh)', opacity: 1, offset: 0.02 },
    { transform: 'translateY(0)',      opacity: 1               },
  ], { duration: 520, easing: 'cubic-bezier(0.5, 0, 1, 1)' });

  // ── Bounce 1: 48px, 6% squash on landing ──
  await anim(profile, [
    { transform: 'translateY(0) scale(1)' },
    { transform: 'translateY(-48px) scale(1)' },
  ], { duration: 145, easing: RISE });
  await anim(profile, [
    { transform: 'translateY(-48px) scale(1)' },
    { transform: 'translateY(0) scaleX(1.06) scaleY(0.94)' },
  ], { duration: 170, easing: FALL });
  await anim(profile, [
    { transform: 'translateY(0) scaleX(1.06) scaleY(0.94)' },
    { transform: 'translateY(0) scale(1)' },
  ], { duration: 60, easing: SPRING });

  // ── Bounce 2: 20px, 4% squash, settles ──
  await anim(profile, [
    { transform: 'translateY(0) scale(1)' },
    { transform: 'translateY(-20px) scale(1)' },
  ], { duration: 105, easing: RISE });
  await anim(profile, [
    { transform: 'translateY(-20px) scale(1)' },
    { transform: 'translateY(0) scaleX(1.04) scaleY(0.96)' },
  ], { duration: 130, easing: FALL });
  await anim(profile, [
    { transform: 'translateY(0) scaleX(1.04) scaleY(0.96)' },
    { transform: 'translateY(0) scale(1)' },
  ], { duration: 50, easing: SPRING });

  profile.style.opacity         = '1';
  profile.style.transform       = '';
  profile.style.transformOrigin = '';
  profile.style.transition      = '';
}

// ─── MAIN SEQUENCE ────────────────────────────────────────────────────────────
function explodeAndReassembleProfile() {
  const container = document.getElementById('explosionContainer');
  const profile   = document.getElementById('jayProfile');
  if (!container || !profile) return;

  profile.style.transition = 'none';

  const shudder = profile.animate([
    { transform: 'translate(0,0) rotate(0deg) scale(1)'           },
    { transform: 'translate(-4px,-2px) rotate(-1deg) scale(1.02)' },
    { transform: 'translate(5px, 2px) rotate(1deg)  scale(0.98)'  },
    { transform: 'translate(-3px, 3px) rotate(-1deg) scale(1.01)' },
    { transform: 'translate(4px,-3px) rotate(0.5deg) scale(1)'    },
    { transform: 'translate(0,0) rotate(0deg) scale(1)'           },
  ], { duration: 260, easing: 'ease-in-out', fill: 'forwards' });

  shudder.onfinish = () => {
    profile.animate([
      { transform: 'scale(1)',     opacity: 1              },
      { transform: 'scale(1.07)', opacity: 1, offset: 0.3 },
      { transform: 'scale(0)',    opacity: 0               },
    ], { duration: 190, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
      profile.style.visibility = 'hidden';

      container.innerHTML      = '';
      container.style.clipPath = 'circle(50% at 50% 50%)';
      container.style.display  = 'block';
      buildExplosion(container);

      // One frame later: remove the clip so particles can fly outside the circle
      requestAnimationFrame(() => requestAnimationFrame(() => {
        container.style.clipPath = '';
      }));

      setTimeout(() => {
        container.innerHTML     = '';
        container.style.display = 'none';
        dropAndBounce(profile);
      }, 650);
    };
  };
}

window.onFunModeActivated = function () {
  explodeAndReassembleProfile();
};

window.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('fun-mode')) {
    setTimeout(explodeAndReassembleProfile, 120);
  }
});
