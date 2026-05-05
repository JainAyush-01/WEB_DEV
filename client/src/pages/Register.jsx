// Registration page with Zod validation
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  collegeId: z.string().regex(/^[a-zA-Z0-9]*$/, "College ID must be alphanumeric").optional().or(z.literal('')),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const Register = () => {
  const [formData, setFormData] = useState({ name: '', collegeId: '', email: '', password: '', referralCode: '' });
  const [errors, setErrors] = useState({});
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // Validate a single field using safeParse
  const validate = (field, value) => {
    if (!value && field !== 'collegeId') {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Build a single-field schema for real-time validation
    let fieldSchema;
    switch (field) {
      case 'name':
        fieldSchema = z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces");
        break;
      case 'collegeId':
        if (!value) { setErrors(prev => ({ ...prev, collegeId: '' })); return; }
        fieldSchema = z.string().regex(/^[a-zA-Z0-9]+$/, "College ID must be alphanumeric (e.g. 24UCS001)");
        break;
      case 'email':
        fieldSchema = z.string().email("Please enter a valid email address");
        break;
      case 'password':
        fieldSchema = z.string().min(6, "Password must be at least 6 characters");
        break;
      default:
        return;
    }
    
    const result = fieldSchema.safeParse(value);
    const msg = result.success ? '' : result.error.errors[0]?.message || '';
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  const hasErrors = Object.values(errors).some(e => e !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = userRegistrationSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = {};
      result.error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      const user = await register({
        name: formData.name,
        collegeId: formData.collegeId,
        email: formData.email,
        password: formData.password
      });

      if (formData.referralCode) {
        try {
          await api.post('/auth/refer', { code: formData.referralCode });
        } catch (referErr) {
          console.error("Referral failed:", referErr.response?.data?.message);
        }
      }

      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-box">
      <div className="login-logo">
        <img src="https://lnmiit.ac.in/wp-content/uploads/2023/07/cropped-LNMIIT-Logo-Transperant-Background-e1699342125845.png" alt="LNMIIT" />
        <p>The LNM Institute of Information Technology</p>
      </div>

      <div className="login-card-body">
        <p className="login-box-msg">Register a new membership</p>

        {serverError && <p className="field-error" style={{textAlign:'center',marginBottom:'12px'}}>{serverError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" name="name" autoComplete="name" className={`form-control ${errors.name ? 'input-error' : ''}`} placeholder="Full Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
            <div className="input-group-append"><span className="input-group-text">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span></div>
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}

          <div className="input-group">
            <input type="text" name="collegeIdField" autoComplete="off" className={`form-control ${errors.collegeId ? 'input-error' : ''}`} placeholder="College ID (e.g. 24UCS001)" value={formData.collegeId} onChange={e => handleChange('collegeId', e.target.value)} />
            <div className="input-group-append"><span className="input-group-text">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </span></div>
          </div>
          {errors.collegeId && <p className="field-error">{errors.collegeId}</p>}

          <div className="input-group">
            <input type="email" name="email" autoComplete="email" className={`form-control ${errors.email ? 'input-error' : ''}`} placeholder="Email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
            <div className="input-group-append"><span className="input-group-text">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span></div>
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}

          <div className="input-group">
            <input type="password" name="password" autoComplete="new-password" className={`form-control ${errors.password ? 'input-error' : ''}`} placeholder="Password (min 6 chars)" value={formData.password} onChange={e => handleChange('password', e.target.value)} required minLength={6} />
            <div className="input-group-append"><span className="input-group-text">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span></div>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}

          <div className="input-group">
            <input type="text" name="referralCode" autoComplete="off" className="form-control" placeholder="Referral Code (Optional)" value={formData.referralCode} onChange={e => handleChange('referralCode', e.target.value)} />
            <div className="input-group-append"><span className="input-group-text">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            </span></div>
          </div>

          <div className="flush-buttons">
            <button type="submit" className="btn btn-success btn-block" disabled={hasErrors}>Register</button>
            <Link to="/login" className="btn btn-primary btn-block" style={{textDecoration:'none'}}>I already have an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
