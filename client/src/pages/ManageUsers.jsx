// Admin tool to view users and promote to admin
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const promoteToAdmin = async (id) => {
    if (window.confirm('Are you sure you want to promote this user to Admin?')) {
      try {
        await api.put(`/auth/users/${id}/promote`);
        fetchUsers();
      } catch (err) {
        alert('Failed to promote user');
      }
    }
  };

  return (
    <>
      <div className="content-header">
        <h1>Manage Users</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ Users</span></div>
      </div>
      <section className="content">
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College ID</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.collegeId || 'N/A'}</td>
                      <td>
                        <span className={`badge bg-${u.role === 'admin' ? 'warning' : 'success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className="btn btn-sm btn-primary" onClick={() => promoteToAdmin(u._id)}>
                            Make Admin
                          </button>
                        )}
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

export default ManageUsers;
