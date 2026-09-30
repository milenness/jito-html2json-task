function convertHtml2JsonAndSet() {
  const htmlTextAreaValue = document.getElementById("html").value;
  const jsonObj = html2json(htmlTextAreaValue);
  const jsonArea = document.getElementById("json");
  jsonArea.textContent = JSON.stringify(jsonObj, null, 2);
}

/* 
  Update this function to convert html into json object.
  You can rewrite it completely, just be sure it accepts htmlText as string and outputs json object.
*/
function html2json(htmlText) {
  // Edge case: if input is not a string or empty
  if (typeof htmlText !== "string" || !htmlText.trim()) {
    return { type: "root", children: [] };
  }

  try {
    // Очищаємо HTML від коментарів та DOCTYPE
    let cleanHtml = htmlText
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<!DOCTYPE[^>]*>/gi, "");

    // Регулярний вираз для пошуку тегів та їхніх атрибутів
    const tagRegex = /<\s*(\/?)\s*([a-zA-Z0-9\-]+)([^>]*?)\s*(\/?)>/g;

    // Список тегів, які не потребують закриття (самозакривні)
    const voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    const root = { type: "root", children: [] };
    const stack = [root];

    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
      const [fullMatch, isClosing, tagName, attrsString, isSelfClosingSlash] =
        match;
      const lowerTagName = tagName.toLowerCase();

      // Записуємо текст між тегами, якщо він є
      const textContent = cleanHtml.slice(lastIndex, match.index).trim();
      if (textContent) {
        stack[stack.length - 1].children.push({
          type: "text",
          content: textContent,
        });
      }

      lastIndex = tagRegex.lastIndex;

      // Якщо це закриваючий тег (наприклад, </div>)
      if (isClosing) {
        let popCount = 0;
        for (let i = stack.length - 1; i >= 1; i--) {
          if (stack[i].tagName === lowerTagName) {
            popCount = stack.length - i;
            break;
          }
        }
        while (popCount > 0) {
          stack.pop();
          popCount--;
        }
        continue;
      }

      // Якщо це відкриваючий тег (наприклад, <div>)
      const element = {
        type: "element",
        tagName: lowerTagName,
        attributes: parseAttributes(attrsString),
        children: [],
      };

      stack[stack.length - 1].children.push(element);

      // Якщо тег не самозакривний, додаємо його в стек для подальшої вкладеності
      const isSelfClosing =
        isSelfClosingSlash || voidElements.has(lowerTagName);
      if (!isSelfClosing) {
        stack.push(element);
      }
    }

    // Записуємо залишок тексту після останнього тегу
    const remainingText = cleanHtml.slice(lastIndex).trim();
    if (remainingText) {
      stack[stack.length - 1].children.push({
        type: "text",
        content: remainingText,
      });
    }

    return root.children.length === 1 ? root.children[0] : root;
  } catch (error) {
    // Захист від падіння (MUST NOT crash)
    console.error("Error parsing HTML:", error);
    return {
      error: "Failed to parse HTML",
      message: error.message,
      fallbackRawData: htmlText,
    };
  }
}

/* Допоміжна функція для парсингу атрибутів тегу (наприклад, class="btn") */
function parseAttributes(attrsString) {
  const attrs = {};
  if (!attrsString.trim()) return attrs;

  const attrRegex =
    /([a-zA-Z\-0-9:]+)(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^>\s]+)))?/g;
  let match;

  while ((match = attrRegex.exec(attrsString)) !== null) {
    const key = match[1];
    const value = match[2] || match[3] || match[4] || "";
    attrs[key] = value;
  }

  return attrs;
}

// ==========================================
// ФУНКЦІЇ ПРИКЛАДІВ (Залишені без змін)
// ==========================================

function showExample1() {
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section of the webpage.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section of the webpage.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
`;
  document.getElementById("html").value = htmlExample;
}

function showExample2() {
  const htmlExample = `<div>
<p>Hello world!</p>
  <button>Click me!</button>
  <textarea>Some very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long string.</textarea>
</div>
`;
  document.getElementById("html").value = htmlExample;
}
