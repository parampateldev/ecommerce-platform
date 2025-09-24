import express from "express";
import cors from "cors";
import { api } from "./routes.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`ecommerce-platform server running on http://localhost:${port}`);
});
