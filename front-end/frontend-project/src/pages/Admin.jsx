import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [currentView, setCurrentView] = useState('users');

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
    if (user && user.is_staff) {
      const fetchUsers = async () => {
        try {
          const res = await fetch('/api/users/', { credentials: 'include' });
          if (res.ok) {
            setUsers(await res.json());
          }
        } catch (err) {
          console.error('Failed to fetch users', err);
        }
      };
      const fetchBooks = async () => {
        try {
          const res = await fetch('/api/books/', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setBooks(data.results || []);
          }
        } catch (err) {
          console.error('Failed to fetch books', err);
        }
      };
      fetchUsers();
      fetchBooks();
    }
  }, [user]);

  const buyBook = async (bookId) => {
    try {
      if (!confirm('Place order for this book?')) return;
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
        alert(`Order sent to: ${recips}.`);
      } else {
        alert(data?.detail || `Failed to place order: Status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to place order', err);
      alert(`Failed to place order: ${err.message}`);
    }
  };

  if (!user || !user.is_staff) {
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
          <h1 className="text-danger">Access Denied</h1>
          <p className="text-muted">You do not have permission to access the admin panel.</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
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
            <h1 className="text-center mb-4 fw-bold text-primary">Admin Panel</h1>
            <p className="text-center text-muted mb-5">Manage users, books, and system settings</p>
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group" role="group">
                <button className={`btn ${currentView === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentView('users')}>Manage Users</button>
                <button className={`btn ${currentView === 'books' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentView('books')}>Manage Books</button>
                <button className={`btn ${currentView === 'settings' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentView('settings')}>System Settings</button>
              </div>
            </div>
          </div>
        </div>

        {currentView === 'users' && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0"><i className="bi bi-people me-2"></i>Manage Users</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Username</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Books Listed</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{u.first_name} {u.last_name}</td>
                            <td>{u.email}</td>
                            <td>{u.book_count}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-2">View</button>
                              <button className="btn btn-sm btn-outline-danger">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'books' && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0"><i className="bi bi-book me-2"></i>Manage Books</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Title</th>
                          <th>Author</th>
                          <th>Owner</th>
                          <th>Price</th>
                          <th>Condition</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map(b => (
                          <tr key={b.id}>
                            <td>{b.name}</td>
                            <td>{b.author}</td>
                            <td>{b.owner.username}</td>
                            <td>₹{b.price}</td>
                            <td>{b.condition}</td>
                            <td>
                              <Link to={`/book/${b.id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                              <button className="btn btn-sm btn-outline-danger me-2">Delete</button>
                              <button className="btn btn-sm btn-success" onClick={() => buyBook(b.id)}>Buy</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-warning text-white">
                  <h5 className="mb-0"><i className="bi bi-gear me-2"></i>System Settings</h5>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Site Title</label>
                      <input type="text" className="form-control" defaultValue="EduReuse" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Email</label>
                      <input type="email" className="form-control" defaultValue="admin@edureuse.com" />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}