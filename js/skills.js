document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel-track');

  carousels.forEach(track => {
    const items = Array.from(track.children);
    let totalWidth = 0;

    items.forEach(item => {
      totalWidth += item.offsetWidth;
    });

    const parentWidth = track.parentElement.offsetWidth;

    while (totalWidth < parentWidth * 2) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
        totalWidth += item.offsetWidth;
      });
    }
  });

  function attachSkillListeners() {
    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const label = item.querySelector('.skill-label');
        if (label) {
          label.style.opacity = '1';
          label.style.transform = 'translateY(0)';
          setTimeout(() => {
            label.style.opacity = '0';
            label.style.transform = 'translateY(10px)';
          }, 2000);
        }

        const carousel = item.closest('.carousel');
        const track = carousel.querySelector('.carousel-track');

        // 🛠 NEW: Pause only temporarily
        track.style.animationPlayState = 'paused';
        setTimeout(() => {
          track.style.animationPlayState = 'running';
        }, 2000);
      });
    });
  }

  attachSkillListeners();

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    const carouselWrappers = document.querySelectorAll('.carousel');

    carouselWrappers.forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      carousel.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      });
      carousel.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      });
    });
  }
});