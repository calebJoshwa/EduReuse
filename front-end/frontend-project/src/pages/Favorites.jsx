import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const escapeXml = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
const sampleImage = (name, w=300, h=200) => {
  const title = escapeXml((name || 'No Image').slice(0,40));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><rect width='100%' height='100%' fill='#f8f9fa'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='18' fill='#6c757d'>${title}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getBookImage = (img, name, w=300, h=200) => {
  if (img && (img.startsWith('http') || img.startsWith('data:'))) return img;
  return sampleImage(name,w,h);
};

export default function Favorites () {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user/', { credentials: 'include' });
        if (res.ok) {
          setUser(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  // fetch favorites for the current user and expose logs for debugging
  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites/', { credentials: 'include' });
      console.log('GET /api/favorites/ status=', res.status);
      const data = await res.json().catch(() => null);
      console.log('GET /api/favorites/ body=', data);

      // Accept different shapes: array, paginated {results: []}, or a single favorite object
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
      } else if (data && data.book) {
        list = [data];
      }

      if (list.length > 0) {
        setFavorites(list);
      } else {
        setFavorites([]);
        if (!res.ok) console.error('Failed to fetch favorites', res.status, data);
      }
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
    // listen for favorites changed events to refresh list automatically
    const onFavChanged = () => fetchFavorites();
    window.addEventListener('favorites:changed', onFavChanged);
    return () => window.removeEventListener('favorites:changed', onFavChanged);
  }, [user]);

  const toggleFavorite = async (bookId) => {
    const existingFav = favorites.find(f => f.book.id === bookId);
    if (!existingFav) return;
    try {
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      const res = await fetch(`/api/favorites/${existingFav.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      if (res.ok) {
        setFavorites(favorites.filter(f => f.id !== existingFav.id));
      }
    } catch (err) {
      console.error('Failed to remove favorite', err);
    }
  };

  const buyBook = async (bookId) => {
    try {
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      const res = await fetch('/api/order/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body: JSON.stringify({ book: bookId, quantity: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const body = data || {};
        const recips = body.recipients ? body.recipients.join(', ') : 'seller';
        alert(`Order sent to: ${recips}. The seller will contact you.`);
      } else {
        alert(data?.detail || `Failed to place order: Status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to place order', err);
      alert(`Failed to place order: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid px-4">
            <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/dashboard">
              <i className="bi bi-book-fill me-2 fs-4"></i>
              <span className="fs-5">EduReuse</span>
            </Link>
          </div>
        </nav>
        <div className="container mt-4 text-center">
          <p className="text-muted">Please login to view your favorites.</p>
          <Link to="/" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/dashboard">
            <i className="bi bi-book-fill me-2 fs-4"></i>
            <span className="fs-5">EduReuse</span>
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link text-dark fw-semibold" to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 mt-4">
        <div className="row">
          <div className="col-12 d-flex flex-column align-items-center">
            <div className="d-flex align-items-center">
              <h1 className="text-center mb-4 fw-bold text-primary me-3">My Favorites</h1>
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchFavorites} aria-label="Refresh favorites">Refresh</button>
            </div>
            <p className="text-center text-muted mb-5">Books you've saved for later</p>
          </div>
        </div>

        <div className="row">
          {favorites.length === 0 && (
            <div className="col-12 text-center">
              <div className="empty-state py-5">
                <i className="bi bi-heart display-1 text-muted mb-3"></i>
                <h3 className="text-muted">No favorites yet</h3>
                <p className="text-muted">Click the heart icon on books to add them to your favorites.</p>
                <Link to="/dashboard" className="btn btn-primary">Browse Books</Link>
              </div>
            </div>
          )}

          {favorites.map((f) => {
            const b = f.book;
            if (!b) return null; // defensive: skip malformed favorite entries
            return (
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4" key={f.id}>
                <div className="card h-100 shadow-sm border-0 hover-card">
                  <div className="position-relative">
                    <img src={getBookImage(b.image, b.name, 300, 200)} onError={(e)=>{e.target.onerror=null; e.target.src = getBookImage(null, b.name, 300, 200)}} className="card-img-top" alt={b.name} style={{height: '200px', objectFit: 'cover'}} />
                    <span className={`badge position-absolute top-0 end-0 m-2 ${
                      (b.condition || '').startsWith('new') ? 'bg-success' :
                      (b.condition || '').startsWith('good') ? 'bg-warning' :
                      (b.condition || '').startsWith('fair') ? 'bg-secondary' : 'bg-dark'
                    }`}>
                      {(b.condition || '').replace('_', ' ').toUpperCase()}
                    </span>
                    <button className="btn btn-light position-absolute top-0 start-0 m-2 p-1" onClick={() => toggleFavorite(b.id)} style={{borderRadius: '50%', width: '32px', height: '32px'}}>
                      <i className="bi bi-heart-fill text-danger"></i>
                    </button>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title fw-bold text-truncate" title={b.name}>{b.name}</h6>
                    <p className="card-text text-muted small mb-1">by {b.author}</p>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="h5 text-success fw-bold mb-0">₹{b.price}</span>
                      </div>
                      <Link to={`/book/${b.id}`} className="btn btn-primary btn-sm w-100 mb-2">
                        <i className="bi bi-eye me-1"></i>View Details
                      </Link>
                      <button className="btn btn-success btn-sm w-100" onClick={() => {
                        if (!confirm('Place order for this book?')) return;
                        buyBook(b.id);
                      }}>
                        <i className="bi bi-bag-check me-1"></i>Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}