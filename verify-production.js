const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server for production testing
const server = http.createServer((req, res) => {
  const publicDir = path.join(__dirname, 'dist', 'public');
  let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
  
  // Security check
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  // Set content type
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };
  
  const contentType = contentTypes[ext] || 'application/octet-stream';
  
  // Read and serve file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Production server running at http://localhost:${PORT}`);
  console.log('✅ Testing production build...');
  
  // Test if main files exist
  const testFiles = [
    'dist/public/index.html',
    'dist/public/assets/index-Cs2qUUen.js',
    'dist/public/assets/index-CmtxucEg.css'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
});