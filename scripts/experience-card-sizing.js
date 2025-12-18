function equalizeCardHeights() {
const cards = document.querySelectorAll('.timeline-card');
let maxHeight = 0;

cards.forEach(card => card.style.height = 'auto');

cards.forEach(card => {
    maxHeight = Math.max(maxHeight, card.offsetHeight);
});

cards.forEach(card => card.style.height = `${maxHeight}px`);
}

window.addEventListener('load', equalizeCardHeights);
window.addEventListener('resize', equalizeCardHeights);