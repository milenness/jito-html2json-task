# Jito Software Development Intern Task - html2json

A custom HTML to JSON parser built with vanilla JavaScript. This solution strictly adheres to the core requirement: **no DOM parsers are used** (such as `DOMParser`, `jsdom`, or `cheerio`). 

## Architecture & JSON Structure

I chose to represent the parsed HTML as an **Abstract Syntax Tree (AST)**. Since HTML is inherently hierarchical, a tree-like JSON structure is the most logical and scalable way to represent it. 

Each node in the JSON output follows this predictable schema:

{
  "type": "element", 
  "tagName": "div",
  "attributes": { "class": "container" },
  "children": [] 
}

*Plain text is separated into its own node type (`{"type": "text", "content": "..."}`) to easily distinguish it from HTML elements.*

## Parsing Approach (Stack-based Tokenizer)

Parsing HTML with a single, massive Regular Expression is a known anti-pattern because HTML is not a regular language (it has nested, recursive structures). Instead, I implemented a **Stack-based Tokenizer**:

1. **Tokenization:** A targeted RegEx is used merely to identify tags (opening, closing, attributes) and step through the string sequentially.
2. **The Stack:** As the algorithm finds opening tags, it pushes them onto an array (the stack). 
3. **Nesting:** Any text or nested child elements found are pushed into the `children` array of the element currently at the top of the stack.
4. **Closing:** When a closing tag is encountered, the algorithm pops the element off the stack, preserving the correct hierarchical tree.

## Robustness & Edge Cases (MUST NOT crash)

To meet the strict "MUST NOT crash" requirement and anticipate unpredictable inputs, the following safeguards were implemented:

* **Malformed / Unclosed Tags:** If the parser encounters a missing closing tag (e.g., an unclosed `<p>` followed by a `<span>`), the stack algorithm searches backward to safely close the appropriate tags without infinite loops or memory leaks.
* **Void / Self-Closing Elements:** The parser references a `Set` of HTML void elements (like `<img>`, `<br>`, `<meta>`) so it knows not to push them to the stack, preventing them from improperly swallowing subsequent elements.
* **Irregular Attributes:** The attribute parsing logic handles double quotes (`class="btn"`), single quotes (`class='btn'`), and unquoted attributes (`src=no-quotes-attr`).
* **Ultimate Fallback:** The entire parsing block is wrapped in a `try...catch`. In the absolute worst-case scenario where an unexpected error occurs, the function gracefully returns a standardized JSON error object containing the raw fallback data, ensuring the application never crashes.

## Repository Structure

* `html2json.js` — The core logic containing the custom parser and attribute helper.
* `html_samples/` — A directory containing testing files (`01_simple.html`, `02_complex.html`, `03_broken.html`) used to verify edge cases and deeply nested structures.

---
**Author:** Milena Karpenko