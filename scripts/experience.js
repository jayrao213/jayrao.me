/* ====================================== */
/* EXPERIENCE PAGE SPECIFIC JAVASCRIPT    */
/* ====================================== */

/**
 * Initializes dropdown functionality for experience cards.
 * Clicking a card header toggles its expanded/collapsed state.
 */
function initializeDropdowns() {
  const cards = document.querySelectorAll('.timeline-card');
  
  cards.forEach(card => {
    const header = card.querySelector('.card-header');
    
    header.addEventListener('click', () => {
      // Toggle expanded class
      const isExpanded = card.classList.contains('expanded');
      
      // Toggle class itself
      card.classList.toggle('expanded');
      
      // Update ARIA for accessibility
      header.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

/**
 * Fun Mode Activation Callback
 * Handled via CSS, but kept for structural consistency.
 */
function onFunModeActivated() {
  // Experience page animations are handled via CSS classes
}

// Initialize on load
window.addEventListener('load', initializeDropdowns);