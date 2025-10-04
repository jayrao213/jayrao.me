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

function resetAnimations() {
  document.querySelectorAll('.left-icons a img, .button li a, .emoji-toggle, .project-card').forEach(el => {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  });
}

function autoFlipCards() {
  document.querySelectorAll('.flip-container').forEach(container => {
    const flipper = container.querySelector('.flipper');

    flipper.style.transition = 'none';
    flipper.style.transform = 'rotateY(0deg)';
    flipper.style.zIndex = 1;

    void flipper.offsetHeight;
  
    flipper.style.transition = '';
    
    let angle = 0;
    let count = 0;
    const maxFlips = 4;

    container.dataset.autoFlipping = 'true';

    function flip() {
      angle -= 180;
      flipper.style.transform = `rotateY(${angle}deg)`;
      flipper.style.zIndex = (angle % 360 === 0) ? 1 : 2;
      count++;
      if (count < maxFlips) {
        setTimeout(flip, 500);
      } else {
        setTimeout(() => {
          container.dataset.autoFlipping = 'false';
          console.log('Auto-flipping completed for container'); 
        }, 500);
      }
    }

    setTimeout(flip, 50);
  });
}

function adjustProjectCardHeights() {
  document.querySelectorAll('.flip-container').forEach(container => {
    const back = container.querySelector('.back');
    const front = container.querySelector('.front');
    if (back && front) {
      const height = Math.max(back.scrollHeight, front.scrollHeight) + 20;
      container.style.height = `${height}px`;
      container.querySelector('.flipper').style.height = `${height}px`; 
      front.style.height = `${height}px`;
      back.style.height = `${height}px`;
    }
  });
}

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

function initializeFlipContainers() {
  document.querySelectorAll('.flip-container').forEach(container => {
    container.dataset.manualAngle = '0';
    container.dataset.autoFlipping = 'false';

    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    newContainer.addEventListener('click', function(e) {
      console.log('Card clicked, autoFlipping status:', this.dataset.autoFlipping);
      
      if (e.target.closest('a')) {
        console.log('Click on link detected - flip prevented');
        return;
      }
      
      if (this.dataset.autoFlipping === 'true') {
        console.log('Click ignored - auto-flipping in progress');
        return;
      }
      
      const flipper = this.querySelector('.flipper');
      if (!flipper) return;
   
      const currentTransform = flipper.style.transform;
      let currentAngle = 0;
      
      if (currentTransform && currentTransform.includes('rotateY(')) {
        const match = currentTransform.match(/rotateY\((-?\d+)deg\)/);
        if (match) {
          currentAngle = parseInt(match[1], 10);
        }
      }
      
      const newAngle = currentAngle + 180;
      flipper.style.transform = `rotateY(${newAngle}deg)`;
      this.dataset.manualAngle = newAngle;
      
      console.log('Card flipped to angle:', newAngle);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  if (h1) h1.dataset.original = h1.textContent.trim();

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const menuOverlay = document.getElementById('menuOverlay');
  const toggle = document.getElementById('funToggle');
  const body = document.body;

  const savedMode = localStorage.getItem('funMode');
  const isFun = savedMode === 'true';

  body.classList.toggle('fun-mode', isFun);
  if (toggle) toggle.textContent = isFun ? '😎' : '😈';

  if (isFun) {
    animateH1();
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isNowFun = body.classList.toggle('fun-mode');
      localStorage.setItem('funMode', isNowFun);
      toggle.textContent = isNowFun ? '😎' : '😈';
      resetAnimations();
      animateH1();

      if (isNowFun) {
        setTimeout(() => {
          autoFlipCards();
          explodeAndReassembleProfile();
          adjustProjectCardHeights();
        }, 100);
      } else {
        document.querySelectorAll('.flip-container').forEach(container => {
          container.dataset.autoFlipping = 'false';
        });
      }
    });
  }

  if (hamburger && mobileNav && menuOverlay) {
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

  initializeFlipContainers();

  document.querySelectorAll('.card[data-image]').forEach(card => {
    const img = card.getAttribute('data-image');
    card.style.backgroundImage = `url('${img}')`;
  });

  if (isFun) {
    setTimeout(() => {
      autoFlipCards();
      explodeAndReassembleProfile();
      adjustProjectCardHeights();
    }, 100);
  }
});

window.addEventListener('load', () => {
  adjustProjectCardHeights();
});

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    localStorage.setItem('funMode', document.body.classList.contains('fun-mode'));
  });
});