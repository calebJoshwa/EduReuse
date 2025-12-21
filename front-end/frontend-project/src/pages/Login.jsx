import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    // ensure CSRF cookie is set by backend
    fetch('/api/auth/csrf/', { credentials: 'include' });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const csrftoken = getCookie('csrftoken');
      const res = await fetch('/api/auth/login/', {
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
        setError(data.detail || 'Login failed');
        return;
      }

      // success
      navigate('/dashboard');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      {/* Left Side - Hero Section */}
      <div className="d-none d-md-flex col-md-8 bg-primary text-white align-items-center justify-content-center p-5">
        <div className="text-center">
          <i className="bi bi-book-fill display-1 mb-4"></i>
          <h1 className="display-4 fw-bold mb-3">Welcome Back</h1>
          <p className="lead mb-4">Continue your journey in buying and selling educational books. Access your account to manage listings and connect with sellers.</p>
          <div className="mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>Secure login<br/>
            <i className="bi bi-check-circle-fill me-2"></i>Manage your books<br/>
            <i className="bi bi-check-circle-fill me-2"></i>Connect with community
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="col-md-4 d-flex align-items-center justify-content-center p-4">
        <div className="w-100">
          <div className="text-center mb-4 d-md-none">
            <i className="bi bi-book-fill text-primary" style={{fontSize: "3rem"}}></i>
            <h2 className="text-primary mt-3 fw-bold">EduReuse</h2>
            <p className="text-muted">Login to your account</p>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4 fw-bold d-none d-md-block">Login</h3>
              
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <input 
                      name="username" 
                      className="form-control" 
                      placeholder="Enter username" 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input 
                      type="password" 
                      name="password" 
                      className="form-control" 
                      placeholder="Enter password" 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">Login</button>
                <p className="mt-3 text-center mb-0">
                  Don't have an account? <Link to="/signup" className="text-decoration-none fw-semibold">Sign up here</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
