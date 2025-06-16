const FirecrawlApp = require('@mendable/firecrawl-js').default;
const { default: slugify } = require("slugify");
const { writeToServerDocuments } = require("../utils/files");
const { v4 } = require("uuid");
const { tokenizeString } = require("../utils/tokenizer");

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function processLinkWithFirecrawl(link) {
  const api_key = process.env.FIRECRAWL_API_KEY;
  if (!api_key) {
    return { success: false, reason: "Missing Firecrawl API key.", documents: [] };
  }
  const app = new FirecrawlApp({ apiKey: api_key });
  try {
    const scrapeResult = await app.scrapeUrl(link, { formats: ['markdown'] });
    if (!scrapeResult.success) {
      return { success: false, reason: scrapeResult.error, documents: [] };
    }
    // You can adjust this to fit your document structure
    // const document = {
    //   url: link,
    //   title: scrapeResult.title || link,
    //   content_markdown: scrapeResult.markdown,
    // };
    // return { success: true, reason: null, documents: [document] };
    const url = new URL(link);
    const decodedPathname = decodeURIComponent(url.pathname);
    const filename = `${url.hostname}${decodedPathname.replace(/\//g, "_")}`;

    const data = {
      id: v4(),
      url: "file://" + slugify(filename) + ".html",
      title: slugify(filename) + ".html",
      docAuthor: "no author found",
      description: "No description found.",
      docSource: "URL link uploaded by the user.",
      chunkSource: `link://${link}`,
      published: new Date().toLocaleString(),
      wordCount: scrapeResult.markdown.split(" ").length,
      pageContent: scrapeResult.markdown,
      token_count_estimate: tokenizeString(scrapeResult.markdown),
    };
    const document = writeToServerDocuments(
      data,
      `url-${slugify(filename)}-${data.id}`
    );
    console.log(`[SUCCESS]: URL ${link} converted & ready for embedding.\n`);
  return { success: true, reason: null, documents: [document] };
  } catch (e) {
    return { success: false, reason: e.message, documents: [] };
  }
}

  

module.exports = {
  processLinkWithFirecrawl,
};