(function () {
  const emojiMap = {
    cry: "😢",
    grimacing: "😬",
    heart: "❤",
    india: "🇮🇳",
    innocent: "😇",
    joy: "😂",
    laughing: "😆",
    man_teacher: "👨‍🏫",
    rofl: "🤣",
    slightly_smiling_face: "🙂",
    smile: "😄",
    smiling_imp: "😈",
    sweat_smile: "😅",
    woman_teacher: "👩‍🏫"
  };

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function parseAttributeBlock(raw) {
    const attrs = {};
    if (!raw) {
      return attrs;
    }

    raw.replace(/([a-zA-Z_:][-a-zA-Z0-9_:]*)\s*=\s*"([^"]*)"/g, function (_, key, value) {
      attrs[key] = value;
      return _;
    });

    return attrs;
  }

  function attributesToHtml(attrs) {
    const orderedKeys = ["src", "alt", "href", "class", "width", "height", "style", "target", "rel", "title"];
    const keys = Object.keys(attrs);
    keys.sort(function (a, b) {
      const aIndex = orderedKeys.indexOf(a);
      const bIndex = orderedKeys.indexOf(b);
      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }
      if (aIndex === -1) {
        return 1;
      }
      if (bIndex === -1) {
        return -1;
      }
      return aIndex - bIndex;
    });

    return keys
      .map(function (key) {
        return " " + key + '="' + escapeAttribute(attrs[key]) + '"';
      })
      .join("");
  }

  function replaceEmojis(text) {
    return text.replace(/:([a-z0-9_+-]+):/g, function (match, name) {
      return emojiMap[name] || match;
    });
  }

  function renderInline(input) {
    let text = replaceEmojis(input);

    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)\{:\s*([^}]*)\}/g, function (_, label, href, attrRaw) {
      const attrs = parseAttributeBlock(attrRaw);
      attrs.href = href;
      if (attrs.target === "_blank" && !attrs.rel) {
        attrs.rel = "noopener noreferrer";
      }
      return "<a" + attributesToHtml(attrs) + ">" + label + "</a>";
    });

    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      return '<a href="' + escapeAttribute(href) + '">' + label + "</a>";
    });

    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
    text = text.replace(/\{:\s*[^}]*\}/g, "");

    return text;
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n?/g, "\n").trim().split("\n");
    const html = [];
    let paragraph = [];

    function flushParagraph() {
      if (paragraph.length === 0) {
        return;
      }
      html.push("<p>" + renderInline(paragraph.join(" ").trim()) + "</p>");
      paragraph = [];
    }

    for (let i = 0; i < lines.length; i += 1) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        continue;
      }

      if (/^<br\s*\/?>(?:\s*)$/i.test(line)) {
        flushParagraph();
        html.push("<p><br /></p>");
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        const level = headingMatch[1].length;
        html.push("<h" + level + ">" + renderInline(headingMatch[2].trim()) + "</h" + level + ">");
        continue;
      }

      const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{:\s*([^}]*)\})?$/);
      if (imageMatch) {
        flushParagraph();
        const attrs = parseAttributeBlock(imageMatch[3] || "");
        attrs.src = imageMatch[2];
        attrs.alt = imageMatch[1];
        html.push("<p><img" + attributesToHtml(attrs) + " /></p>");
        continue;
      }

      paragraph.push(rawLine);
    }

    flushParagraph();
    return html.join("\n\n");
  }

  function stripFrontMatter(md) {
    return md.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }

  document.querySelectorAll("[data-markdown-source]").forEach(function (sourceNode) {
    const container = sourceNode.closest(".post-content");
    if (!container) {
      return;
    }

    const target = container.querySelector("[data-markdown-target]");
    if (!target) {
      return;
    }

    const markdown = stripFrontMatter(sourceNode.textContent || "");
    target.innerHTML = renderMarkdown(markdown);
  });
})();
