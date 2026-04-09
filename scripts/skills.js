document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = Array.from(track.children);
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;
    
    let singleSetWidth = 0;
    items.forEach(item => {
      const itemStyle = window.getComputedStyle(item);
      const marginLeft = parseFloat(itemStyle.marginLeft) || 0;
      const marginRight = parseFloat(itemStyle.marginRight) || 0;
      singleSetWidth += item.offsetWidth + gap + marginLeft + marginRight;
    });

    while (track.children.length < items.length * 4) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        attachListenerToItem(clone, track); 
        track.appendChild(clone);
      });
    }

    // Force browser to recalculate animation with new cloned width on Desktop
    track.style.animation = 'none';
    track.offsetHeight; // trigger reflow
    track.style.animation = '';

    // Mobile scroll logic: Debounced to let momentum scroll settle before snapping
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (carousel.scrollLeft >= singleSetWidth * 2) {
          carousel.style.scrollBehavior = 'auto'; 
          carousel.scrollLeft -= singleSetWidth;
        } 
        else if (carousel.scrollLeft < singleSetWidth) {
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft += singleSetWidth;
        }
      }, 150);
    });

    // Initialize scroll position for mobile so scrolling left is instantly seamless
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth <= 768) {
      setTimeout(() => {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = singleSetWidth;
      }, 100);
    }
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