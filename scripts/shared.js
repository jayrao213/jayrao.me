/* ====================================== */
/* SHARED JAVASCRIPT FOR ALL PAGES        */
/* ====================================== */

// Text Scramble Animation for H1
function scrambleText(el) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const original = el.dataset.original;
  if (!original) return;

  const chars = original.split('');
  const spans = chars.map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : charset[Math.floor(Math.random() * charset.length)];
    return span;
  });

  el.textContent = '';
  spans.forEach(span => el.appendChild(span));

  const duration = 2000;
  let start = null;

  function animate(time) {
    if (!start) start = time;
    const progress = time - start;
    const percent = Math.min(progress / duration, 1);

    spans.forEach((span, i) => {
      if (chars[i] !== ' ') {
        const revealThreshold = i / chars.length;
        span.textContent = percent >= revealThreshold ? chars[i] : charset[Math.floor(Math.random() * charset.length)];
      }
    });

    if (percent < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Animate H1 with Scramble Effect
function animateH1() {
  const h1 = document.querySelector('h1');
  if (!h1) return;

  h1.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  if (document.body.classList.contains('fun-mode')) {
    h1.style.opacity = '0';
    h1.style.transform = 'translateY(20px)';
    setTimeout(() => {
      h1.style.opacity = '1';
      h1.style.transform = 'translateY(0)';
      scrambleText(h1);
    }, 300);
  } else {
    h1.textContent = h1.dataset.original;
    h1.style.opacity = '1';
    h1.style.transform = 'none';
  }
}

// Reset Animations
function resetAnimations() {
  document.querySelectorAll('.left-icons a img, .emoji-toggle').forEach(el => {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  });
}

// Hamburger Menu Toggle
function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const menuOverlay = document.getElementById('menuOverlay');
  const body = document.body;

  if (!hamburger || !mobileNav || !menuOverlay) return;

  function toggleMenu() {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);
  menuOverlay.addEventListener('click', toggleMenu);

  const mobileNavLinks = mobileNav.querySelectorAll('a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('active')) toggleMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
      toggleMenu();
    }
  });
}

// Fun Mode Toggle
function setupFunModeToggle() {
  const toggle = document.getElementById('funToggle');
  const body = document.body;

  if (!toggle) return;

  const savedMode = localStorage.getItem('funMode');
  const isFun = savedMode === 'true';

  body.classList.toggle('fun-mode', isFun);
  toggle.textContent = isFun ? '😎' : '😈';

  if (isFun) {
    animateH1();
  }

  toggle.addEventListener('click', () => {
    const isNowFun = body.classList.toggle('fun-mode');
    localStorage.setItem('funMode', isNowFun);
    toggle.textContent = isNowFun ? '😎' : '😈';
    resetAnimations();
    animateH1();

    // Trigger page-specific fun mode animations if they exist
    if (isNowFun && typeof onFunModeActivated === 'function') {
      setTimeout(() => {
        onFunModeActivated();
      }, 100);
    }
  });
}

// Initialize on DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  if (h1) h1.dataset.original = h1.textContent.trim();

  setupHamburgerMenu();
  setupFunModeToggle();

  // Save fun mode on link click
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      localStorage.setItem('funMode', document.body.classList.contains('fun-mode'));
    });
  });
});