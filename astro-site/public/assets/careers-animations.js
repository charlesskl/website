(function() {
  var jobs = [];

  function loadJobs() {
    fetch('/jobs.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        jobs = data;
        renderFilters();
        renderJobGrid();
      })
      .catch(function() {
        document.getElementById('jobGrid').innerHTML = '<p style="color:var(--text-muted);">Unable to load job listings.</p>';
      });
  }

  function renderFilters() {
    var depts = ['All Departments', 'Office', 'Production'];
    var bar = document.getElementById('filterBar');
    bar.innerHTML = '';
    depts.forEach(function(d) {
      var btn = document.createElement('button');
      btn.className = 'filter-btn' + (d === 'All Departments' ? ' active' : '');
      btn.textContent = d;
      btn.addEventListener('click', function() {
        bar.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        filterJobs(d);
      });
      bar.appendChild(btn);
    });
  }

  function filterJobs(dept) {
    document.querySelectorAll('#jobGrid .job-card').forEach(function(card) {
      var show = dept === 'All Departments' || card.dataset.dept === dept;
      card.style.display = show ? '' : 'none';
    });
  }

  function renderJobGrid() {
    var grid = document.getElementById('jobGrid');
    grid.innerHTML = '';
    jobs.forEach(function(job) {
      var card = document.createElement('div');
      card.className = 'job-card reveal-up';
      card.dataset.dept = job.department;
      var tags = '<span class="job-tag">' + escHtml(job.location) + '</span><span class="job-tag">' + escHtml(job.type) + '</span>';
      if (job.arrangement) tags += '<span class="job-tag">' + escHtml(job.arrangement) + '</span>';
      card.innerHTML = '<div class="job-dept">' + escHtml(job.department) + '</div>' +
        '<h3>' + escHtml(job.title) + '</h3>' +
        '<div class="job-meta">' + tags + '</div>' +
        '<p>' + escHtml(job.description) + '</p>' +
        '<a href="#" class="job-apply" data-title="' + escHtml(job.title) + '">Apply Now →</a>';
      card.querySelector('.job-apply').addEventListener('click', function(e) {
        e.preventDefault();
        openApplyModal(this.dataset.title);
      });
      grid.appendChild(card);
    });
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  // Apply modal
  var applyOverlay = document.getElementById('applyOverlay');
  var lastFocusedElement = null;

  function openApplyModal(title) {
    lastFocusedElement = document.activeElement;
    document.getElementById('applyJobTitle').textContent = title;
    document.getElementById('applyName').value = '';
    applyOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
      document.getElementById('applyName').focus();
    }, 100);
  }

  function closeApplyModal() {
    applyOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.getElementById('applyClose').addEventListener('click', closeApplyModal);

  applyOverlay.addEventListener('click', function(e) {
    if (e.target === applyOverlay) closeApplyModal();
  });

  // ESC to close + focus trap
  document.addEventListener('keydown', function(e) {
    if (!applyOverlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeApplyModal();
      return;
    }
    if (e.key === 'Tab') {
      var modal = applyOverlay.querySelector('.apply-modal');
      var focusable = modal.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.getElementById('applySubmit').addEventListener('click', function() {
    var name = document.getElementById('applyName').value.trim();
    var title = document.getElementById('applyJobTitle').textContent;
    var email = document.querySelector('input[name="applyEntity"]:checked').value;
    var subject = encodeURIComponent('Application — ' + title);
    var body = encodeURIComponent('Name: ' + (name || '(not provided)') + '\nPosition: ' + title + '\n\nPlease find my CV attached.');
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    closeApplyModal();
  });

  loadJobs();
})();
