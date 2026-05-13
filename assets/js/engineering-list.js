(function () {
  var listEl = document.querySelector('[data-engineering-list]');
  var statusEl = document.querySelector('[data-engineering-status]');

  if (!listEl) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeUrl(url) {
    if (!url) {
      return '#';
    }

    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('./') === 0 || url.indexOf('../') === 0) {
      return url;
    }

    if (url.charAt(0) === '/') {
      return '.' + url;
    }

    return './' + url;
  }

  function formatDate(value) {
    if (!value) {
      return '';
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function renderPosts(posts) {
    if (!posts || posts.length === 0) {
      listEl.innerHTML = '<li><span class="post-meta">No posts yet</span><h3><span class="post-link">Engineering stories will appear here soon.</span></h3></li>';
      return;
    }

    posts.sort(function (a, b) {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    listEl.innerHTML = posts.map(function (post) {
      return [
        '<li>',
        '  <span class="post-meta">' + escapeHtml(formatDate(post.published)) + '</span>',
        '  <h3>',
        '    <a class="post-link" href="' + escapeHtml(normalizeUrl(post.url)) + '">',
        '      ' + escapeHtml(post.title || 'Untitled story'),
        '    </a>',
        '  </h3>',
        '</li>'
      ].join('');
    }).join('');
  }

  function showError() {
    listEl.innerHTML = '';

    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = 'Unable to load engineering stories right now.';
    }
  }

  fetch('./assets/data/engineering.json')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load engineering data');
      }

      return response.json();
    })
    .then(function (posts) {
      renderPosts(Array.isArray(posts) ? posts : []);
    })
    .catch(function () {
      showError();
    });
})();
