import {describe, expect, it} from "vitest";
import {ARTICLE_FIXTURES, PAGE_CONTENT_FIXTURES,} from "@/data/fixtures/content";
import {editorialCatalog, getEditorial, goldenLeafTitle,} from "@/i18n/editorial";
import {
    localizeArticle,
    localizeArticleSummary,
    localizePageContent,
    matchesEditorialSearch,
} from "@/i18n/editorial-content";
import {locales} from "@/i18n/locales";

describe("editorial localization", () => {
  it("has complete messages and preserves provisional status in all eleven locales", () => {
    expect(Object.keys(editorialCatalog)).toHaveLength(11);
    for (const { code } of locales) {
      const copy = getEditorial(code);
      expect(Object.keys(copy).sort()).toEqual(
        Object.keys(editorialCatalog.en).sort(),
      );
      expect(
        Object.values(copy).every((value) => value.trim().length > 0),
      ).toBe(true);
      const article = localizeArticle(ARTICLE_FIXTURES[0]!, code);
      expect(article.body[0]?.text).toBe(`[${copy.contentRequired}]`);
      expect(article.slug).toBe("foundation-update");
      expect(article.title).toBe(copy.articleTitle);
      expect(
        localizePageContent(PAGE_CONTENT_FIXTURES[0]!, code).metadata.seo.title,
      ).toBe(copy.about);
    }
  });

  it("leaves repository records intact and does not replace new approved copy", () => {
    const source = ARTICLE_FIXTURES[0]!;
    const approved = {
      ...source,
      title: "Approved title",
      excerpt: "Approved excerpt",
      body: [{ type: "PARAGRAPH" as const, text: "Approved body" }],
      seo: { title: "Approved SEO", description: "Approved description" },
    };
    expect(localizeArticle(approved, "ja")).toEqual(approved);
    expect(localizeArticle(source, "en")).toBe(source);
    expect(source.title).toBe("[WORKING COPY] Foundation update");
    expect(source.body[0]?.text).toBe("[CONTENT REQUIRED]");
  });

  it("searches localized words, accents, case and full-width input", () => {
    const french = localizeArticleSummary(ARTICLE_FIXTURES[0]!, "fr");
    expect(matchesEditorialSearch(french.title, "MISE À JOUR", "fr")).toBe(
      true,
    );
    expect(matchesEditorialSearch("Actualización", "actualizacion", "es")).toBe(
      true,
    );
    expect(matchesEditorialSearch("Tree of Unity", "ＴＲＥＥ", "ja")).toBe(
      true,
    );
    expect(matchesEditorialSearch("基礎架構更新", "架構", "zh-Hant")).toBe(
      true,
    );
    expect(matchesEditorialSearch("تحديث الأساس", "تحديث", "ar")).toBe(true);
    expect(matchesEditorialSearch(french.title, "unrelated", "fr")).toBe(false);
  });

  it("formats visible leaf identities with the selected locale without changing the canonical key", () => {
    expect(goldenLeafTitle("en", 1000)).toBe("Golden Leaf #1000");
    expect(goldenLeafTitle("ar", 1000)).toContain("١٠٠٠");
  });
});
