import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const escapeXml = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
const sampleImage = (name, w=600, h=400) => {
  const title = escapeXml((name || 'No Image').slice(0,60));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='#f8f9fa'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='#6c757d'>${title}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const getBookImage = (img, name, w=600, h=400) => {
  if (img && (img.startsWith('http') || img.startsWith('data:'))) return img;
  return sampleImage(name,w,h);
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(`/api/books/${id}/`, { credentials: 'include' });
      if (res.ok) {
        setBook(await res.json());
      }
    };
    const fetchUser = async () => {
      const res = await fetch('/api/auth/user/', { credentials: 'include' });
      if (res.ok) setCurrentUser(await res.json());
    };
    fetchBook();
    fetchUser();
  }, [id]);

  const addToCart = async () => {
    const csrftoken = getCookie('csrftoken');
    const res = await fetch('/api/cart/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
      body: JSON.stringify({ book: id, quantity: 1 }),
    });
    if (res.ok) {
      alert('Added to cart!');
    } else {
      alert('Failed to add to cart');
    }
  };

  const buyBook = async () => {
    if (!currentUser) return alert('Please login to place an order.');
    if (!confirm('Place order for this book?')) return;
    try {
      const csrftoken = getCookie('csrftoken');
      const res = await fetch('/api/order/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body: JSON.stringify({ book: id, quantity: 1 }),
      });
      if (res.ok) {
        const body = await res.json().catch(() => null) || {};
        const recips = body.recipients ? body.recipients.join(', ') : 'seller';
        alert(`Order sent to: ${recips}. The seller will contact you.`);
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.detail || 'Failed to place order');
      }
    } catch (err) {
      console.error('Failed to place order', err);
      alert('Failed to place order');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this book?')) return;
    const csrftoken = getCookie('csrftoken');
    const res = await fetch(`/api/books/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrftoken || '' },
    });
    if (res.ok) navigate('/dashboard');
    else alert('Failed to delete');
  };

  const openContact = () => setShowContact(true);
  const closeContact = () => {
    setShowContact(false);
    setMessage('');
  };

  const sendContact = async () => {
    if (!message.trim()) return;
    const csrftoken = getCookie('csrftoken');
    const res = await fetch('/api/messages/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
      body: JSON.stringify({ book: id, message: message.trim() }),
    });
    if (res.ok) {
      alert('Message sent!');
      closeContact();
    } else {
      alert('Failed to send message');
    }
  };

  const isOwner = currentUser && book && currentUser.id === book.owner?.id;

  if (!book) {
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
        <div className="row">
          <div className="col-lg-6 mb-4">
            <img src={getBookImage(book.image, book.name, 600, 400)} onError={(e)=>{e.target.onerror=null; e.target.src = getBookImage(null, book.name, 600, 400)}} className="img-fluid rounded shadow" alt={book.name} />
          </div>
          <div className="col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <h1 className="card-title fw-bold">{book.name}</h1>
                <p className="text-muted mb-2">by {book.author}</p>
                <p className="mb-2"><strong>Category:</strong> {book.category}</p>
                <p className="mb-2"><strong>Condition:</strong> <span className="badge bg-secondary text-capitalize">{book.condition}</span></p>
                <p className="mb-3"><strong>Price:</strong> <span className="h4 text-success">₹{book.price}</span></p>
                <p className="mb-4">{book.description}</p>

                <hr />
                <h5 className="mb-3">Seller Information</h5>
                {book.owner ? (
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><i className="bi bi-person-circle me-2"></i><strong>{book.owner.username}</strong></p>
                    {book.owner.email && <p className="mb-1"><i className="bi bi-envelope me-2"></i>{book.owner.email}</p>}
                    {book.owner.phone && <p className="mb-0"><i className="bi bi-phone me-2"></i>{book.owner.phone}</p>}
                  </div>
                ) : <p className="text-muted">Seller info not available</p>}

                <div className="mt-4 d-flex gap-2 flex-wrap">
                  {!isOwner && (
                    <>
                      <button className="btn btn-success btn-lg" onClick={buyBook}>
                        <i className="bi bi-cart me-2"></i>Buy Now
                      </button>
                      <button className="btn btn-warning btn-lg" onClick={addToCart}>
                        <i className="bi bi-cart-plus me-2"></i>Add to Cart
                      </button>
                    </>
                  )}
                  <button className="btn btn-primary btn-lg" onClick={openContact}>
                    <i className="bi bi-chat-dots me-2"></i>Contact Seller
                  </button>
                  {isOwner && (
                    <>
                      <Link to={`/book/${id}/edit`} className="btn btn-secondary btn-lg">
                        <i className="bi bi-pencil me-2"></i>Edit
                      </Link>
                      <button onClick={handleDelete} className="btn btn-danger btn-lg">
                        <i className="bi bi-trash me-2"></i>Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContact && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-envelope me-2"></i>Contact Seller</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeContact}></button>
              </div>
              <div className="modal-body">
                <p>Send a message to <strong>{book.owner?.username}</strong></p>
                <div className="mb-3">
                  <label className="form-label">Your Message</label>
                  <textarea className="form-control" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your message here..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeContact}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={sendContact}>
                  <i className="bi bi-send me-2"></i>Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
