document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = Array.from(track.children);
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    
    let singleSetWidth = 0;
    items.forEach(item => {
      singleSetWidth += item.offsetWidth + gap;
    });

    while (track.children.length < items.length * 4) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        attachListenerToItem(clone, track); 
        track.appendChild(clone);
      });
    }

    carousel.addEventListener('scroll', () => {
      if (carousel.scrollLeft >= singleSetWidth) {
        carousel.scrollLeft -= singleSetWidth;
      } 
      else if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft += singleSetWidth;
      }
    });
  });

  function attachListenerToItem(item, track) {
    item.addEventListener('click', () => {
      const label = item.querySelector('.skill-label');
      if (label) {
        label.style.opacity = '1';
        label.style.transform = 'translateY(0)';
        setTimeout(() => {
          label.style.opacity = '0';
          label.style.transform = 'translateY(10px)';
        }, 2000);
      }
      track.style.animationPlayState = 'paused';
      setTimeout(() => {
        track.style.animationPlayState = 'running';
      }, 2000);
    });
  }

  const allItems = document.querySelectorAll('.skill-item');
  allItems.forEach(item => {
    const track = item.closest('.carousel-track');
    attachListenerToItem(item, track);
  });

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