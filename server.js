import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import cron from 'node-cron';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    
    // Start Cron Jobs
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running daily invoice check cron job...');
      try {
        // We will call an internal API or write the DB logic directly here
        // For simplicity, we just trigger an internal API endpoint that does the logic
        const response = await fetch(`http://localhost:${port}/api/cron/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}` // Securing the endpoint
          }
        });
        
        const result = await response.json();
        console.log('Cron job completed:', result);
      } catch (error) {
        console.error('Cron job failed:', error);
      }
    });
  });
});
