import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function BookCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', author: '', category: '', condition: 'good', price: '', description: '', image: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // ensure CSRF cookie
    fetch('/api/auth/csrf/', { credentials: 'include' });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // client-side validation
    if (!form.name.trim() || !form.author.trim()) {
      setError('Name and author are required.');
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number.');
      return;
    }
    const csrftoken = getCookie('csrftoken');
    setSubmitting(true);
    try {
      const res = await fetch('/api/books/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Failed to create');
        setSubmitting(false);
        return;
      }
      const created = await res.json();
      navigate(`/book/${created.id}`);
    } catch (err) {
      setError('Network error');
    }
  };

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
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <h2 className="card-title text-center mb-4 fw-bold">
                  <i className="bi bi-plus-circle me-2 text-primary"></i>Add New Book
                </h2>
                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Book Title</label>
                      <input name="name" className="form-control" value={form.name} onChange={handleChange} required placeholder="Enter book title" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Author</label>
                      <input name="author" className="form-control" value={form.author} onChange={handleChange} required placeholder="Enter author name" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Category</label>
                      <input name="category" className="form-control" value={form.category} onChange={handleChange} placeholder="e.g., Fiction, Science" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Condition</label>
                      <select name="condition" className="form-select" value={form.condition} onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Price (₹)</label>
                      <input name="price" type="number" step="0.01" className="form-control" value={form.price} onChange={handleChange} required placeholder="0.00" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Image URL</label>
                      <input name="image" className="form-control" value={form.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea name="description" className="form-control" value={form.description} onChange={handleChange} rows="4" placeholder="Describe the book..."></textarea>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-primary btn-lg px-5" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>Create Book
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
