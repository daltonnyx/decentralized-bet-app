const http = require('http');
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
// MIME types for different file extensions

dotenv.config();
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Default to serving the index.html file for the root path
  let filePath = req.url === '/' ? 'index.html' : `.${req.url}`;

  // Determine file extension
  if (req.url == "/games") {
    const responseData = await loadGames();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData), 'utf-8');
  } else {
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    // Check if file exists and serve it
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // File not found
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>', 'utf-8');
        } else {
          // Some server error
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        // Success - serve the file
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

// Start server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

async function loadGames() {
  const myHeaders = new Headers();
  myHeaders.append("X-Auth-Token", process.env.FOOTBALL_API_KEY);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const currentDate = getCurrentDate();
  const nextMonthDate = getCurrentDate(0, 1);
  const response = await fetch(`http://api.football-data.org/v4/competitions/2021/matches?season=2024&dateFrom=${currentDate}&dateTo=${nextMonthDate}`, requestOptions)
  const result = await response.json();
  return result;
}

const getCurrentDate = (dayOffset = 0, monthOffset = 0) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + monthOffset + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate() + dayOffset).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
