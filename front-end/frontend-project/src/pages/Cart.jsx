import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch cart:', res.status, res.statusText);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
    setLoading(false);
  };

  const removeFromCart = async (id) => {
    const csrftoken = getCookie('csrftoken');
    const res = await fetch(`/api/cart/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrftoken || '' },
    });
    if (res.ok) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      alert('Failed to remove item');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    if (!item.book || !item.book.price) return sum;
    return sum + (item.book.price * item.quantity);
  }, 0);

  console.log('Cart component rendered, loading:', loading, 'cartItems length:', cartItems.length, 'totalPrice:', totalPrice);

  if (loading) {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/dashboard">
              <i className="bi bi-book-fill me-2"></i>EduReuse
            </Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/dashboard"><i className="bi bi-arrow-left me-1"></i>Back to Dashboard</Link>
            </div>
          </div>
        </nav>
        <div className="container mt-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/dashboard">
            <i className="bi bi-book-fill me-2"></i>EduReuse
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/dashboard"><i className="bi bi-arrow-left me-1"></i>Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h1 className="mb-4"><i className="bi bi-cart me-2"></i>My Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center">
            <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
            <h3 className="text-muted">Your cart is empty</h3>
            <Link to="/dashboard" className="btn btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div>
            <div className="row">
              {cartItems.map(item => (
                item.book ? (
                  <div key={item.id} className="col-md-12 mb-3">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-2">
                            <img src={item.book.image || 'https://via.placeholder.com/100x100?text=No+Image'} className="img-fluid rounded" alt={item.book.name} />
                          </div>
                          <div className="col-md-6">
                            <h5 className="card-title">{item.book.name}</h5>
                            <p className="card-text text-muted">by {item.book.author}</p>
                            <p className="card-text">Quantity: {item.quantity}</p>
                          </div>
                          <div className="col-md-2">
                            <p className="h5 text-success">₹{item.book.price * item.quantity}</p>
                          </div>
                          <div className="col-md-2">
                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                              <i className="bi bi-trash me-1"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4>Total: ₹{totalPrice}</h4>
                      <button className="btn btn-success btn-lg">
                        <i className="bi bi-credit-card me-2"></i>Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}