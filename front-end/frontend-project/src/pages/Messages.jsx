import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages/?inbox=true', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.results || data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/dashboard">
            <i className="bi bi-book-fill me-2"></i>EduReuse
          </Link>
        </div>
      </nav>
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading messages...</p>
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
        <h2 className="mb-4 fw-bold text-center">
          <i className="bi bi-envelope me-2 text-primary"></i>Your Messages
        </h2>
        {messages.length === 0 ? (
          <div className="text-center">
            <i className="bi bi-envelope-open text-muted" style={{fontSize: "3rem"}}></i>
            <p className="mt-3 text-muted">No messages yet. Start contacting sellers!</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="list-group">
                {messages.map(m => (
                  <div key={m.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">
                        <i className="bi bi-book me-2"></i>{m.book?.name}
                      </div>
                      <p className="mb-1 text-muted">
                        From: <strong>{m.sender?.username}</strong> — {m.message.length > 150 ? `${m.message.slice(0, 150)}...` : m.message}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>{new Date(m.created_at).toLocaleString()}
                      </small>
                    </div>
                    <Link to={`/book/${m.book?.id}`} className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-eye me-1"></i>View Book
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
