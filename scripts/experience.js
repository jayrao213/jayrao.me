/* ====================================== */
/* EXPERIENCE PAGE SPECIFIC JAVASCRIPT    */
/* ====================================== */

// Equalize Card Heights
function equalizeCardHeights() {
  const cards = document.querySelectorAll('.timeline-card');
  let maxHeight = 0;

  // Reset heights first
  cards.forEach(card => card.style.height = 'auto');

  // Find max height
  cards.forEach(card => {
    maxHeight = Math.max(maxHeight, card.offsetHeight);
  });

  // Apply max height to all cards
  cards.forEach(card => card.style.height = `${maxHeight}px`);
}

// Fun Mode Activation Callback (optional - animations already in CSS)
function onFunModeActivated() {
  // Experience page animations are handled via CSS
  // This function exists for consistency with other pages
}

// Initialize
window.addEventListener('load', equalizeCardHeights);
window.addEventListener('resize', equalizeCardHeights);
