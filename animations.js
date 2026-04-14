/* ============================================
   TREASURE HUNT — Animation System (GSAP)
   ============================================ */

var Animations = (function() {

  // ── Floating Petals ──
  function createPetalSVG() {
    var colors = ['#e8d5c4', '#f0d5c9', '#ddd0c1', '#c4a882'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    return '<svg viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M10 0 C14 4, 18 10, 18 16 C18 22, 14 26, 10 26 C6 26, 2 22, 2 16 C2 10, 6 4, 10 0Z" ' +
      'fill="' + color + '" opacity="0.6"/></svg>';
  }

  function initFloatingPetals(container, count) {
    if (!container) return;
    count = count || 6;
    for (var i = 0; i < count; i++) {
      var petal = document.createElement('div');
      petal.className = 'floating-petal';
      petal.innerHTML = createPetalSVG();
      petal.style.left = (Math.random() * 100) + '%';
      petal.style.top = (Math.random() * 100) + '%';
      var size = 14 + Math.random() * 18;
      petal.style.width = size + 'px';
      petal.style.height = (size * 1.3) + 'px';
      container.appendChild(petal);

      gsap.set(petal, { opacity: 0, rotation: Math.random() * 360 });
      gsap.to(petal, {
        opacity: 0.25 + Math.random() * 0.2,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 3,
        ease: 'power2.out'
      });
      gsap.to(petal, {
        y: '+=' + (60 + Math.random() * 80),
        x: '+=' + (-30 + Math.random() * 60),
        rotation: '+=' + (-40 + Math.random() * 80),
        duration: 8 + Math.random() * 8,
        repeat: -1, yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 4
      });
    }
  }

  function initFloatingBlobs() {
    var blobs = document.querySelectorAll('.floating-blob');
    for (var i = 0; i < blobs.length; i++) {
      gsap.to(blobs[i], {
        x: '+=' + (-20 + Math.random() * 40),
        y: '+=' + (-20 + Math.random() * 40),
        scale: 0.9 + Math.random() * 0.3,
        duration: 10 + i * 3,
        repeat: -1, yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  // ── Text Reveal ──
  function animateTextReveal(selector, options) {
    options = options || {};
    var lines = document.querySelectorAll(selector);
    if (!lines.length) return null;
    var tl = gsap.timeline({
      delay: options.delay || 0.3,
      onComplete: options.onComplete || null
    });
    tl.to(lines, {
      opacity: 1, y: 0,
      duration: 0.8, stagger: 0.25,
      ease: 'power3.out'
    });
    return tl;
  }

  function animateStepLabel(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    gsap.to(el, { opacity: 1, duration: 0.6, delay: 0.1, ease: 'power2.out' });
  }

  // ── Button Interactions ──
  function initButtonInteractions() {
    var btns = document.querySelectorAll('.btn-primary, .btn-approve, .btn-reject');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('mouseenter', function() {
          gsap.to(btn, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function() {
          gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('touchstart', function() {
          gsap.to(btn, { scale: 0.96, duration: 0.1 });
        }, { passive: true });
        btn.addEventListener('touchend', function() {
          gsap.to(btn, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
        }, { passive: true });
      })(btns[i]);
    }
  }

  // ── Section Transitions ──
  function showSection(sectionId, options) {
    options = options || {};
    var section = document.getElementById(sectionId);
    if (!section) return;

    var visibleSections = [];
    var allSections = document.querySelectorAll('.step-section');
    for (var i = 0; i < allSections.length; i++) {
      if (allSections[i].id !== sectionId && !allSections[i].classList.contains('hidden')) {
        visibleSections.push(allSections[i]);
      }
    }

    if (visibleSections.length > 0) {
      var completed = 0;
      for (var j = 0; j < visibleSections.length; j++) {
        (function(s) {
          gsap.to(s, {
            opacity: 0, y: -10, duration: 0.3, ease: 'power2.in',
            onComplete: function() {
              s.classList.add('hidden');
              gsap.set(s, { opacity: 1, y: 0 });
              completed++;
              if (completed === visibleSections.length) {
                revealSection(section, options);
              }
            }
          });
        })(visibleSections[j]);
      }
    } else {
      revealSection(section, options);
    }
  }

  function revealSection(section, options) {
    options = options || {};
    section.classList.remove('hidden');
    gsap.fromTo(section,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power3.out',
        delay: options.delay || 0.1,
        onComplete: options.onComplete || null
      }
    );
  }

  // ── Clue Reveal ──
  function animateClueReveal(clueCard, options) {
    if (!clueCard) return;
    options = options || {};
    var tl = gsap.timeline({ delay: options.delay || 0.3 });
    tl.fromTo(clueCard,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    tl.add(function() { spawnSparkles(clueCard, 6); }, '-=0.3');
    var continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      tl.fromTo(continueBtn,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      );
    }
    return tl;
  }

  // ── Sparkles ──
  function spawnSparkles(element, count) {
    count = count || 6;
    var rect = element.getBoundingClientRect();
    for (var i = 0; i < count; i++) {
      var sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.position = 'fixed';
      sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
      sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
      document.body.appendChild(sparkle);
      var sz = 3 + Math.random() * 5;
      gsap.set(sparkle, { width: sz, height: sz });
      (function(sp) {
        gsap.to(sp, {
          opacity: 1, scale: 1.5, duration: 0.3, ease: 'power2.out',
          onComplete: function() {
            gsap.to(sp, {
              opacity: 0, scale: 0,
              y: -20 + Math.random() * -30,
              x: -15 + Math.random() * 30,
              duration: 0.6, ease: 'power2.in',
              onComplete: function() { sp.remove(); }
            });
          }
        });
      })(sparkle);
    }
  }

  // ── Page Enter (fade overlay OUT) ──
  function pageEnter() {
    var overlay = document.querySelector('.page-overlay');
    if (!overlay) return;
    gsap.fromTo(overlay,
      { opacity: 1 },
      {
        opacity: 0, duration: 0.6, ease: 'power2.out',
        onComplete: function() {
          overlay.style.pointerEvents = 'none';
        }
      }
    );
  }

  // ── Page Exit (fade overlay IN, then navigate) ──
  function pageExit(url) {
    var overlay = document.querySelector('.page-overlay');
    if (!overlay) { window.location.href = url; return; }
    overlay.style.pointerEvents = 'all';
    gsap.to(overlay, {
      opacity: 1, duration: 0.4, ease: 'power2.in',
      onComplete: function() { window.location.href = url; }
    });
  }

  // ── Doodle SVGs ──
  function getBearDoodle() {
    return '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="14" cy="10" r="6"/><circle cx="34" cy="10" r="6"/>' +
      '<circle cx="24" cy="26" r="16"/>' +
      '<circle cx="18" cy="23" r="2" fill="currentColor" stroke="none"/>' +
      '<circle cx="30" cy="23" r="2" fill="currentColor" stroke="none"/>' +
      '<ellipse cx="24" cy="30" rx="4" ry="3"/>' +
      '<path d="M22 33 Q24 36 26 33"/></svg>';
  }

  function getBunnyDoodle() {
    return '<svg viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M18 20 Q16 4 20 2 Q24 0 22 20"/>' +
      '<path d="M30 20 Q32 4 28 2 Q24 0 26 20"/>' +
      '<circle cx="24" cy="32" r="14"/>' +
      '<circle cx="19" cy="29" r="1.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="29" cy="29" r="1.5" fill="currentColor" stroke="none"/>' +
      '<ellipse cx="24" cy="35" rx="3" ry="2"/>' +
      '<path d="M21 37 Q24 40 27 37"/></svg>';
  }

  // ── Confetti (Final page) ──
  function initConfetti(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ['#c4a882','#e8d5c4','#f0d5c9','#ddd0c1','#f5efe6','#d4a0a0','#b8a090','#a8907a'];
    var particles = [];

    function Particle(initial) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height * -1 : -20;
      this.size = 4 + Math.random() * 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedY = 0.5 + Math.random() * 1.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 3;
      this.opacity = 0.4 + Math.random() * 0.4;
      this.isCircle = Math.random() > 0.5;
      this.wobble = Math.random() * Math.PI * 2;
    }
    Particle.prototype.update = function() {
      this.y += this.speedY;
      this.wobble += 0.025;
      this.x += this.speedX + Math.sin(this.wobble) * 0.3;
      this.rotation += this.rotSpeed;
      if (this.y > canvas.height + 20) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    };
    Particle.prototype.draw = function() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = this.color;
      if (this.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      }
      ctx.restore();
    };

    for (var i = 0; i < 60; i++) particles.push(new Particle(true));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ── Decorations Init ──
  function initDecorations() {
    var container = document.getElementById('floating-container');
    if (!container) return;
    initFloatingBlobs();
    initFloatingPetals(container, 6);
  }

  return {
    initFloatingPetals: initFloatingPetals,
    initFloatingBlobs: initFloatingBlobs,
    animateTextReveal: animateTextReveal,
    animateStepLabel: animateStepLabel,
    initButtonInteractions: initButtonInteractions,
    showSection: showSection,
    animateClueReveal: animateClueReveal,
    spawnSparkles: spawnSparkles,
    pageEnter: pageEnter,
    pageExit: pageExit,
    getBearDoodle: getBearDoodle,
    getBunnyDoodle: getBunnyDoodle,
    initConfetti: initConfetti,
    initDecorations: initDecorations
  };
})();
