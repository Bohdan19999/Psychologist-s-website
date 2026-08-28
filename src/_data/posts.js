const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: false, linkify: true });
const CONTENT_DIR = path.join(__dirname, "../../content/posts");

module.exports = () => {
  const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md")) : [];

  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const date = new Date(data.date);
    return {
      slug,
      title: data.title,
      date,
      dateDisplay: date.toLocaleDateString("uk-UA", { year: "numeric", month: "long", day: "numeric" }),
      dateIso: date.toISOString().slice(0, 10),
      tag: data.tag || "",
      readingTime: data.readingTime || "5 хв читання",
      seoDescription: data.seo_description || "",
      cover: data.cover || null,
      bodyHtml: md.render(content || ""),
      faq: data.faq || [],
      relatedServices: data.related_services || [],
    };
  });

  items.sort((a, b) => b.date - a.date);
  return items;
};
