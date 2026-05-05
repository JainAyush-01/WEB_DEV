// Login page with Zod validation
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { z } from 'zod';

const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!email || !oldPassword || !newPassword) {
      setErrors({ changePwd: 'Email, old password and new password are required' });
      return;
    }
    try {
      setErrors({});
      const { data } = await api.post('/auth/change-password', { email, oldPassword, newPassword });
      setChangePasswordMsg(data.message);
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setErrors({ changePwd: err.response?.data?.message || 'Failed to change password' });
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
        
        {changePasswordMsg && <p className="field-success" style={{textAlign:'center',marginBottom:'12px',color:'green'}}>{changePasswordMsg}</p>}
        {errors.changePwd && <p className="field-error" style={{textAlign:'center',marginBottom:'12px'}}>{errors.changePwd}</p>}

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword}>
            <div className="input-group">
              <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value.toLowerCase())} required />
              <div className="input-group-append">
                <span className="input-group-text">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
              </div>
            </div>
            
            <div className="input-group">
              <input type="password" className="form-control" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" className="form-control" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-success btn-block" style={{ borderRadius: '0.25rem' }}>Update Password</button>
              <button type="button" className="btn btn-primary btn-block" style={{ borderRadius: '0.25rem' }} onClick={() => {setIsChangingPassword(false); setErrors({}); setServerError('');}}>Back to Login</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input type="email" className={`form-control ${errors.email ? 'input-error' : ''}`} placeholder="Email" value={email} onChange={e => { setEmail(e.target.value.toLowerCase()); validateEmail(e.target.value.toLowerCase()); }} required />
              <div className="input-group-append">
                <span className="input-group-text">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
              </div>
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
            
            <div className="input-group">
              <input type={showPassword ? "text" : "password"} className={`form-control ${errors.password ? 'input-error' : ''}`} placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); validatePassword(e.target.value); }} required />
              <div className="input-group-append" style={{cursor: 'pointer'}} onClick={() => setShowPassword(!showPassword)}>
                <span className="input-group-text">
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </span>
              </div>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-success btn-block" style={{ borderRadius: '0.25rem' }}>Sign In</button>
              <button type="button" className="btn btn-primary btn-block" style={{ borderRadius: '0.25rem' }} onClick={() => {setIsChangingPassword(true); setErrors({}); setServerError('');}}>Change Password</button>
            </div>
          </form>
        )}

        <p className="text-center mt-2" style={{fontSize:'.85rem'}}>
          New student? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
