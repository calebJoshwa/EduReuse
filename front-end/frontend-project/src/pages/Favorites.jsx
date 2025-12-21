import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Favorites() {
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

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        try {
          const res = await fetch('/api/favorites/', { credentials: 'include' });
          if (res.ok) {
            setFavorites(await res.json());
          }
        } catch (err) {
          console.error('Failed to fetch favorites', err);
        }
      };
      fetchFavorites();
    }
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
          <div className="col-12">
            <h1 className="text-center mb-4 fw-bold text-primary">My Favorites</h1>
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
            return (
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4" key={f.id}>
                <div className="card h-100 shadow-sm border-0 hover-card">
                  <div className="position-relative">
                    <img src={b.image || 'https://via.placeholder.com/300x200?text=No+Image'} className="card-img-top" alt={b.name} style={{height: '200px', objectFit: 'cover'}} />
                    <span className={`badge position-absolute top-0 end-0 m-2 ${
                      b.condition === 'new' ? 'bg-success' :
                      b.condition === 'good' ? 'bg-warning' :
                      b.condition === 'fair' ? 'bg-secondary' : 'bg-dark'
                    }`}>
                      {b.condition.replace('_', ' ').toUpperCase()}
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
                      <Link to={`/book/${b.id}`} className="btn btn-primary btn-sm w-100">
                        <i className="bi bi-eye me-1"></i>View Details
                      </Link>
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