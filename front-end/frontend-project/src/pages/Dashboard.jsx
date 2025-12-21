import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const pageSize = 6;

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
    const fetchCartCount = async () => {
      try {
        const res = await fetch('/api/cart/', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch cart count', err);
      }
    };
    fetchUser();
    fetchCartCount();
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     const fetchFavorites = async () => {
  //       try {
  //         const res = await fetch('/api/favorites/', { credentials: 'include' });
  //         if (res.ok) {
  //           const data = await res.json();
  //           setFavorites(data);
  //         }
  //       } catch (err) {
  //         console.error('Failed to fetch favorites', err);
  //       }
  //     };
  //     fetchFavorites();
  //   }
  // }, [user]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category) params.set('category', category);
        params.set('page', page);
        const res = await fetch(`/api/books/?${params.toString()}`, { credentials: 'include' });
        if (!res.ok) {
          console.error('Failed to fetch books');
          return;
        }
        const data = await res.json();
        // DRF paginated response: {count, next, previous, results}
        setBooks(data.results || []);
        // set page count if needed (derived client-side)
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [search, category, page]);

  const handleLogout = async () => {
    try {
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      await fetch('/api/auth/logout/', { method: 'POST', credentials: 'include', headers: { 'X-CSRFToken': csrftoken || '' } });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (bookId) => {
    const existingFav = favorites.find(f => f.book.id === bookId);
    const isFav = !!existingFav;
    const method = isFav ? 'DELETE' : 'POST';
    const url = isFav ? `/api/favorites/${existingFav.id}/` : '/api/favorites/';
    const body = isFav ? null : JSON.stringify({ book: bookId });
    try {
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body,
      });
      if (res.ok) {
        if (isFav) {
          setFavorites(favorites.filter(f => f.id !== existingFav.id));
        } else {
          const data = await res.json();
          setFavorites([...favorites, data]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const addToCart = async (bookId) => {
    try {
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      const res = await fetch('/api/cart/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body: JSON.stringify({ book: bookId, quantity: 1 }),
      });
      if (res.ok) {
        setCartCount(cartCount + 1);
        alert('Added to cart!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  return (
    <div className="dashboard-bg">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/dashboard">
            <i className="bi bi-book-fill me-2 fs-4"></i>
            <span className="fs-5">EduReuse</span>
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link text-dark fw-semibold px-3" to="/dashboard">
                  <i className="bi bi-house-door me-1"></i>Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-semibold px-3" to="/book/create">
                  <i className="bi bi-plus-circle me-1"></i>Sell Book
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-semibold px-3" to="/messages">
                  <i className="bi bi-chat-dots me-1"></i>Messages
                </Link>
              </li>
            </ul>
            
            <form className="d-flex mx-auto flex-grow-1" style={{maxWidth: "600px"}} onSubmit={(e) => e.preventDefault()}>
              <div className="input-group me-2">
                <input className="form-control border-end-0" type="search" placeholder="Search books by title, author..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                <button className="btn btn-outline-secondary border-start-0" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
              <select className="form-select" style={{maxWidth: "150px"}} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Programming">Programming</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="AI">AI</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
              </select>
            </form>
            
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-dark fw-semibold px-3 position-relative" to="/cart">
                  <i className="bi bi-cart me-1"></i>Cart
                  {cartCount > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill" style={{fontSize: '10px'}}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-dark d-flex align-items-center border-0 bg-transparent" href="#" role="button" data-bs-toggle="dropdown">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                    <i className="bi bi-person-fill text-white" style={{fontSize: '14px'}}></i>
                  </div>
                  <span className="fw-semibold">{user ? user.username : 'Profile'}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                  <li><Link className="dropdown-item py-2" to="/profile"><i className="bi bi-person me-2"></i>My Profile</Link></li>
                  <li><Link className="dropdown-item py-2" to="/favorites"><i className="bi bi-heart me-2"></i>My Favorites</Link></li>
                  <li><Link className="dropdown-item py-2" to="/book/create"><i className="bi bi-plus-circle me-2"></i>Add New Book</Link></li>
                  <li><Link className="dropdown-item py-2" to="/messages"><i className="bi bi-envelope me-2"></i>Messages</Link></li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li><button className="dropdown-item py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 mt-4">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center mb-4 fw-bold text-primary">Discover Books</h1>
            <p className="text-center text-muted mb-5">Find your next great read from our collection of reused educational books</p>
          </div>
        </div>

        <div className="row">
          {books.length === 0 && (
            <div className="col-12 text-center">
              <div className="empty-state py-5">
                <i className="bi bi-book display-1 text-muted mb-3"></i>
                <h3 className="text-muted">No books found</h3>
                <p className="text-muted">Try adjusting your search or check back later for new listings.</p>
              </div>
            </div>
          )}

          {books.map((b) => (
            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4" key={b.id}>
              <div className="card h-100 shadow-sm border-0 hover-card">
                <div className="position-relative">
                  <img src={b.image || 'https://via.placeholder.com/300x200?text=No+Image'} className="card-img-top" alt={b.name} style={{height: '200px', objectFit: 'cover'}} />
                  <span className={`badge position-absolute top-0 end-0 m-2 ${
                    b.condition === 'new' ? 'bg-success' :
                    b.condition === 'like_new' ? 'bg-info' :
                    b.condition === 'good' ? 'bg-warning' :
                    b.condition === 'acceptable' ? 'bg-secondary' : 'bg-dark'
                  }`}>
                    {b.condition.replace('_', ' ').toUpperCase()}
                  </span>
                  {user && (
                    <button className="btn btn-light position-absolute top-0 start-0 m-2 p-1" onClick={() => toggleFavorite(b.id)} style={{borderRadius: '50%', width: '32px', height: '32px'}}>
                      <i className={`bi ${favorites.some(f => f.book.id === b.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                    </button>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title fw-bold text-truncate" title={b.name}>{b.name}</h6>
                  <p className="card-text text-muted small mb-1">by {b.author}</p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h5 text-success fw-bold mb-0">₹{b.price}</span>
                      <small className="text-muted">Listed recently</small>
                    </div>
                    <Link to={`/book/${b.id}`} className="btn btn-primary btn-sm w-100 mb-1">
                      <i className="bi bi-eye me-1"></i>View Details
                    </Link>
                    <button className="btn btn-warning btn-sm w-100" onClick={() => addToCart(b.id)}>
                      <i className="bi bi-cart-plus me-1"></i>Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length > 0 && (
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              <nav>
                <ul className="pagination shadow-sm">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link fw-bold">Page {page}</span>
                  </li>
                  <li className={`page-item`}>
                    <button className="page-link" onClick={() => setPage(p => p + 1)}>
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
