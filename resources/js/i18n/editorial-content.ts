import {ARTICLE_FIXTURES, PAGE_CONTENT_FIXTURES,} from "@/data/fixtures/content";
import type {ArticleDetail, ArticleSummary, ContentBlock, PageContent,} from "@/domain/content/content";
import {getEditorial} from "@/i18n/editorial";
import type {Locale} from "@/i18n/locales";

// Translate only known fixture fields; future approved repository content remains authoritative.
function localizeBlocks(
  blocks: readonly ContentBlock[],
  locale: Locale,
): readonly ContentBlock[] {
  return blocks.map((block) =>
    block.text === "[CONTENT REQUIRED]"
      ? { ...block, text: `[${getEditorial(locale).contentRequired}]` }
      : block,
  );
}

export function localizeArticleSummary(
  article: ArticleSummary,
  locale: Locale,
): ArticleSummary {
  const fixture = ARTICLE_FIXTURES.find((entry) => entry.slug === article.slug);
  if (!fixture || locale === "en") return article;
  const copy = getEditorial(locale);
  return {
    ...article,
    title: article.title === fixture.title ? copy.articleTitle : article.title,
    excerpt:
      article.excerpt === fixture.excerpt
        ? copy.articleExcerpt
        : article.excerpt,
  };
}

export function localizeArticle(
  article: ArticleDetail,
  locale: Locale,
): ArticleDetail {
  const fixture = ARTICLE_FIXTURES.find((entry) => entry.slug === article.slug);
  if (!fixture || locale === "en") return article;
  const copy = getEditorial(locale);
  return {
    ...article,
    ...localizeArticleSummary(article, locale),
    body: localizeBlocks(article.body, locale),
    seo: {
      title:
        article.seo.title === fixture.seo.title
          ? copy.articleTitle
          : article.seo.title,
      description:
        article.seo.description === fixture.seo.description
          ? copy.articleDescription
          : article.seo.description,
    },
  };
}

export function localizePageContent(
  page: PageContent,
  locale: Locale,
): PageContent {
  const fixture = PAGE_CONTENT_FIXTURES.find(
    (entry) => entry.metadata.key === page.metadata.key,
  );
  if (!fixture || locale === "en") return page;
  const copy = getEditorial(locale);
  return {
    ...page,
    blocks: localizeBlocks(page.blocks, locale),
    metadata: {
      ...page.metadata,
      seo: {
        title:
          page.metadata.seo.title === fixture.metadata.seo.title
            ? copy.about
            : page.metadata.seo.title,
        description:
          page.metadata.seo.description === fixture.metadata.seo.description
            ? copy.aboutDescription
            : page.metadata.seo.description,
      },
    },
  };
}

export function matchesEditorialSearch(
  text: string,
  query: string,
  locale: Locale,
): boolean {
  const haystack = Array.from(text.normalize("NFKC").toLocaleLowerCase(locale));
  const needle = query.normalize("NFKC").toLocaleLowerCase(locale);
  if (haystack.join("").includes(needle)) return true;
  const collator = new Intl.Collator(locale, {
    usage: "search",
    sensitivity: "base",
  });
  const width = Array.from(needle).length;
  return haystack.some(
    (_, index) =>
      collator.compare(
        haystack.slice(index, index + width).join(""),
        needle,
      ) === 0,
  );
}
