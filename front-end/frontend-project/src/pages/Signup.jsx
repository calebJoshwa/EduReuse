import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.username.trim() || !formData.password) {
      setError('Username and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      // ensure CSRF cookie
      await fetch('/api/auth/csrf/', { credentials: 'include' });
      const csrftoken = document.cookie.split('csrftoken=')[1]?.split(';')[0];
      const res = await fetch('/api/auth/signup/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || ''
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Signup failed');
        setSubmitting(false);
        return;
      }
      navigate('/');
    } catch (err) {
      setError('Network error');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex">
      {/* Left Side - Hero Section */}
      <div className="d-none d-md-flex col-md-7 bg-primary text-white align-items-center justify-content-center p-5">
        <div className="text-center">
          <i className="bi bi-book-fill display-1 mb-4"></i>
          <h1 className="display-4 fw-bold mb-3">Join EduReuse</h1>
          <p className="lead mb-4">Discover, buy, and sell educational books with ease. Connect with fellow students and educators in our vibrant community.</p>
          <div className="mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>Free to join<br/>
            <i className="bi bi-check-circle-fill me-2"></i>Secure transactions<br/>
            <i className="bi bi-check-circle-fill me-2"></i>Wide selection of books
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="col-md-5 d-flex align-items-center justify-content-center p-4">
        <div className="w-100">
          <div className="text-center mb-4 d-md-none">
            <i className="bi bi-book-fill text-primary" style={{fontSize: "3rem"}}></i>
            <h2 className="text-primary mt-3 fw-bold">Join EduReuse</h2>
            <p className="text-muted">Create your account</p>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4 fw-bold d-none d-md-block">Create Account</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <input name="username" className="form-control" placeholder="Choose a username" onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input type="email" name="email" className="form-control" placeholder="Enter your email" onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-phone"></i></span>
                    <input type="tel" name="phone" className="form-control" placeholder="Enter your phone number" onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input type="password" name="password" className="form-control" placeholder="Create a password" onChange={handleChange} required />
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>Sign Up
                    </>
                  )}
                </button>
                <p className="mt-3 text-center mb-0">
                  Already have an account? <Link to="/" className="text-decoration-none fw-semibold">Login here</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
