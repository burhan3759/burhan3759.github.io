(function () {
  const article = document.querySelector('article[data-post-category][data-post-slug]');
  if (!article) {
    return;
  }

  const category = article.dataset.postCategory;
  const slug = article.dataset.postSlug;

  if (!category || !slug) {
    return;
  }

  fetch('../../assets/data/' + category + '.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (posts) {
      const post = posts.find(function (item) {
        return item.slug === slug;
      });

      if (!post) {
        console.warn('Post not found: ' + category + '/' + slug);
        return;
      }

      const titleEl = article.querySelector('[data-post-title]');
      if (titleEl && post.title) {
        titleEl.textContent = post.title;
      }

      const dateEl = article.querySelector('[data-post-date]');
      if (dateEl && post.published) {
        const date = new Date(post.published);
        if (!Number.isNaN(date.getTime())) {
          dateEl.textContent = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          dateEl.parentElement.setAttribute('datetime', post.published);
        }
      }

      const targetEl = article.querySelector('[data-markdown-target]');
      if (targetEl && post.markdown) {
        const sourceEl = document.createElement('script');
        sourceEl.type = 'text/plain';
        sourceEl.dataset.markdownSource = '';
        sourceEl.textContent = post.markdown;
        targetEl.parentElement.appendChild(sourceEl);

        setTimeout(function () {
          const markdownRenderer = window.renderMarkdownTarget || (
            document.querySelectorAll('[data-markdown-source]').forEach(function (node) {
              const container = node.closest('.post-content');
              if (!container) return;
              const target = container.querySelector('[data-markdown-target]');
              if (!target) return;

              const md = node.textContent || '';
              target.innerHTML = window.renderMarkdownHtml ? window.renderMarkdownHtml(md) : md;
            })
          );

          if (!markdownRenderer) {
            const lines = post.markdown.replace(/\r\n?/g, '\n').trim().split('\n');
            const emojiMap = {
              cry: '😢',
              grimacing: '😬',
              heart: '❤',
              india: '🇮🇳',
              innocent: '😇',
              joy: '😂',
              laughing: '😆',
              man_teacher: '👨‍🏫',
              rofl: '🤣',
              slightly_smiling_face: '🙂',
              smile: '😄',
              smiling_imp: '😈',
              sweat_smile: '😅',
              woman_teacher: '👩‍🏫'
            };

            function renderInline(input) {
              let text = input.replace(/:([a-z0-9_+-]+):/g, function (match, name) {
                return emojiMap[name] || match;
              });

              text = text.replace(/\[([^\]]+)\]\(([^)]+)\)\{:\s*([^}]*)\}/g, function (_, label, href, attrRaw) {
                const attrs = {};
                (attrRaw || '').replace(/([a-zA-Z_:][-a-zA-Z0-9_:]*)\s*=\s*"([^"]*)"/g, function (__, key, value) {
                  attrs[key] = value;
                  return __;
                });
                attrs.href = href;
                if (attrs.target === '_blank' && !attrs.rel) {
                  attrs.rel = 'noopener noreferrer';
                }
                return '<a' + Object.keys(attrs).map(function (key) {
                  return ' ' + key + '="' + String(attrs[key]).replace(/"/g, '&quot;') + '"';
                }).join('') + '>' + label + '</a>';
              });

              text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
              text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
              text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
              text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
              text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
              text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
              text = text.replace(/\{:\s*[^}]*\}/g, '');
              return text;
            }

            function renderMarkdown(md) {
              const html = [];
              let paragraph = [];

              function flushParagraph() {
                if (paragraph.length === 0) return;
                html.push('<p>' + renderInline(paragraph.join(' ').trim()) + '</p>');
                paragraph = [];
              }

              for (let i = 0; i < lines.length; i += 1) {
                const rawLine = lines[i];
                const line = rawLine.trim();

                if (!line) {
                  flushParagraph();
                  continue;
                }

                const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
                if (headingMatch) {
                  flushParagraph();
                  const level = headingMatch[1].length;
                  html.push('<h' + level + '>' + renderInline(headingMatch[2].trim()) + '</h' + level + '>');
                  continue;
                }

                const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{:\s*([^}]*)\})?$/);
                if (imageMatch) {
                  flushParagraph();
                  const attrs = { src: imageMatch[2], alt: imageMatch[1] };
                  (imageMatch[3] || '').replace(/([a-zA-Z_:][-a-zA-Z0-9_:]*)\s*=\s*"([^"]*)"/g, function (_, key, value) {
                    attrs[key] = value;
                    return _;
                  });
                  html.push('<p><img' + Object.keys(attrs).map(function (key) {
                    return ' ' + key + '="' + String(attrs[key]).replace(/"/g, '&quot;') + '"';
                  }).join('') + ' /></p>');
                  continue;
                }

                paragraph.push(rawLine);
              }

              flushParagraph();
              return html.join('\n\n');
            }

            if (targetEl) {
              targetEl.innerHTML = renderMarkdown(post.markdown);
            }
          }
        }, 0);
      }
    })
    .catch(function (error) {
      console.error('Error loading post data:', error);
    });
})();
