// Student dashboard with proper membership status handling
import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [memberships, setMemberships] = useState([]);
  const [insights, setInsights] = useState(null);
  const [dailyStatus, setDailyStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { 
    fetchMemberships(); 
    fetchInsights();
    fetchDailyStatus();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data } = await api.get('/attendance/insights');
      setInsights(data);
    } catch (err) { console.error(err); }
  };

  const fetchDailyStatus = async () => {
    try {
      const { data } = await api.get('/attendance/daily');
      // If there's an open session, we'll know from the backend, but backend /daily only returns completed.
      // Let's just catch the error or success from checkin/checkout for now.
    } catch (err) { console.error(err); }
  };

  const handleCheckIn = async () => {
    try {
      const { data } = await api.post('/attendance/checkin');
      alert(data.message);
    } catch (err) { alert(err.response?.data?.message || 'Error checking in'); }
  };

  const handleCheckOut = async () => {
    try {
      const { data } = await api.post('/attendance/checkout');
      alert(data.message);
    } catch (err) { alert(err.response?.data?.message || 'Error checking out'); }
  };

  const handleFreeze = async () => {
    const days = window.prompt('Enter number of days to freeze (1-10):', '5');
    if (!days) return;
    try {
      const { data } = await api.post('/memberships/freeze', { freeze_days: parseInt(days) });
      alert(data.message);
      fetchMemberships();
    } catch (err) { alert(err.response?.data?.message || 'Error freezing membership'); }
  };

  const toggleAutoRenew = async (id) => {
    try {
      const { data } = await api.put(`/memberships/${id}/auto-renew`);
      alert(data.message);
      fetchMemberships();
    } catch (err) { alert(err.response?.data?.message || 'Error toggling auto-renew'); }
  };

  const fetchMemberships = async () => {
    try {
      const { data } = await api.get('/memberships/my');
      setMemberships(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Find the latest active and latest expired memberships
  const activeMembership = memberships.find(m => m.status === 'active');
  const latestExpired = memberships.find(m => m.status === 'expired');

  // Check if membership is expiring within 3 days
  const isExpiringSoon = activeMembership && 
    (new Date(activeMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24) <= 3;

  return (
    <>
      <div className="content-header">
        <h1>Dashboard</h1>
        <div className="breadcrumb">
          <a href="#">Home</a> <span>/ Dashboard</span>
        </div>
      </div>

      <section className="content">
        <div className="card">
          <div className="card-body" style={{padding: '10px 18px'}}>
            Dashboard
          </div>
        </div>

        {/* Smart Insights Card */}
        {insights && (
          <div className="card mb-3" style={{ borderLeft: '4px solid #17a2b8' }}>
            <div className="card-body">
              <h5 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>💡 Smart Insight</h5>
              <p style={{ margin: 0 }}>{insights.suggestion}</p>
            </div>
          </div>
        )}

        {/* Attendance Controls */}
        <div className="card mb-3">
          <div className="card-body d-flex justify-content-between align-items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Gym Attendance</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check in when you arrive, check out when you leave (min 30 mins to earn points).</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-success" onClick={handleCheckIn}>Check In</button>
              <button className="btn btn-danger" onClick={handleCheckOut}>Check Out</button>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        {user?.referralCode && (
          <div className="card mb-3">
            <div className="card-body">
              <strong>🎁 Your Referral Code: <span style={{ color: 'var(--active-pink)' }}>{user.referralCode}</span></strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Share this code with friends! When they register, you both get 100 bonus points.</p>
            </div>
          </div>
        )}

        {/* Active membership */}
        {activeMembership && (
          <div className="list-card">
            <strong>{activeMembership.planId?.name}</strong> — Active until {new Date(activeMembership.endDate).toLocaleDateString()}
            <span style={{float:'right'}}>
              <span className="badge bg-success">Active</span>
            </span>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn btn-sm btn-outline" onClick={handleFreeze}>❄️ Freeze</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
                <input 
                  type="checkbox" 
                  id={`auto-renew-${activeMembership._id}`}
                  checked={activeMembership.autoRenew || false}
                  onChange={() => toggleAutoRenew(activeMembership._id)}
                />
                <label htmlFor={`auto-renew-${activeMembership._id}`} style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>Auto-Renew</label>
              </div>
            </div>

            {isExpiringSoon && (
              <p style={{color:'#dc3545', fontSize:'.85rem', marginTop:'15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                ⚠ Expiring soon! 
                <button className="btn btn-sm btn-success ml-1" onClick={() => navigate('/buy', { state: { renewId: activeMembership._id } })}>
                  Renew Now
                </button>
              </p>
            )}
          </div>
        )}

        {/* Expired membership (only show if no active) */}
        {!activeMembership && latestExpired && (
          <div className="list-card" onClick={() => navigate('/buy', { state: { renewId: latestExpired._id } })}>
            <strong>{latestExpired.planId?.name}</strong> — Expired on {new Date(latestExpired.endDate).toLocaleDateString()} (Click to Renew)
            <span style={{float:'right'}}><span className="badge bg-danger">Expired</span></span>
          </div>
        )}

        {/* No membership at all */}
        {!activeMembership && !latestExpired && (
          <div className="list-card" onClick={() => navigate('/buy')}>
            No membership yet — Click here to browse plans
          </div>
        )}

        {/* Quick actions */}
        {activeMembership ? (
          <>
            <div className="list-card" onClick={() => navigate('/buy', { state: { upgradeId: activeMembership._id } })}>
              Renew or Upgrade Subscription Plan
            </div>
          </>
        ) : (
          <div className="list-card" onClick={() => navigate('/buy')}>
            Browse &amp; Buy Subscription Plans
          </div>
        )}
        <div className="list-card" onClick={() => navigate('/history')}>
          View Membership History
        </div>
      </section>
    </>
  );
};

export default StudentDashboard;
