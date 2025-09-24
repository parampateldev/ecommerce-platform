import { useEffect, useMemo, useState } from 'react'
import './App.css'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutStep, setCheckoutStep] = useState('cart') // cart, shipping, payment, confirmation
  
  const total = useMemo(() =>
    Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(pr => pr.id === id)
      return sum + (p ? p.price * qty : 0)
    }, 0), [cart, products])

  const cartItems = useMemo(() => 
    Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id)
        return product ? { ...product, quantity: qty } : null
      })
      .filter(Boolean), [cart, products])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function addToCart(id) {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function updateQty(id, qty) {
    setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }))
  }

  function removeFromCart(id) {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[id]
      return newCart
    })
  }

  async function processCheckout() {
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([id, quantity]) => ({ id, quantity }))
    
    if (!items.length) return

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const data = await res.json()
      
      // Simulate successful checkout
      setCheckoutStep('confirmation')
      setCart({})
      
      // In a real app, you'd redirect to payment processor
      alert(`Order Total: ${formatPrice(data.total)}\n\nFor real orders, contact: parampateldev@gmail.com\nPayment via Zelle or Bank Transfer`)
    } catch (error) {
      alert('Checkout failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ElectronX...</p>
      </div>
    )
  }

  return (
    <div className="electronx-app">
      {/* Header */}
      <header className="store-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="store-logo">⚡ ElectronX</h1>
            <p className="store-tagline">Premium Electronics & Tech Solutions</p>
          </div>
          <div className="header-actions">
            <button 
              className="cart-button"
              onClick={() => setShowCart(!showCart)}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-count">{cartItems.length}</span>
              <span className="cart-total">{formatPrice(total)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Discover Premium Electronics</h2>
          <p>High-quality tech products with competitive prices and fast shipping</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat">
              <span className="stat-number">Free</span>
              <span className="stat-label">Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Handpicked electronics for every need</p>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-badge">Best Seller</div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">
                  <span className="current-price">{formatPrice(product.price)}</span>
                  <span className="original-price">{formatPrice(product.price * 1.3)}</span>
                  <span className="discount">Save 23%</span>
                </div>
                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                  <button className="wishlist-btn">♡</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Cart</h3>
              <button 
                className="close-cart"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>
            
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{formatPrice(item.price)}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button 
                      className="remove-item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total: {formatPrice(total)}</span>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={processCheckout}
                >
                  Proceed to Checkout
                </button>
                <p className="checkout-note">
                  For payment: parampateldev@gmail.com<br/>
                  Zelle or Bank Transfer accepted
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="store-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>ElectronX</h4>
            <p>Your trusted source for premium electronics</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: parampateldev@gmail.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h4>Payment Methods</h4>
            <p>Zelle • Bank Transfer • PayPal</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ElectronX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App