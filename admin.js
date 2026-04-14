/* ============================================
   TREASURE HUNT — Admin Dashboard
   ============================================ */

var AdminApp = (function() {

  var listeners = [];
  var stepLabels = {
    step1: 'Step 1', step2: 'Step 2',
    step3: 'Step 3', step4: 'Step 4', final: 'Final'
  };

  function initAuth() {
    var overlay = document.getElementById('pin-overlay');
    var pinInput = document.getElementById('pin-input');
    var pinBtn = document.getElementById('pin-submit');
    var pinError = document.getElementById('pin-error');

    if (sessionStorage.getItem('admin_auth') === 'true') {
      overlay.classList.add('hidden');
      initDashboard();
      return;
    }

    pinBtn.addEventListener('click', checkPin);
    pinInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') checkPin();
    });

    function checkPin() {
      if (pinInput.value.trim() === ADMIN_PIN) {
        sessionStorage.setItem('admin_auth', 'true');
        gsap.to(overlay, {
          opacity: 0, duration: 0.4, ease: 'power2.in',
          onComplete: function() {
            overlay.classList.add('hidden');
            initDashboard();
          }
        });
      } else {
        pinError.classList.add('visible');
        gsap.fromTo(pinInput, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
        pinInput.value = '';
        setTimeout(function() { pinError.classList.remove('visible'); }, 2000);
      }
    }
    pinInput.focus();
  }

  function initDashboard() {
    Animations.pageEnter();
    Animations.initButtonInteractions();

    STEPS.forEach(function(stepId) {
      var unsub = db.collection('steps').doc(stepId)
        .onSnapshot(function(doc) {
          if (doc.exists) {
            renderCard(stepId, doc.data());
          } else {
            renderCard(stepId, { status: 'not_initialized' });
          }
        });
      listeners.push(unsub);
    });
  }

  function renderCard(stepId, data) {
    var card = document.getElementById('card-' + stepId);
    if (!card) return;

    var statusBadge = card.querySelector('.status-badge');
    var selfiePreview = card.querySelector('.selfie-preview');
    var timestamp = card.querySelector('.timestamp');
    var approveBtn = card.querySelector('.btn-approve');
    var rejectBtn = card.querySelector('.btn-reject');

    statusBadge.className = 'status-badge ' + data.status;
    var labels = {
      locked: '\u{1F512} Locked', waiting: '\u23F3 Waiting',
      uploaded: '\u{1F4F7} Photo received', approved: '\u2705 Approved',
      not_initialized: '\u26A0\uFE0F Not set up'
    };
    statusBadge.textContent = labels[data.status] || data.status;

    // Show selfie (base64 from Firestore)
    if (data.imageData) {
      selfiePreview.innerHTML = '<img src="' + data.imageData + '" alt="Selfie" loading="lazy" />';
    } else {
      selfiePreview.innerHTML = '<span class="empty-state">no photo yet</span>';
    }

    if (data.uploadedAt && data.uploadedAt.toDate) {
      var time = data.uploadedAt.toDate();
      timestamp.textContent = 'Uploaded: ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timestamp.textContent = '';
    }

    var canApprove = data.status === 'uploaded';
    approveBtn.disabled = !canApprove;
    rejectBtn.disabled = !canApprove;

    if (data.status === 'approved') {
      approveBtn.textContent = 'Approved \u2713';
    } else {
      approveBtn.textContent = stepId === 'final' ? 'Approve \u{1F389}' : 'Approve & Unlock Next';
    }

    if (data.status === 'uploaded') {
      gsap.fromTo(card,
        { boxShadow: '0 0 0 0 rgba(196,168,130,0.4)' },
        { boxShadow: '0 0 0 8px rgba(196,168,130,0)', duration: 1, repeat: 2, ease: 'power2.out' }
      );
    }
  }

  function approveStep(stepId) {
    var btn = document.querySelector('#card-' + stepId + ' .btn-approve');
    if (btn) { btn.disabled = true; btn.textContent = 'Approving\u2026'; }

    var batch = db.batch();
    batch.update(db.collection('steps').doc(stepId), {
      status: 'approved',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    var idx = STEPS.indexOf(stepId);
    if (idx < STEPS.length - 1) {
      batch.update(db.collection('steps').doc(STEPS[idx + 1]), { status: 'waiting' });
    }

    batch.commit().then(function() {
      var card = document.getElementById('card-' + stepId);
      if (card) Animations.spawnSparkles(card, 8);
      showToast(stepLabels[stepId] + ' approved! \u2728');
    }).catch(function(err) {
      console.error('Approve error:', err);
      showToast('Error approving. Try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Approve & Unlock Next'; }
    });
  }

  function rejectStep(stepId) {
    db.collection('steps').doc(stepId).update({
      status: 'waiting', imageData: '', uploadedAt: null
    }).then(function() {
      showToast(stepLabels[stepId] + ' reset \u2014 she\'ll need to re-upload');
    }).catch(function(err) {
      console.error('Reject error:', err);
      showToast('Error rejecting.');
    });
  }

  function resetAll() {
    if (!confirm('Reset the entire treasure hunt?')) return;
    initializeHunt().then(function() {
      showToast('Hunt reset! \u{1F504}');
    }).catch(function(err) {
      console.error('Reset error:', err);
      showToast('Error resetting.');
    });
  }

  function initHunt() {
    initializeHunt().then(function() {
      showToast('Hunt initialized! She can start at Step 1 \u{1F3AF}');
    }).catch(function(err) {
      console.error('Init error:', err);
      showToast('Error initializing. Check Firebase config.');
    });
  }

  return {
    initAuth: initAuth,
    approveStep: approveStep,
    rejectStep: rejectStep,
    resetAll: resetAll,
    initHunt: initHunt
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  AdminApp.initAuth();
});
