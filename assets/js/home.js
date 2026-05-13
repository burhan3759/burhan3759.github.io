(function () {
  const featuredGrid = document.querySelector('[data-featured-grid]');
  const storyGrid = document.querySelector('[data-story-grid]');
  const emptyState = document.querySelector('[data-empty-state]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const statTotal = document.querySelector('[data-stat="total"]');
  const statEngineering = document.querySelector('[data-stat="engineering"]');
  const statLife = document.querySelector('[data-stat="life"]');

  if (!featuredGrid || !storyGrid) {
    return;
  }

  function formatDate(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderFeatured(posts) {
    const topPosts = posts.slice(0, 3);
    if (topPosts.length === 0) {
      featuredGrid.innerHTML = '<p>No stories yet.</p>';
      return;
    }

    featuredGrid.innerHTML = topPosts.map(function (post) {
      return [
        '<a class="home-featured-card" href="' + escapeHtml(post.url) + '">',
        '  <p class="home-featured-card__meta">' + formatDate(post.published) + '</p>',
        '  <h3 class="home-featured-card__title">' + escapeHtml(post.title) + '</h3>',
        '  <p class="home-featured-card__excerpt">' + escapeHtml(post.excerpt || '') + '</p>',
        '</a>'
      ].join('');
    }).join('');
  }

  function renderStories(posts) {
    if (posts.length === 0) {
      storyGrid.innerHTML = '<p>No stories yet.</p>';
      return;
    }

    storyGrid.innerHTML = posts.map(function (post) {
      return [
        '<a class="home-story-card" data-story-card data-tags="' + escapeHtml(post.category) + '" href="' + escapeHtml(post.url) + '">',
        '  <div class="home-story-card__topline">',
        '    <p class="home-story-card__date">' + formatDate(post.published) + '</p>',
        '    <div class="home-story-card__tags"><span class="home-story-card__tag">' + escapeHtml(post.category) + '</span></div>',
        '  </div>',
        '  <h3 class="home-story-card__title">' + escapeHtml(post.title) + '</h3>',
        '  <p class="home-story-card__excerpt">' + escapeHtml(post.excerpt || '') + '</p>',
        '</a>'
      ].join('');
    }).join('');
  }

  function applyFilter(selectedFilter) {
    const storyCards = Array.from(document.querySelectorAll('[data-story-card]'));
    let visibleCount = 0;

    filterButtons.forEach(function (button) {
      button.classList.toggle('is-active', button.dataset.filter === selectedFilter);
    });

    storyCards.forEach(function (card) {
      const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
      const isVisible = selectedFilter === 'all' || tags.includes(selectedFilter);

      card.classList.toggle('is-hidden', !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  function updateStats(posts) {
    const engineering = posts.filter(function (item) { return item.category === 'engineering'; }).length;
    const life = posts.filter(function (item) { return item.category === 'life'; }).length;

    if (statTotal) {
      statTotal.textContent = String(posts.length);
    }
    if (statEngineering) {
      statEngineering.textContent = String(engineering);
    }
    if (statLife) {
      statLife.textContent = String(life);
    }
  }

  function withCategory(items, category) {
    return (items || []).map(function (item) {
      return Object.assign({}, item, { category: category });
    });
  }

  Promise.all([
    fetch('./assets/data/engineering.json').then(function (response) { return response.json(); }),
    fetch('./assets/data/life.json').then(function (response) { return response.json(); })
  ]).then(function (data) {
    const posts = withCategory(data[0], 'engineering').concat(withCategory(data[1], 'life'));
    posts.sort(function (a, b) {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    updateStats(posts);
    renderFeatured(posts);
    renderStories(posts);

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.dataset.filter || 'all');
      });
    });

    applyFilter('all');
  }).catch(function () {
    featuredGrid.innerHTML = '<p>Unable to load stories right now.</p>';
    storyGrid.innerHTML = '<p>Unable to load stories right now.</p>';
  });
})();
