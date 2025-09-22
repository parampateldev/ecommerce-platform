import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`ecommerce-platform server running on http://localhost:${port}`);
});
EOF
npm i express cors >/dev/null; npm i -D nodemon >/dev/null; npm pkg set scripts.dev="nodemon src/index.js" >/dev/null
