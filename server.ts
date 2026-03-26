import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-change-this";
const PORT = 3000;

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: 'admin' | 'worker' };
}

async function startServer() {
  const app = express();

  // Database setup
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      displayName TEXT,
      photoURL TEXT,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT,
      description TEXT,
      category TEXT,
      frequency TEXT,
      lastDone TEXT,
      nextDue TEXT,
      expiryTime TEXT,
      status TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      taskId INTEGER,
      taskTitle TEXT,
      completedAt TEXT,
      notes TEXT,
      cost REAL,
      completedBy INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(completedBy) REFERENCES users(id)
    );
  `);

  // Migration: Ensure role column exists
  try {
    await db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'");
  } catch (e) {}

  // Migration: Ensure expiryTime column exists
  try {
    await db.exec("ALTER TABLE tasks ADD COLUMN expiryTime TEXT");
  } catch (e) {}

  // Migration: Ensure address and contactDetails columns exist
  try {
    await db.exec("ALTER TABLE tasks ADD COLUMN address TEXT");
  } catch (e) {}
  try {
    await db.exec("ALTER TABLE tasks ADD COLUMN contactDetails TEXT");
  } catch (e) {}

  // Migration: Ensure completedBy column exists
  try {
    await db.exec("ALTER TABLE history ADD COLUMN completedBy INTEGER");
  } catch (e) {}

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, displayName, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        "INSERT INTO users (email, password, displayName, role) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, displayName, role || 'admin']
      );
      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      uid: user.id.toString(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const user = await db.get("SELECT id, email, displayName, photoURL, role FROM users WHERE id = ?", [req.user?.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      uid: user.id.toString(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
    });
  });

  // Task Routes
  app.get("/api/tasks", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      let tasks;
      if (req.user?.role === 'worker') {
        // Workers see all tasks
        tasks = await db.all("SELECT * FROM tasks ORDER BY nextDue ASC");
      } else {
        // Admins see only their tasks
        tasks = await db.all("SELECT * FROM tasks WHERE userId = ? ORDER BY nextDue ASC", [req.user?.id]);
      }
      res.json(tasks.map(t => ({ ...t, id: t.id.toString(), uid: t.userId.toString() })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { title, description, category, frequency, nextDue, expiryTime, address, contactDetails, status } = req.body;
      const result = await db.run(
        "INSERT INTO tasks (userId, title, description, category, frequency, nextDue, expiryTime, address, contactDetails, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.user?.id, title, description, category, frequency, nextDue, expiryTime, address, contactDetails, status]
      );
      res.status(201).json({ id: result.lastID?.toString() });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/tasks/:id", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { title, description, category, frequency, lastDone, nextDue, expiryTime, address, contactDetails, status } = req.body;
      
      if (req.user?.role === 'worker') {
        // Workers can only update status and lastDone
        await db.run(
          "UPDATE tasks SET status = ?, lastDone = ?, nextDue = ? WHERE id = ?",
          [status, lastDone, nextDue, req.params.id]
        );
      } else {
        await db.run(
          "UPDATE tasks SET title = ?, description = ?, category = ?, frequency = ?, lastDone = ?, nextDue = ?, expiryTime = ?, address = ?, contactDetails = ?, status = ? WHERE id = ? AND userId = ?",
          [title, description, category, frequency, lastDone, nextDue, expiryTime, address, contactDetails, status, req.params.id, req.user?.id]
        );
      }
      res.json({ message: "Task updated" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/tasks/:id", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      await db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [req.params.id, req.user?.id]);
      res.json({ message: "Task deleted" });
    } catch (error) {
      next(error);
    }
  });

  // History Routes
  app.get("/api/history", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const history = await db.all(`
        SELECT h.*, u.displayName as completedBy 
        FROM history h 
        LEFT JOIN users u ON h.completedBy = u.id 
        WHERE h.userId = ? 
        ORDER BY h.completedAt DESC
      `, [req.user?.id]);
      res.json(history.map(h => ({ ...h, id: h.id.toString(), uid: h.userId.toString(), taskId: h.taskId.toString() })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/history", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const { taskId, taskTitle, completedAt, notes, cost } = req.body;
      
      let ownerId = req.user?.id;
      
      // If a taskId is provided, associate the history with the task's owner
      if (taskId) {
        const task = await db.get("SELECT userId FROM tasks WHERE id = ?", [taskId]);
        if (task) {
          ownerId = task.userId;
        }
      }

      const result = await db.run(
        "INSERT INTO history (userId, taskId, taskTitle, completedAt, notes, cost, completedBy) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [ownerId, taskId, taskTitle, completedAt, notes, cost, req.user?.id]
      );
      res.status(201).json({ id: result.lastID?.toString() });
    } catch (error) {
      next(error);
    }
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

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
