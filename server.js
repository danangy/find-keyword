const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public')); // Serve static files from "public" directory
app.use(express.json()); // To parse JSON bodies

// Serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to handle scraping request
app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            let metaData = {};

            // Find all meta tags and extract information
            $('meta').each((i, el) => {
                const nameAttr = $(el).attr('name');
                const propertyAttr = $(el).attr('property');
                const contentAttr = $(el).attr('content');

                if (contentAttr) {
                    // Check for keywords
                    if (nameAttr && nameAttr.toLowerCase().includes('keyword')) {
                        metaData['keywords'] = contentAttr;
                    }

                    // Check for description
                    if (nameAttr && nameAttr.toLowerCase().includes('description')) {
                        metaData['description'] = contentAttr;
                    }

                    // Check for author
                    if (nameAttr && nameAttr.toLowerCase().includes('author')) {
                        metaData['author'] = contentAttr;
                    }

                    // Check for Open Graph properties like og:title, og:description, etc.
                    if (propertyAttr && propertyAttr.toLowerCase().startsWith('og:')) {
                        const ogKey = propertyAttr.replace('og:', 'og_');
                        metaData[ogKey] = contentAttr;
                    }
                }
            });

            // Handle missing keywords
            if (!metaData['keywords']) {
                // Attempt to generate keywords from the content as a fallback
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
                const fallbackKeywords = sortedWords.slice(0, 10).join(', '); // Use top 10 frequent words as fallback keywords

                metaData['keywords'] = fallbackKeywords;
            }

            // Output the results
            if (Object.keys(metaData).length > 0) {
                res.json({ success: true, metaData });
            } else {
                res.json({ success: false, message: 'No relevant meta tags found on this page.' });
            }
        } else {
            res.status(response.status).json({ success: false, message: `Failed to retrieve the webpage. Status code: ${response.status}` });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(chalk.greenBright(`[ SERVER ] Server is running on http://localhost:${PORT}`));
});
