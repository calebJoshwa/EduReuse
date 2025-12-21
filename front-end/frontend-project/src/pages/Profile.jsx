import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ books: 0, favorites: 0, messages: 0 });

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const ru = await fetch('/api/auth/user/', { credentials: 'include' });
        if (ru.ok) {
          const udata = await ru.json();
          setUser(udata);

          // Fetch books
          const rb = await fetch('/api/books/', { credentials: 'include' });
          if (rb.ok) {
            const bdata = await rb.json();
            const myBooks = bdata.filter(b => b.owner && b.owner.id === udata.id);
            setBooks(myBooks);
          }

          // Fetch favorites
          const rf = await fetch('/api/favorites/', { credentials: 'include' });
          if (rf.ok) {
            const fdata = await rf.json();
            setFavorites(fdata);
          }

          // Fetch messages
          const rm = await fetch('/api/messages/', { credentials: 'include' });
          if (rm.ok) {
            const mdata = await rm.json();
            const sentMessages = mdata.filter(m => m.sender.id === udata.id);
            setStats({
              books: myBooks.length,
              favorites: fdata.length,
              messages: sentMessages.length
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserAndData();
  }, []);

  if (!user) return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/dashboard">
            <i className="bi bi-book-fill me-2"></i>EduReuse
          </Link>
        </div>
      </nav>
      <div className="container mt-4 text-center">
        <p className="text-muted">Please login to view your profile.</p>
        <Link to="/" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/dashboard">
            <i className="bi bi-book-fill me-2"></i>EduReuse
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/dashboard"><i className="bi bi-house me-1"></i>Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card shadow-lg border-0 text-center">
              <div className="card-body">
                <i className="bi bi-person-circle text-primary" style={{fontSize: "4rem"}}></i>
                <h4 className="card-title mt-3 fw-bold">{user.username}</h4>
                <p className="text-muted">{user.first_name} {user.last_name}</p>
                <p className="mb-0"><i className="bi bi-envelope me-2"></i>{user.email}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card text-center shadow-sm border-0">
                  <div className="card-body">
                    <i className="bi bi-book text-success" style={{fontSize: "2rem"}}></i>
                    <h5 className="card-title mt-2">{stats.books}</h5>
                    <p className="text-muted mb-0">Books Listed</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm border-0">
                  <div className="card-body">
                    <i className="bi bi-heart text-danger" style={{fontSize: "2rem"}}></i>
                    <h5 className="card-title mt-2">{stats.favorites}</h5>
                    <p className="text-muted mb-0">Favorites</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center shadow-sm border-0">
                  <div className="card-body">
                    <i className="bi bi-chat-dots text-info" style={{fontSize: "2rem"}}></i>
                    <h5 className="card-title mt-2">{stats.messages}</h5>
                    <p className="text-muted mb-0">Messages Sent</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-book me-2 text-primary"></i>Your Listings
                </h5>
                {books.length === 0 ? (
                  <p className="text-muted">You have no books listed yet.</p>
                ) : (
                  <div className="row">
                    {books.map(b => (
                      <div className="col-md-6 mb-3" key={b.id}>
                        <div className="card h-100 shadow-sm hover-shadow">
                          <img src={b.image || 'https://via.placeholder.com/300x200?text=No+Image'} className="card-img-top" alt={b.name} />
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title fw-bold">{b.name}</h6>
                            <p className="card-text text-muted">by {b.author}</p>
                            <p className="card-text"><strong>₹{b.price}</strong></p>
                            <Link to={`/book/${b.id}`} className="btn btn-sm btn-primary mt-auto">View Details</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
