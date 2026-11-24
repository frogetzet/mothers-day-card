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
      navigator.vibrate([25, 40, 25]);
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

  // Цвета лепестков: нежно-розовые и небесно-голубые полупрозрачные оттенки
  const petalColors = [
    'rgba(248, 187, 208, 0.55)', // Нежный розовый
    'rgba(252, 228, 236, 0.65)', // Светло-розовый
    'rgba(227, 242, 253, 0.50)', // Небесно-голубой
    'rgba(179, 229, 252, 0.45)', // Мягкий голубой
    'rgba(244, 143, 177, 0.40)'  // Розовый тюльпан
  ];

  class Petal {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * canvasWidth;
      // При инициализации распределяем по всему экрану, затем — сверху
      this.y = initial ? Math.random() * canvasHeight : -30;
      this.size = 10 + Math.random() * 12; // Компактный деликатный размер
      this.speedY = 0.6 + Math.random() * 0.8; // Медленное плавное падение
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.02;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.02;
      this.swayAmplitude = 0.8 + Math.random() * 1.2;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.aspectRatio = 0.55 + Math.random() * 0.35;
    }

    update() {
      this.sway += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.sway) * this.swayAmplitude;
      this.y += this.speedY;
      this.angle += this.angularSpeed;

      // Перезапуск при выходе за пределы экрана
      if (this.y > canvasHeight + 35 || this.x < -40 || this.x > canvasWidth + 40) {
        this.reset(false);
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);

      // Форма лепестка тюльпана через кривые Безье
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

    // Небольшое количество лепестков (16 штук) для ощущения лёгкости
    const PETAL_COUNT = 16;
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

  // Остановка анимации при скрытии вкладки для экономии батареи
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
      // Сброс предыдущих классов состояния
      card.classList.remove('active', 'next', 'next-2', 'hidden-back', 'swiped-left', 'swiped-right');

      if (idx === currentCardIndex) {
        card.classList.add('active');
      } else if (idx === currentCardIndex + 1) {
        card.classList.add('next');
      } else if (idx === currentCardIndex + 2) {
        card.classList.add('next-2');
      } else if (idx < currentCardIndex) {
        // Ушедшие карточки
        if (direction < 0 && idx === currentCardIndex - 1) {
          card.classList.add('swiped-left');
        } else {
          card.classList.add('swiped-left');
        }
      } else {
        card.classList.add('hidden-back');
      }
    });

    // Обновление счётчика: 01 / 10
    if (reasonsCounter) {
      const currentNumberStr = (currentCardIndex + 1).toString().padStart(2, '0');
      const totalNumberStr = totalCards.toString().padStart(2, '0');
      reasonsCounter.textContent = `${currentNumberStr} / ${totalNumberStr}`;
    }

    // Обновление прогресс-бара
    if (reasonsProgressBar) {
      const percent = ((currentCardIndex + 1) / totalCards) * 100;
      reasonsProgressBar.style.width = `${percent}%`;
    }

    // Состояние кнопки «Назад»
    if (btnPrevReason) {
      btnPrevReason.disabled = currentCardIndex === 0;
    }

    // Текст кнопки «Дальше» на последней карточке
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
      // Циклический возврат в начало
      currentCardIndex = 0;
      updateDeckState(1);
    }
    if (navigator.vibrate) navigator.vibrate(15);
  }

  function prevReason() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateDeckState(-1);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  }

  if (btnNextReason) {
    btnNextReason.addEventListener('click', nextReason);
  }
  if (btnPrevReason) {
    btnPrevReason.addEventListener('click', prevReason);
  }

  // Обработка свайпов на тач-устройствах
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
      const swipeThreshold = 45; // Порог в пикселях

      // Игнорируем, если скролл был преимущественно вертикальным
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
          // Свайп влево — следующая карточка
          nextReason();
        } else {
          // Свайп вправо — предыдущая карточка
          prevReason();
        }
      }
    }
  }

  // Инициализация стартового состояния стопки
  updateDeckState(0);

  /* ==========================================================================
     4. ФОТОГАЛЕРЕЯ И ЛАЙТБОКС
     ========================================================================== */
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  // Красивая обработка плейсхолдера для картинок
  const galleryImages = document.querySelectorAll('.gallery-img');
  galleryImages.forEach(img => {
    // Если изображение успешно загрузилось — оно плавно появляется
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    // Если файла нет — скрываем <img>, оставив элегантный CSS-плейсхолдер
    img.addEventListener('error', () => {
      img.style.display = 'none';
    });
  });

  function openLightbox(imgSrc, captionText) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = captionText || 'Фотография';
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || '';
    }
    lightboxModal.hidden = false;
    // Даём браузеру применить hidden=false перед добавлением класса анимации
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

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const caption = card.getAttribute('data-caption');
      openLightbox(imgSrc, caption);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && !lightboxModal.hidden) {
      closeLightbox();
    }
  });

  /* ==========================================================================
     5. КНОПКА «ОТПРАВИТЬ ОБЪЯТИЕ» И ВЗЛЕТАЮЩИЕ ТЮЛЬПАНЫ/СЕРДЦА
     ========================================================================== */
  const btnHug = document.getElementById('btnHug');
  const hugCounterNumber = document.getElementById('hugCounterNumber');
  const hugToast = document.getElementById('hugToast');
  const hugParticlesContainer = document.getElementById('hugParticlesContainer');

  let hugCount = 0;
  let toastTimeout = null;

  // SVG-шаблоны для взлетающих элементов
  const svgTulip = `
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor">
      <path d="M16 6 C13 11 12 16 16 20 C20 16 19 11 16 6 Z" stroke-width="1.3" fill="rgba(248, 187, 208, 0.4)"/>
      <path d="M16 20 C12 20 8 16 9 10 C12 12 14 16 16 17" stroke-width="1.3"/>
      <path d="M16 20 C20 20 24 16 23 10 C20 12 18 16 16 17" stroke-width="1.3"/>
      <path d="M16 20 L16 29" stroke-width="1.3"/>
    </svg>
  `;

  const svgHeart = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;

  const particlePalette = [
    '#F8BBD0', // Пастельный розовый
    '#E2A9B2', // Тон розы
    '#B3E5FC', // Небесно-голубой
    '#FCE4EC', // Нежно-розовый
    '#D85A7F'  // Тёплый акцент
  ];

  function spawnHugParticles() {
    if (!hugParticlesContainer) return;

    const particleCount = 14;
    const windowWidth = window.innerWidth;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hug-particle';

      const isTulip = Math.random() > 0.45;
      particle.innerHTML = isTulip ? svgTulip : svgHeart;

      const color = particlePalette[Math.floor(Math.random() * particlePalette.length)];
      particle.style.color = color;

      // Случайное смещение по горизонтали
      const startX = Math.random() * windowWidth;
      const driftXMid = (Math.random() - 0.5) * 120 + 'px';
      const driftXEnd = (Math.random() - 0.5) * 220 + 'px';
      const rotMid = (Math.random() - 0.5) * 45 + 'deg';
      const rotEnd = (Math.random() - 0.5) * 90 + 'deg';

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

      // Удаление частицы из DOM после завершения анимации
      setTimeout(() => {
        particle.remove();
      }, (delay + duration) * 1000 + 100);
    }
  }

  function handleHugClick() {
    // 1. Увеличиваем счётчик
    hugCount++;
    if (hugCounterNumber) {
      hugCounterNumber.textContent = hugCount.toString();
      hugCounterNumber.classList.add('bounce');
      setTimeout(() => {
        hugCounterNumber.classList.remove('bounce');
      }, 300);
    }

    // 2. Тактильная отдача на смартфонах
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // 3. Запуск взлетающих тюльпанов и сердец
    spawnHugParticles();

    // 4. Показ нежного уведомления
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
    // Резервный вариант для старых браузеров
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});
