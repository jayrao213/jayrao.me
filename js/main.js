// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

const toggleBtn = document.getElementById("modeToggle");
const loopImgs = document.querySelectorAll(".loop");

const isFunMode = localStorage.getItem('funMode') === 'true';
document.body.classList.toggle("fun-mode", isFunMode);
toggleBtn.innerHTML = isFunMode
  ? '<span class="mode-text">😎Pro😎</span>'
  : '<span class="mode-text">😈Fun😈</span>';

if (isFunMode) {
  toggleBtn.classList.remove('show');
  setTimeout(() => {
    toggleBtn.classList.add('show');
  }, 4000);
} else {
  toggleBtn.classList.add('show');
}

loopImgs.forEach(img => {
  const src = isFunMode ? img.dataset.fun : img.dataset.serious;
  if (src) {
    img.style.display = "";
    img.src = src;
  } else {
    img.style.display = "none";
  }
});

toggleBtn.addEventListener("click", () => {
  const isFunNow = !document.body.classList.contains("fun-mode");

  if (isFunNow) {
    toggleBtn.classList.remove('show');
    setTimeout(() => {
      toggleBtn.classList.add('show');
    }, 4000);
  } else {
    toggleBtn.classList.add('show');
  }

  document.body.classList.toggle("fun-mode", isFunNow);
  localStorage.setItem("funMode", isFunNow);
  toggleBtn.innerHTML = isFunNow
    ? '<span class="mode-text">😎Pro😎</span>'
    : '<span class="mode-text">😈Fun😈</span>';

  loopImgs.forEach(img => {
    img.style.display = "none";
    img.src = '';
  });

  requestAnimationFrame(() => {
    loopImgs.forEach(img => {
      const src = isFunNow ? img.dataset.fun : img.dataset.serious;
      if (src) {
        img.src = src;
        img.style.display = "";
      }
    });
  });
});

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    localStorage.setItem('funMode', document.body.classList.contains('fun-mode'));
  });
});

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (toggleBtn && !document.body.classList.contains("fun-mode")) {
      toggleBtn.classList.add("popout");
      toggleBtn.addEventListener("animationend", () => {
        toggleBtn.classList.remove("popout");
      }, { once: true });
    }
  }, 1000);
});