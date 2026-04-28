const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const storyCards = Array.from(document.querySelectorAll('[data-story-card]'));
const emptyState = document.querySelector('[data-empty-state]');

if (filterButtons.length > 0 && storyCards.length > 0) {
  const applyFilter = (selectedFilter) => {
    let visibleCount = 0;

    filterButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === selectedFilter);
    });

    storyCards.forEach((card) => {
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
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filter || 'all');
    });
  });

  applyFilter('all');
}