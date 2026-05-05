// Admin tool to create, edit, delete plans
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({ name: '', durationDays: '', price: '', description: '', isCombo: false, comboIncludes: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    const { data } = await api.get('/plans');
    setPlans(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        comboIncludes: formData.isCombo && typeof formData.comboIncludes === 'string' 
          ? formData.comboIncludes.split(',').map(s => s.trim()).filter(Boolean) 
          : []
      };

      if (editingId) await api.put(`/plans/${editingId}`, payload);
      else await api.post('/plans', payload);
      setFormData({ name: '', durationDays: '', price: '', description: '', isCombo: false, comboIncludes: '' });
      setEditingId(null);
      fetchPlans();
    } catch (err) {
      alert('Failed to save plan');
    }
  };

  const handleEdit = (plan) => { 
    setFormData({
      ...plan,
      comboIncludes: plan.comboIncludes ? plan.comboIncludes.join(', ') : ''
    }); 
    setEditingId(plan._id); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this plan?')) {
      await api.delete(`/plans/${id}`);
      fetchPlans();
    }
  };

  const resetForm = () => { setEditingId(null); setFormData({ name: '', durationDays: '', price: '', description: '', isCombo: false, comboIncludes: '' }); };

  return (
    <>
      <div className="content-header">
        <h1>Manage Plans</h1>
        <div className="breadcrumb"><a href="#">Home</a> <span>/ Plans</span></div>
      </div>
      <section className="content">
        {/* Form card */}
        <div className="card mb-2">
          <div className="card-header">{editingId ? 'Edit Plan' : 'Add New Plan'}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="admin-form">
              <input className="form-control" type="text" placeholder="Plan Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="form-control" type="number" placeholder="Duration (Days)" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} required />
              <input className="form-control" type="number" placeholder="Price (₹)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              <input className="form-control" type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                <input type="checkbox" id="isCombo" checked={formData.isCombo} onChange={e => setFormData({...formData, isCombo: e.target.checked})} />
                <label htmlFor="isCombo" style={{ margin: 0, cursor: 'pointer' }}>Is Combo Plan?</label>
              </div>

              {formData.isCombo && (
                <input className="form-control" type="text" placeholder="Combo Perks (comma separated)" value={formData.comboIncludes} onChange={e => setFormData({...formData, comboIncludes: e.target.value})} required={formData.isCombo} />
              )}

              <div>
                <button type="submit" className="btn btn-success">{editingId ? 'Update' : 'Create'}</button>
                {editingId && <button type="button" className="btn btn-outline ml-1" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        {/* Plans table */}
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Days</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.isCombo ? <span className="badge bg-warning">Combo</span> : 'Standard'}</td>
                      <td>{p.durationDays}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-danger ml-1" onClick={() => handleDelete(p._id)}>Delete</button>
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

export default ManagePlans;
