// Registration page with Zod validation
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  collegeId: z.string().regex(/^\d{2}(cse|ece|cce|mec|dcs|dec)\d{3}$/i, "Roll No format must be like 24ucs001 (cse/ece/cce/mec/dcs/dec)").toLowerCase(),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => {
  if (data.collegeId && data.email) {
    return data.email === `${data.collegeId}@lnmiit.ac.in`;
  }
  return true;
}, {
  message: "Email must exactly match RollNo@lnmiit.ac.in",
  path: ["email"]
});

const Register = () => {
  const [formData, setFormData] = useState({ name: '', collegeId: '', email: '', password: '', referralCode: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
        if (/\d/.test(value)) {
          setErrors(prev => ({ ...prev, name: 'Numbers are not allowed in the name' }));
          return;
        }
        fieldSchema = z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces");
        break;
      case 'collegeId':
        if (!value) { setErrors(prev => ({ ...prev, collegeId: '' })); return; }
        fieldSchema = z.string().regex(/^\d{2}(cse|ece|cce|mec|dcs|dec)\d{3}$/i, "Roll No must be 2 digits + branch (cse/ece/cce/mec/dcs/dec) + 3 digits");
        break;
      case 'email':
        fieldSchema = z.string().email("Please enter a valid email address").endsWith("@lnmiit.ac.in", "Email must end with @lnmiit.ac.in");
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
    let finalValue = value;
    if (field === 'email' || field === 'collegeId') {
      finalValue = value.toLowerCase();
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    validate(field, finalValue);
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
            <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" className={`form-control ${errors.password ? 'input-error' : ''}`} placeholder="Password (min 6 chars)" value={formData.password} onChange={e => handleChange('password', e.target.value)} required minLength={6} />
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
