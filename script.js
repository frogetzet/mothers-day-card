/**
 * Скрипт сайта-открытки ко Дню матери
 * Чистый Vanilla JS без сторонних библиотек
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. ИНТЕРАКТИВНЫЙ КОНВЕРТ И ПЕРЕХОД К ПОЗДРАВЛЕНИЮ
     ========================================================================== */
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const envelopeCard = document.getElementById('envelopeCard');
  const waxSeal = document.getElementById('waxSeal');
  const scrollDownIndicator = document.getElementById('scrollDownIndicator');
  const mainGreeting = document.getElementById('mainGreeting');
  let isEnvelopeOpened = false;

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Активируем визуальное открытие клапана и подъем письма
    envelopeWrapper.classList.add('opened');

    // Тактильный отклик при открытии печати
    if (navigator.vibrate) {
      navigator.vibrate([30, 45, 30]);
    }

    // Запускаем падающие лепестки
    startPetalsAnimation();

    // Показываем индикатор скролла
    if (scrollDownIndicator) {
      scrollDownIndicator.classList.add('visible');
    }

    // Мягкий автоматический переход к главному экрану через 950ms
    setTimeout(() => {
      if (mainGreeting) {
        mainGreeting.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 950);
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', openEnvelope);
  }
  if (waxSeal) {
    waxSeal.addEventListener('click', openEnvelope);
  }
  if (envelopeCard) {
    envelopeCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }
  if (scrollDownIndicator) {
    scrollDownIndicator.addEventListener('click', () => {
      if (mainGreeting) {
        mainGreeting.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ==========================================================================
     2. АНИМАЦИЯ ПАДАЮЩИХ ЛЕПЕСТКОВ ТЮЛЬПАНОВ (CANVAS)
     ========================================================================== */
  const canvas = document.getElementById('petalsCanvas');
  let ctx = null;
  let petals = [];
  let animationFrameId = null;
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;

  // Яркие и нежные оттенки лепестков тюльпанов
  const petalColors = [
    'rgba(244, 63, 94, 0.65)',   // Сочный розовый
    'rgba(251, 113, 133, 0.60)', // Светящийся розовый
    'rgba(253, 164, 175, 0.55)', // Нежный румянец
    'rgba(56, 189, 248, 0.45)',  // Небесный блик
    'rgba(252, 211, 77, 0.40)'   // Золотистая искорка
  ];

  class Petal {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * canvasWidth;
      this.y = initial ? Math.random() * canvasHeight : -30;
      this.size = 11 + Math.random() * 13;
      this.speedY = 0.7 + Math.random() * 0.9;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.025;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.018 + Math.random() * 0.02;
      this.swayAmplitude = 0.9 + Math.random() * 1.3;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.aspectRatio = 0.55 + Math.random() * 0.35;
    }

    update() {
      this.sway += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.sway) * this.swayAmplitude;
      this.y += this.speedY;
      this.angle += this.angularSpeed;

      if (this.y > canvasHeight + 35 || this.x < -40 || this.x > canvasWidth + 40) {
        this.reset(false);
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);

      context.beginPath();
      context.moveTo(0, -this.size);
      context.bezierCurveTo(
        this.size * this.aspectRatio, -this.size * 0.4,
        this.size * this.aspectRatio, this.size * 0.6,
        0, this.size
      );
      context.bezierCurveTo(
        -this.size * this.aspectRatio, this.size * 0.6,
        -this.size * this.aspectRatio, -this.size * 0.4,
        0, -this.size
      );

      context.fillStyle = this.color;
      context.fill();
      context.restore();
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  function startPetalsAnimation() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.classList.add('active');

    const PETAL_COUNT = 18;
    petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(new Petal(true));
    }

    function renderLoop() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw(ctx);
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    }

    if (!animationFrameId) {
      renderLoop();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else if (isEnvelopeOpened && !animationFrameId && ctx) {
      function resumeLoop() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (let i = 0; i < petals.length; i++) {
          petals[i].update();
          petals[i].draw(ctx);
        }
        animationFrameId = requestAnimationFrame(resumeLoop);
      }
      resumeLoop();
    }
  });

  /* ==========================================================================
     3. БЛОК «10 ПРИЧИН, ПОЧЕМУ ТЫ ЛУЧШАЯ МАМА» (СТОПКА КАРТОЧЕК)
     ========================================================================== */
  const cards = Array.from(document.querySelectorAll('.deck-card'));
  const btnPrevReason = document.getElementById('btnPrevReason');
  const btnNextReason = document.getElementById('btnNextReason');
  const reasonsCounter = document.getElementById('reasonsCounter');
  const reasonsProgressBar = document.getElementById('reasonsProgressBar');
  const deckWrapper = document.querySelector('.deck-wrapper');

  let currentCardIndex = 0;
  const totalCards = cards.length;

  function updateDeckState(direction = 0) {
    cards.forEach((card, idx) => {
      card.classList.remove('active', 'next', 'next-2', 'hidden-back', 'swiped-left', 'swiped-right');

      if (idx === currentCardIndex) {
        card.classList.add('active');
      } else if (idx === currentCardIndex + 1) {
        card.classList.add('next');
      } else if (idx === currentCardIndex + 2) {
        card.classList.add('next-2');
      } else if (idx < currentCardIndex) {
        card.classList.add('swiped-left');
      } else {
        card.classList.add('hidden-back');
      }
    });

    if (reasonsCounter) {
      const currentNumberStr = (currentCardIndex + 1).toString().padStart(2, '0');
      const totalNumberStr = totalCards.toString().padStart(2, '0');
      reasonsCounter.textContent = `${currentNumberStr} / ${totalNumberStr}`;
    }

    if (reasonsProgressBar) {
      const percent = ((currentCardIndex + 1) / totalCards) * 100;
      reasonsProgressBar.style.width = `${percent}%`;
    }

    if (btnPrevReason) {
      btnPrevReason.disabled = currentCardIndex === 0;
    }

    if (btnNextReason) {
      if (currentCardIndex === totalCards - 1) {
        btnNextReason.querySelector('span').textContent = 'В начало ↺';
      } else {
        btnNextReason.querySelector('span').textContent = 'Дальше';
      }
    }
  }

  function nextReason() {
    if (currentCardIndex < totalCards - 1) {
      currentCardIndex++;
      updateDeckState(1);
    } else {
      currentCardIndex = 0;
      updateDeckState(1);
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function prevReason() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateDeckState(-1);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }

  if (btnNextReason) {
    btnNextReason.addEventListener('click', nextReason);
  }
  if (btnPrevReason) {
    btnPrevReason.addEventListener('click', prevReason);
  }

  if (deckWrapper) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    deckWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    deckWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const swipeThreshold = 45;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
          nextReason();
        } else {
          prevReason();
        }
      }
    }
  }

  updateDeckState(0);

  /* ==========================================================================
     4. ФОТОГАЛЕРЕЯ (16 ПОЛАРОИДОВ) И ИНТЕРАКТИВНЫЙ ЛАЙТБОКС С НАВИГАЦИЕЙ
     ========================================================================== */
  const polaroidCards = Array.from(document.querySelectorAll('.polaroid-card'));
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let activePhotoIndex = 0;
  const totalPhotos = polaroidCards.length;

  function showPhotoAt(index) {
    if (index < 0) index = totalPhotos - 1;
    if (index >= totalPhotos) index = 0;
    activePhotoIndex = index;

    const card = polaroidCards[activePhotoIndex];
    if (!card || !lightboxImg) return;

    const imgSrc = card.getAttribute('data-img');
    const caption = card.getAttribute('data-caption');

    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = caption || 'Фотография';
      if (lightboxCaption) {
        lightboxCaption.textContent = caption || '';
      }
      if (lightboxCounter) {
        const currentStr = (activePhotoIndex + 1).toString().padStart(2, '0');
        const totalStr = totalPhotos.toString().padStart(2, '0');
        lightboxCounter.textContent = `${currentStr} / ${totalStr}`;
      }
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
      };
      // На случай мгновенной загрузки из кэша
      if (lightboxImg.complete) {
        lightboxImg.style.opacity = '1';
      }
    }, 120);
  }

  function openLightbox(index) {
    if (!lightboxModal) return;
    showPhotoAt(index);
    lightboxModal.hidden = false;
    requestAnimationFrame(() => {
      lightboxModal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    setTimeout(() => {
      lightboxModal.hidden = true;
      if (lightboxImg) lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 320);
  }

  polaroidCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      openLightbox(idx);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showPhotoAt(activePhotoIndex - 1);
      if (navigator.vibrate) navigator.vibrate(15);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showPhotoAt(activePhotoIndex + 1);
      if (navigator.vibrate) navigator.vibrate(15);
    });
  }

  // Навигация с клавиатуры
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || lightboxModal.hidden) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPhotoAt(activePhotoIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showPhotoAt(activePhotoIndex + 1);
    }
  });

  // Свайпы внутри самого лайтбокса
  if (lightboxModal) {
    let lbTouchStartX = 0;
    let lbTouchEndX = 0;

    lightboxModal.addEventListener('touchstart', (e) => {
      lbTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      lbTouchEndX = e.changedTouches[0].clientX;
      const diffX = lbTouchEndX - lbTouchStartX;
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) {
          showPhotoAt(activePhotoIndex + 1);
        } else {
          showPhotoAt(activePhotoIndex - 1);
        }
      }
    }, { passive: true });
  }

  /* ==========================================================================
     5. КНОПКА «ОТПРАВИТЬ ОБЪЯТИЕ» И ВЗЛЕТАЮЩИЕ ТЮЛЬПАНЫ/СЕРДЦА
     ========================================================================== */
  const btnHug = document.getElementById('btnHug');
  const hugCounterNumber = document.getElementById('hugCounterNumber');
  const hugToast = document.getElementById('hugToast');
  const hugParticlesContainer = document.getElementById('hugParticlesContainer');

  let hugCount = 0;
  let toastTimeout = null;

  const svgTulip = `
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor">
      <path d="M16 6 C13 11 12 16 16 20 C20 16 19 11 16 6 Z" stroke-width="1.4" fill="rgba(244, 63, 94, 0.45)"/>
      <path d="M16 20 C12 20 8 16 9 10 C12 12 14 16 16 17" stroke-width="1.4"/>
      <path d="M16 20 C20 20 24 16 23 10 C20 12 18 16 16 17" stroke-width="1.4"/>
      <path d="M16 20 L16 29" stroke-width="1.4"/>
    </svg>
  `;

  const svgHeart = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;

  const particlePalette = [
    '#F43F5E', // Сочный розовый
    '#FB7185', // Светящийся розовый
    '#FDA4AF', // Персиковый
    '#38BDF8', // Небесный
    '#E11D48', // Рубиновый
    '#F59E0B'  // Золотистый
  ];

  function spawnHugParticles() {
    if (!hugParticlesContainer) return;

    const particleCount = 16;
    const windowWidth = window.innerWidth;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hug-particle';

      const isTulip = Math.random() > 0.45;
      particle.innerHTML = isTulip ? svgTulip : svgHeart;

      const color = particlePalette[Math.floor(Math.random() * particlePalette.length)];
      particle.style.color = color;

      const startX = Math.random() * windowWidth;
      const driftXMid = (Math.random() - 0.5) * 140 + 'px';
      const driftXEnd = (Math.random() - 0.5) * 240 + 'px';
      const rotMid = (Math.random() - 0.5) * 50 + 'deg';
      const rotEnd = (Math.random() - 0.5) * 100 + 'deg';

      particle.style.left = `${startX}px`;
      particle.style.setProperty('--drift-x-mid', driftXMid);
      particle.style.setProperty('--drift-x-end', driftXEnd);
      particle.style.setProperty('--rot-mid', rotMid);
      particle.style.setProperty('--rot-end', rotEnd);

      const delay = Math.random() * 0.35;
      const duration = 2.6 + Math.random() * 0.8;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;

      hugParticlesContainer.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, (delay + duration) * 1000 + 100);
    }
  }

  function handleHugClick() {
    hugCount++;
    if (hugCounterNumber) {
      hugCounterNumber.textContent = hugCount.toString();
      hugCounterNumber.classList.add('bounce');
      setTimeout(() => {
        hugCounterNumber.classList.remove('bounce');
      }, 300);
    }

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    spawnHugParticles();

    if (hugToast) {
      hugToast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        hugToast.classList.remove('show');
      }, 2400);
    }
  }

  if (btnHug) {
    btnHug.addEventListener('click', handleHugClick);
  }

  /* ==========================================================================
     6. ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});
