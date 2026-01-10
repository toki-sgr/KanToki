import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to handle file system operations
const shipDataServer = () => ({
  name: 'ship-data-server',
  configureServer(server) {
    server.middlewares.use('/api/ships', (req, res, next) => {
      const shipsPath = path.resolve(__dirname, 'data/ships.json');

      if (req.method === 'GET') {
        try {
          if (fs.existsSync(shipsPath)) {
            const data = fs.readFileSync(shipsPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'ships.json not found' }));
          }
        } catch (e) {
          console.error("Error reading ships.json", e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to read data' }));
        }
      } else if (req.method === 'POST') { // Handle POST to /api/ships (or can be specific /save-ships)
        // Body parsing manual for simple middleware
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            // Verify JSON
            const jsonBody = JSON.parse(body);
            fs.writeFileSync(shipsPath, JSON.stringify(jsonBody, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            console.error("Error writing ships.json", e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to write data' }));
          }
        });
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), shipDataServer()],
})

