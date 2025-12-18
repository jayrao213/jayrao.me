/* ====================================== */
/* ABOUT PAGE SPECIFIC JAVASCRIPT         */
/* ====================================== */

// Profile Picture Explosion Animation
function explodeAndReassembleProfile() {
  const container = document.getElementById('explosionContainer');
  const profile = document.getElementById('jayProfile');
  if (!container || !profile) return;

  profile.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
  profile.style.transform = 'scale(0.1)';
  profile.style.opacity = '0';

  setTimeout(() => {
    const rows = 20, cols = 20;
    const tileWidth = 100 / cols;
    const tileHeight = 100 / rows;

    container.innerHTML = '';
    container.style.display = 'block';
    profile.style.visibility = 'hidden';

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        particle.style.left = `${randomX}%`;
        particle.style.top = `${randomY}%`;
        particle.style.backgroundPosition = `${-x * tileWidth}% ${-y * tileHeight}%`;

        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 300 + 150;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const rotate = Math.random() * 1440 - 720;
        const delay = Math.random() * 200;

        particle.animate([
          { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 0 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`, opacity: 1 },
          { transform: `translate(${dx * 1.1}px, ${dy * 1.1}px) rotate(${rotate * 1.2}deg)`, opacity: 0 }
        ], {
          duration: 700,
          delay: delay,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards'
        });

        container.appendChild(particle);
      }
    }

    setTimeout(() => {
      container.innerHTML = '';
      container.style.display = 'none';

      profile.style.transition = 'none';
      profile.style.opacity = '0';
      profile.style.transform = 'translateY(-250vh) scale(1)';
      profile.style.visibility = 'visible';

      void profile.offsetWidth;

      const anim = profile.animate([
        { transform: 'translateY(-250vh)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1, offset: 0.7 },
        { transform: 'translateY(-25px)', offset: 0.85 },
        { transform: 'translateY(0)', offset: 0.95 },
        { transform: 'translateY(-10px)', offset: 0.98 },
        { transform: 'translateY(0)', opacity: 1, offset: 1 }
      ], {
        duration: 1200,
        easing: 'ease-out',
        fill: 'forwards'
      });

      anim.onfinish = () => {
        profile.style.opacity = '1';
        profile.style.transform = 'translateY(0)';
        profile.style.visibility = 'visible';
      };
    }, 800);
  }, 400);
}

// Fun Mode Activation Callback
function onFunModeActivated() {
  explodeAndReassembleProfile();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  const isFun = document.body.classList.contains('fun-mode');
  
  if (isFun) {
    setTimeout(() => {
      explodeAndReassembleProfile();
    }, 100);
  }
});
