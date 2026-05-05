// Table showing all past and current memberships
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MembershipHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/memberships/my');
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="content-header">
        <h1>Membership History</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ History</span></div>
      </div>
      <section className="content">
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(m => (
                    <tr key={m._id}>
                      <td>{m.planId?.name || 'N/A'}</td>
                      <td>{new Date(m.startDate).toLocaleDateString()}</td>
                      <td>{new Date(m.endDate).toLocaleDateString()}</td>
                      <td>₹{m.amountPaid}</td>
                      <td><span className={`badge bg-${m.status === 'active' ? 'success' : 'danger'}`}>{m.status}</span></td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan="5" className="text-center" style={{padding:'20px',color:'#6c757d'}}>No membership history</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MembershipHistory;
