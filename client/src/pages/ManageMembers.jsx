// Admin tool to manage members
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ManageMembers = () => {
  const [memberships, setMemberships] = useState([]);

  useEffect(() => { fetchMemberships(); }, []);

  const fetchMemberships = async () => {
    try {
      const { data } = await api.get('/memberships/all');
      setMemberships(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/memberships/admin/update/${id}`, updates);
      fetchMemberships();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <>
      <div className="content-header">
        <h1>Manage Members</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ Members</span></div>
      </div>
      <section className="content">
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College ID</th>
                    <th>Plan</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map(m => (
                    <tr key={m._id}>
                      <td>{m.userId?.name}</td>
                      <td>{m.userId?.collegeId || 'N/A'}</td>
                      <td>{m.planId?.name}</td>
                      <td>{new Date(m.endDate).toLocaleDateString()}</td>
                      <td><span className={`badge bg-${m.status === 'active' ? 'success' : 'danger'}`}>{m.status}</span></td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(m._id, { status: m.status === 'active' ? 'expired' : 'active' })}>
                          Toggle
                        </button>
                        <button className="btn btn-sm btn-success ml-1" onClick={() => handleUpdate(m._id, { extendDays: 30 })}>
                          +30 Days
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ManageMembers;
