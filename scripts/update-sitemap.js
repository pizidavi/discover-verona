const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { DOMParser, XMLSerializer } = require('xmldom');

async function main(args) {
  // Get the file path from the command-line arguments
  if (args.length !== 1) {
    console.error('Usage: node update-sitemap.js <path-to-sitemap.xml>');
    process.exit(1);
  }

  const sitemapPath = path.resolve(args[0]);

  // Read the sitemap.xml file
  const data = await fs.readFile(sitemapPath, 'utf8');

  // Parse the XML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Update all <lastmod> elements
  const lastmodElements = doc.getElementsByTagName('lastmod');
  for (let i = 0; i < lastmodElements.length; i++) {
    lastmodElements[i].textContent = currentDate;
  }

  // Serialize the updated XML back to a string
  const serializer = new XMLSerializer();
  const updatedXML = serializer.serializeToString(doc) + '\n';

  // Write the updated XML back to the file
  await fs.writeFile(sitemapPath, updatedXML, 'utf8');

  console.log(`${sitemapPath} updated successfully.`);

  // Add to git staging area
  exec(`git add ${sitemapPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error adding file to git: ${error.message}`);
      throw error;
    }
    if (stderr) {
      console.error(`Git stderr: ${stderr}`);
      throw new Error(`Git stderr: ${stderr}`);
    }
    console.log(`File added to git staging area: ${stdout}`);
  });
}

const argv = process.argv.slice(2);
main(argv).catch(err => {
  console.error('Error:', err);
  process.exit(2);
});
