const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');

async function scrapeMetaTags(url) {
    try {
        // Make a GET request to fetch the HTML of the website
        const response = await axios.get(url);

        if (response.status === 200) {
            // Load the HTML into Cheerio
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

            // Output the results
            if (Object.keys(metaData).length > 0) {
                console.log(chalk.greenBright('[ PROCESS ] ') + chalk.yellowBright('Meta information found:'));
                console.log(metaData);
            } else {
                console.log(chalk.redBright('[ WARNING ] ') + chalk.yellow('No meta tags with keywords, description, or Open Graph properties found.'));
            }
        } else {
            console.log(chalk.redBright('[ ERROR ] ') + `Failed to retrieve the webpage. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(chalk.redBright('[ ERROR ] ') + `An error occurred: ${error.message}`);
    }
}

// Ask the user to input the URL with chalk for colored prompt
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question(chalk.blueBright('Enter the URL of the website: '), url => {
    scrapeMetaTags(url);
    readline.close();
});
