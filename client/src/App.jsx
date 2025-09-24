import { useEffect, useMemo, useState } from 'react'
import './App.css'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const total = useMemo(() =>
    Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(pr => pr.id === id)
      return sum + (p ? p.price * qty : 0)
    }, 0), [cart, products])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(console.error)
  }, [])

  function addToCart(id) {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function updateQty(id, qty) {
    setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }))
  }

  async function checkout() {
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([id, quantity]) => ({ id, quantity }))
    if (!items.length) return
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    })
    const data = await res.json()
    alert(`Checkout total: ${formatPrice(data.total)}`)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>E‑Commerce Demo</h1>
      <p style={{ color: '#64748b' }}>React + Express. Add items and checkout (demo only).</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: '#0f172a', margin: '0.25rem 0' }}>{formatPrice(p.price)}</div>
              <button onClick={() => addToCart(p.id)} className="btn">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Cart</h2>
      {Object.keys(cart).length === 0 && <p>No items yet.</p>}
      {Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
        const p = products.find(pr => pr.id === id)
        if (!p) return null
        return (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.5rem 0' }}>
            <div style={{ width: 120 }}>{p.name}</div>
            <input type="number" min={0} value={qty} onChange={e => updateQty(id, Number(e.target.value))} />
            <div>{formatPrice(p.price * qty)}</div>
          </div>
        )
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ fontWeight: 700 }}>Total: {formatPrice(total)}</div>
        <button className="btn" onClick={checkout} disabled={total === 0}>Checkout</button>
      </div>
    </div>
  )
}

export default App
