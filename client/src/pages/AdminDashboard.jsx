// Admin dashboard with stat boxes
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, expired: 0, expiringSoon: 0, revenue: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/memberships/all');
      let active = 0, expired = 0, expiringSoon = 0, revenue = 0;
      const now = new Date();
      const threeDays = new Date(); threeDays.setDate(now.getDate() + 3);

      data.forEach(m => {
        revenue += m.amountPaid;
        if (m.status === 'active') {
          active++;
          if (new Date(m.endDate) <= threeDays) expiringSoon++;
        } else expired++;
      });

      setStats({ active, expired, expiringSoon, revenue });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="content-header">
        <h1>Admin Dashboard</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ Dashboard</span></div>
      </div>
      <section className="content">
        <div className="stats-grid">
          <div className="stat-box">
            <h3>{stats.active}</h3>
            <p>Active Members</p>
          </div>
          <div className="stat-box">
            <h3>{stats.expired}</h3>
            <p>Expired Members</p>
          </div>
          <div className="stat-box">
            <h3>{stats.expiringSoon}</h3>
            <p>Expiring in 3 Days</p>
          </div>
          <div className="stat-box">
            <h3>₹{stats.revenue}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
