import { Router } from "express";
import { products } from "./data.js";

export const api = Router();

api.get("/products", (req, res) => {
  res.json(products);
});

api.post("/checkout", (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items provided" });
  }
  const itemMap = new Map(products.map(p => [p.id, p]));
  const total = items.reduce((sum, item) => {
    const p = itemMap.get(item.id);
    return sum + (p ? p.price * (item.quantity || 1) : 0);
  }, 0);
  // Simulate payment intent creation
  res.json({ clientSecret: "demo_secret", total });
});
