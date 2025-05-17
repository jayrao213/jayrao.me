const toggleBtn = document.getElementById("modeToggle");
const loopImgs = document.querySelectorAll(".loop");

const preloadAndDisplayGIFs = (srcs, callback) => {
  let loaded = 0;
  srcs.forEach((src) => {
    const img = new Image();
    img.onload = () => {
      loaded++;
      if (loaded === srcs.length) callback();
    };
    img.src = `${src}?t=${Date.now()}`;
  });
};

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

if (isFunMode) {
  loopImgs.forEach(img => {
    const funSrc = img.dataset.fun;
    if (funSrc) {
      img.style.display = "";
      img.src = `${funSrc}?t=${Date.now()}`;
    } else {
      img.style.display = "none";
    }
  });
} else {
  const seriousGIFs = [...loopImgs].filter(img => img.dataset.serious).map(img => img.dataset.serious);
  preloadAndDisplayGIFs(seriousGIFs, () => {
    loopImgs.forEach(img => {
      const seriousSrc = img.dataset.serious;
      if (seriousSrc) {
        img.style.display = "";
        img.src = `${seriousSrc}?t=${Date.now()}`;
      } else {
        img.style.display = "none";
      }
    });
  });
}

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

  if (isFunNow) {
    loopImgs.forEach(img => {
      const funSrc = img.dataset.fun;
      if (funSrc) {
        img.style.display = "";
        img.src = `${funSrc}?t=${Date.now()}`;
      } else {
        img.style.display = "none";
      }
    });
  } else {
    loopImgs.forEach(img => {
      img.style.display = "none";
    });
    const seriousGIFs = [...loopImgs].filter(img => img.dataset.serious).map(img => img.dataset.serious);
    preloadAndDisplayGIFs(seriousGIFs, () => {
      loopImgs.forEach(img => {
        const seriousSrc = img.dataset.serious;
        if (seriousSrc) {
          img.style.display = "";
          img.src = `${seriousSrc}?t=${Date.now()}`;
        }
      });
    });
  }
});

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
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