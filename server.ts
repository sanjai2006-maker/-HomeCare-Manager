import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import schedule from "node-schedule";
import cors from "cors";
import helmet from "helmet";

// In a real app, we'd use firebase-admin here to check tasks and send emails/notifications.
// For this demo, we'll simulate the scheduler logic that would run on the server.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development convenience with Vite
  }));
  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "House Maintenance System API is running" });
  });

  // Simulation of a background task scheduler
  // This would typically query Firestore for tasks due soon and send alerts
  schedule.scheduleJob("0 0 * * *", () => {
    console.log("Running daily maintenance check...");
    // Logic to find tasks where nextDue <= today + 3 days and mark as 'urgent'
    // Or send email reminders via SendGrid/Nodemailer
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
