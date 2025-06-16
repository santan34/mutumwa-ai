const FirecrawlApp = require('@mendable/firecrawl-js').default;
const { v4 } = require("uuid");
const { writeToServerDocuments } = require("../utils/files");
const { tokenizeString } = require("../utils/tokenizer");
const { default: slugify } = require("slugify");

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function processCrawl(link, limit) {
  const api_key = process.env.FIRECRAWL_API_KEY;
  if (!api_key) {
    return { success: false, reason: "Missing Firecrawl API key.", documents: [] };
  }
  const appFirecrawl = new FirecrawlApp({ apiKey: api_key });
  try {
    const crawlResponse = await appFirecrawl.crawlUrl(link, {
      limit,
      scrapeOptions: { formats: ['markdown'] },
    });

    if (!crawlResponse.success) {
      return { success: false, reason: crawlResponse.error, documents: [] };
    }

    if (!Array.isArray(crawlResponse.data)) {
      return { success: false, reason: "No data returned from crawl.", documents: [] };
    }

    const documents = crawlResponse.data.map(page => {
      const filename = slugify((page.metadata?.title) || "untitled");
      const content = page.markdown || page.html || "";
      const data = {
        id: v4(),
        url: page.metadata?.url || link,
        title: page.metadata?.title || filename,
        docAuthor: page.metadata?.author || "no author found",
        description: page.metadata?.description || "No description found.",
        docSource: "Crawled via Firecrawl.",
        chunkSource: `crawl://${page.metadata?.url || link}`,
        published: new Date().toLocaleString(),
        wordCount: content.split(" ").length,
        pageContent: content,
        token_count_estimate: tokenizeString(content),
      };
      return writeToServerDocuments(
        data,
        `crawl-${filename}-${data.id}`
      );
    });

    return { success: true, reason: null, documents };
  } catch (e) {
    return { success: false, reason: e.message, documents: [] };
  }
}

module.exports = { processCrawl };
