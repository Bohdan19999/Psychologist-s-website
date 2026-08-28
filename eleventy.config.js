const SITE = require("./src/_data/site.js");

function ldScript(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj, null, 2)}</script>`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ admin: "admin" });

  // редагування контенту через /admin відбувається поза src/, тож Eleventy
  // під час `--serve` має також стежити за цими файлами
  eleventyConfig.addWatchTarget("content");

  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));

  eleventyConfig.addShortcode("personJsonLd", () =>
    ldScript({
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.name,
      jobTitle: "Психолог",
      url: SITE.domain,
      image: SITE.domain + "/assets/img/valentyna-svatkova.jpg",
      address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "UA" },
      sameAs: [SITE.instagram, SITE.facebook, SITE.telegramUrl],
    })
  );

  eleventyConfig.addShortcode("serviceJsonLd", () =>
    ldScript({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `${SITE.name} — психолог у ${SITE.city}`,
      image: SITE.domain + "/assets/img/logo.png",
      url: SITE.domain,
      telephone: SITE.phoneDisplay,
      email: SITE.email,
      priceRange: "₴₴",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address,
        addressLocality: SITE.city,
        addressCountry: "UA",
      },
      areaServed: ["Україна", "Європа"],
      sameAs: [SITE.instagram, SITE.facebook, SITE.telegramUrl],
    })
  );

  eleventyConfig.addShortcode("breadcrumbJsonLd", (trail) =>
    ldScript({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.label,
        item: SITE.domain + (t.href || "#"),
      })),
    })
  );

  eleventyConfig.addShortcode("faqJsonLd", (items) =>
    ldScript({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (items || []).map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    })
  );

  eleventyConfig.addShortcode("blogPostingJsonLd", (post, url) =>
    ldScript({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.dateIso,
      author: { "@type": "Person", name: SITE.name },
      image: SITE.domain + "/assets/img/og-image.jpg",
      mainEntityOfPage: SITE.domain + url,
    })
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
