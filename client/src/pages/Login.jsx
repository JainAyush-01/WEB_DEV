// Login page with Zod validation
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const validateEmail = (val) => {
    if (!val) { setErrors(prev => ({ ...prev, email: '' })); return; }
    const result = z.string().email("Please enter a valid email address").safeParse(val);
    const msg = result.success ? '' : result.error.errors[0]?.message || '';
    setErrors(prev => ({ ...prev, email: msg }));
  };

  const validatePassword = (val) => {
    if (!val) { setErrors(prev => ({ ...prev, password: '' })); return; }
    const result = z.string().min(6, "Password must be at least 6 characters").safeParse(val);
    const msg = result.success ? '' : result.error.errors[0]?.message || '';
    setErrors(prev => ({ ...prev, password: msg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = userLoginSchema.safeParse({ email, password });
    if (!result.success) {
      const newErrors = {};
      result.error.errors.forEach(err => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      return;
    }

    try {
      setServerError('');
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-box">
      <div className="login-logo">
        <img src="https://lnmiit.ac.in/wp-content/uploads/2023/07/cropped-LNMIIT-Logo-Transperant-Background-e1699342125845.png" alt="LNMIIT" />
        <p>The LNM Institute of Information Technology</p>
      </div>
      
      <div className="login-card-body">
        <p className="login-box-msg">Welcome! Sign in to start your session</p>
        
        {serverError && <p className="field-error" style={{textAlign:'center',marginBottom:'12px'}}>{serverError}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" className={`form-control ${errors.email ? 'input-error' : ''}`} placeholder="Email" value={email} onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }} required />
            <div className="input-group-append">
              <span className="input-group-text">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
            </div>
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
          
          <div className="input-group">
            <input type="password" className={`form-control ${errors.password ? 'input-error' : ''}`} placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); validatePassword(e.target.value); }} required />
            <div className="input-group-append">
              <span className="input-group-text">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
            </div>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
          
          <div className="flush-buttons">
            <button type="submit" className="btn btn-success btn-block">Sign In</button>
            <button type="button" className="btn btn-primary btn-block">Forgot password</button>
          </div>
        </form>

        <p className="text-center mt-2" style={{fontSize:'.85rem'}}>
          New student? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
