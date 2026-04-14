/* ============================================
   TREASURE HUNT — Core Step Logic
   Uses base64 in Firestore (no Storage needed)
   ============================================ */

var StepApp = (function() {

  var currentStep = null;
  var currentStepNumber = 0;
  var unsubscribe = null;

  var stepContent = {
    step1: {
      hintClue: '\u{1F4CD} [Your initial clue — where to go for Step 1]',
      waitingText: 'hmm let me verify this \u{1F60C}',
      clue: '\u270F\uFE0F [Your clue for Step 2 goes here]',
      successText: 'not bad\u2026 okay here\u2019s your next hint',
      nextPage: 'step2.html'
    },
    step2: {
      hintClue: '\u{1F4CD} [Your clue for Step 2 goes here]',
      waitingText: 'okay wait\u2026 checking \u{1F60C}',
      clue: '\u270F\uFE0F [Your clue for Step 3 goes here]',
      successText: 'okay I see the effort',
      nextPage: 'step3.html'
    },
    step3: {
      hintClue: '\u{1F4CD} [Your clue for Step 3 goes here]',
      waitingText: 'one sec\u2026 verifying \u{1F914}',
      clue: '\u270F\uFE0F [Your clue for Step 4 goes here]',
      successText: 'you\u2019re getting closer\u2026',
      nextPage: 'step4.html'
    },
    step4: {
      hintClue: '\u{1F4CD} [Your clue for Step 4 goes here]',
      waitingText: 'almost done checking\u2026',
      clue: '\u270F\uFE0F [Your clue for the Final location goes here]',
      successText: 'okay wow\u2026 you actually did it all',
      nextPage: 'final.html'
    }
  };

  // ── Hint Toggle System ──
  var hintOpen = false;

  function createHintToggle() {
    var content = stepContent[currentStep];
    if (!content || !content.hintClue) return;

    // Create toggle button
    var btn = document.createElement('button');
    btn.className = 'hint-toggle';
    btn.id = 'hint-toggle';
    btn.innerHTML = '\u{1F4CD}';
    btn.setAttribute('aria-label', 'Show hint');
    document.body.appendChild(btn);

    // Create backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'hint-backdrop';
    backdrop.id = 'hint-backdrop';
    document.body.appendChild(backdrop);

    // Create hint card
    var card = document.createElement('div');
    card.className = 'hint-card';
    card.id = 'hint-card';
    card.innerHTML =
      '<div class="hint-handle"></div>' +
      '<p class="hint-label">your current clue</p>' +
      '<p class="hint-text">' + content.hintClue + '</p>' +
      '<button class="hint-close">got it \u2713</button>';
    document.body.appendChild(card);

    // Show the toggle button with delay
    setTimeout(function() {
      btn.classList.add('visible');
    }, 2000);

    // Toggle handler
    btn.addEventListener('click', function() { toggleHint(); });
    backdrop.addEventListener('click', function() { closeHint(); });
    card.querySelector('.hint-close').addEventListener('click', function() { closeHint(); });
  }

  function toggleHint() {
    if (hintOpen) { closeHint(); } else { openHint(); }
  }

  function openHint() {
    hintOpen = true;
    var backdrop = document.getElementById('hint-backdrop');
    var card = document.getElementById('hint-card');
    if (backdrop) backdrop.classList.add('open');
    if (card) card.classList.add('open');
  }

  function closeHint() {
    hintOpen = false;
    var backdrop = document.getElementById('hint-backdrop');
    var card = document.getElementById('hint-card');
    if (backdrop) backdrop.classList.remove('open');
    if (card) card.classList.remove('open');
  }

  // ── Initialize UI (sync, immediate) ──
  function initUI(stepId) {
    currentStep = stepId;
    currentStepNumber = parseInt(stepId.replace('step', ''));
    Animations.pageEnter();
    Animations.initDecorations();
    Animations.initButtonInteractions();
    createHintToggle();
  }

  // ── Connect to Firebase (async, delayed) ──
  function initFirebase(stepId) {
    var timeoutId = setTimeout(function() {
      // If Firebase hasn't responded in 5s, show UI anyway
      showMessageState();
      showToast('Slow connection \u2014 showing preview');
    }, 5000);

    db.collection('steps').doc(stepId).get()
      .then(function(doc) {
        clearTimeout(timeoutId);
        if (!doc.exists) {
          showToast('Hunt not initialized. Ask admin to set it up.');
          showMessageState();
          return;
        }
        handleState(doc.data().status, doc.data());
      })
      .catch(function(err) {
        clearTimeout(timeoutId);
        console.error('Firebase error:', err);
        showMessageState();
        showToast('Offline mode \u2014 set up Firebase to connect');
      });
  }

  // ── Full init ──
  function init(stepId) {
    initUI(stepId);
    // Let GSAP render one frame before doing async work
    requestAnimationFrame(function() {
      setTimeout(function() { initFirebase(stepId); }, 100);
    });
  }

  function handleState(status) {
    switch (status) {
      case 'locked': showLockedState(); break;
      case 'waiting': showMessageState(); break;
      case 'uploaded': showWaitingState(); listenForApproval(); break;
      case 'approved': showCompletedState(); break;
    }
  }

  function showLockedState() {
    Animations.pageExit('index.html');
  }

  function showMessageState() {
    Animations.showSection('message-section', {
      onComplete: function() {
        Animations.animateStepLabel('.step-label');
        Animations.animateTextReveal('.message-line', {
          delay: 0.3,
          onComplete: function() {
            var btn = document.getElementById('im-here-btn');
            if (btn) {
              gsap.fromTo(btn,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
              );
            }
          }
        });
      }
    });
  }

  function showUploadState() {
    Animations.showSection('upload-section', {
      onComplete: function() {
        var uploadZone = document.getElementById('upload-zone');
        var fileInput = document.getElementById('file-input');
        var submitBtn = document.getElementById('submit-btn');
        var preview = document.getElementById('upload-preview');

        uploadZone.addEventListener('click', function() { fileInput.click(); });

        fileInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            preview.src = ev.target.result;
            uploadZone.classList.add('has-preview');
            gsap.fromTo(submitBtn,
              { opacity: 0, y: 10, display: 'none' },
              { opacity: 1, y: 0, display: 'inline-flex', duration: 0.4, ease: 'back.out(2)' }
            );
          };
          reader.readAsDataURL(file);
        });

        submitBtn.addEventListener('click', function() { submitSelfie(); });
      }
    });
  }

  function submitSelfie() {
    var fileInput = document.getElementById('file-input');
    var submitBtn = document.getElementById('submit-btn');
    var file = fileInput.files[0];

    if (!file) { showToast('pick a photo first \u{1F4F7}'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'uploading\u2026';

    compressImageToBase64(file, 600).then(function(base64) {
      return db.collection('steps').doc(currentStep).update({
        status: 'uploaded',
        imageData: base64,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }).then(function() {
      showWaitingState();
      listenForApproval();
    }).catch(function(err) {
      console.error('Upload error:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'send it \u{1F4F7}';
      showToast('upload failed\u2026 try again');
    });
  }

  function showWaitingState() {
    var content = stepContent[currentStep];
    Animations.showSection('waiting-section', {
      delay: 0.2,
      onComplete: function() {
        var waitText = document.querySelector('.waiting-text');
        if (waitText) waitText.textContent = content.waitingText;
        var doodleContainer = document.querySelector('.doodle-container');
        if (doodleContainer && !doodleContainer.innerHTML.trim()) {
          doodleContainer.innerHTML = Math.random() > 0.5
            ? Animations.getBearDoodle()
            : Animations.getBunnyDoodle();
        }
      }
    });
  }

  function listenForApproval() {
    if (unsubscribe) unsubscribe();
    unsubscribe = db.collection('steps').doc(currentStep)
      .onSnapshot(function(doc) {
        var data = doc.data();
        if (data && data.status === 'approved') {
          if (unsubscribe) unsubscribe();
          setTimeout(function() { showClueState(); }, 800);
        }
      });
  }

  function showClueState() {
    var content = stepContent[currentStep];
    Animations.showSection('clue-section', {
      delay: 0.2,
      onComplete: function() {
        var clueText = document.querySelector('.clue-text');
        if (clueText) clueText.textContent = content.clue;
        var successText = document.querySelector('.success-text');
        if (successText) successText.textContent = content.successText;
        var successMsg = document.querySelector('.success-message');
        if (successMsg) {
          gsap.to(successMsg, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        }
        var clueCard = document.querySelector('.clue-card');
        Animations.animateClueReveal(clueCard, { delay: 0.5 });
        var continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
          continueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Animations.pageExit(content.nextPage);
          });
        }
      }
    });
  }

  function showCompletedState() {
    var content = stepContent[currentStep];
    var allSections = document.querySelectorAll('.step-section');
    for (var i = 0; i < allSections.length; i++) {
      allSections[i].classList.add('hidden');
    }
    var section = document.getElementById('completed-section');
    if (section) {
      section.classList.remove('hidden');
      gsap.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      setTimeout(function() { Animations.pageExit(content.nextPage); }, 1500);
    }
  }

  function onImHereClick() { showUploadState(); }

  return { init: init, onImHereClick: onImHereClick };
})();

// Bind button
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('im-here-btn');
  if (btn) {
    btn.addEventListener('click', function() { StepApp.onImHereClick(); });
  }
});
