const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: false, linkify: true });
const CONTENT_DIR = path.join(__dirname, "../../content/pages");

module.exports = () => {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const result = {};

  for (const file of files) {
    const key = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    result[key] = {
      ...data,
      bodyHtml: md.render(content || ""),
    };
  }

  return result;
};
