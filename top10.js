const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

// Function to perform Google search and get top 10 URLs
async function getTop10GoogleResults(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Perform Google search
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl);
  
  // Wait for the results to load and display the results
  await page.waitForSelector('h3'); // Wait for the results to show up

  // Extract the top 10 results
  const links = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('h3'); // Select titles of the search results
    items.forEach(item => {
      const parent = item.parentElement;
      if (parent && parent.href) {
        results.push(parent.href);
      }
    });
    return results.slice(0, 10); // Return only the top 10 URLs
  });

  await browser.close();
  return links;
}

const scrapeWebsite = async (url) => {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content') || 'No description available';
      const keywords = $('meta[name="keywords"]').attr('content') || extractKeywordsFromContent($); // If keywords not found, use content-based extraction
  
      return { title, description, keywords };
    } catch (error) {
      console.error('Error scraping website:', error);
      return null;
    }
  };
  
  // Fallback function to extract keywords from page content
  const extractKeywordsFromContent = ($) => {
    const bodyText = $('body').text(); // Get body content
    const words = bodyText.split(/\W+/); // Split content by non-word characters
    const frequencyMap = {};
  
    // Build word frequency map
    words.forEach((word) => {
      if (word.length > 3) { // Exclude short words
        frequencyMap[word] = (frequencyMap[word] || 0) + 1;
      }
    });
  
    // Sort words by frequency
    const sortedWords = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a]);
    return sortedWords.slice(0, 10).join(', '); // Return top 10 most frequent words
  };
  

// Main function to search for furniture trends and scrape the top websites
async function searchAndScrape(query) {
  console.log(`Searching for top websites for: "${query}"`);

  const top10Urls = await getTop10GoogleResults(query);

  console.log('Top 10 URLs:');
  console.log(top10Urls);

  for (const url of top10Urls) {
    console.log(`\nScraping: ${url}`);
    const metadata = await scrapeWebsite(url);
    if (metadata) {
      console.log(`Title: ${metadata.title}`);
      console.log(`Description: ${metadata.description}`);
      console.log(`Keywords: ${metadata.keywords}`);
    }
  }
}

// Run the search and scrape function for the keyword "furniture trends 2024"
searchAndScrape('furniture trends 2024');
