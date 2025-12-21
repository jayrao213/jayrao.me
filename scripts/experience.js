/* ====================================== */
/* EXPERIENCE PAGE SPECIFIC JAVASCRIPT    */
/* ====================================== */

/**
 * Equalizes the heights of all timeline cards on desktop.
 * On mobile (width < 768px), it resets them to auto to avoid dead space.
 */
function handleCardSizing() {
  const cards = document.querySelectorAll('.timeline-card');
  
  // 1. Reset heights first to get natural content flow
  cards.forEach(card => card.style.height = 'auto');

  // 2. Only equalize if we are on a desktop-sized screen
  if (window.innerWidth > 768) {
    let maxHeight = 0;

    // Find the tallest card
    cards.forEach(card => {
      maxHeight = Math.max(maxHeight, card.offsetHeight);
    });

    // Apply that height to all cards
    cards.forEach(card => {
      card.style.height = `${maxHeight}px`;
    });
  }
}

/**
 * Fun Mode Activation Callback
 * Handled via CSS, but kept for structural consistency.
 */
function onFunModeActivated() {
  // Experience page animations are handled via CSS classes
}

// Initialize and listen for window changes
window.addEventListener('load', handleCardSizing);
window.addEventListener('resize', handleCardSizing);