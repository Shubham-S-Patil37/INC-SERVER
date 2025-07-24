import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db/connection";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";
import uploadRoutes from "./routes/uploadRoutes";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.static(__dirname + "/"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Connect to MongoDB
db.connect().catch(console.error);

// Routes
app.use("/api", userRoutes);
app.use("/api", taskRoutes);
app.use("/api", uploadRoutes);

app.get("/testEndPoint", function (req, res) {
  var response = { response: "test endpoint" };
  res.json(response);
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`🚀 theBox Running at port: ${port}`);
  console.log(
    `📖 API Documentation available at: http://localhost:${port}/api`
  );
});
