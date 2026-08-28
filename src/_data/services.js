const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: false, linkify: true });
const CONTENT_DIR = path.join(__dirname, "../../content/services");

module.exports = () => {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title,
      lede: data.lede,
      icon: data.icon,
      keyword: data.keyword,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      symptomsHtml: md.render(data.symptoms || ""),
      approachHtml: md.render(data.approach || ""),
      resultsHtml: md.render(data.results || ""),
      faq: data.faq || [],
      related: data.related || [],
    };
  });

  // Стабільний порядок — за оригінальним списком напрямків
  const order = [
    "tryvoga-panichni-ataky",
    "emotsiyne-vysnazhennya-stres",
    "travmatychnyy-dosvid",
    "kryzy-u-stosunkakh",
    "rozluchennya-vtrata-zminy",
    "rozlady-kharchovoi-povedinky",
    "samootsinka-pryynyattya-sebe",
    "adaptatsiya-pislya-pereizdu",
  ];
  items.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  return items;
};
