import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './CP_Details.css';
import backarrow from './../../../../src/assets/backarrow.png';
import { toast, ToastContainer } from 'react-toastify';

const CP_Details = ({ id, onBack }) => {
  const [cp, setCp] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCPDetails();
  }, [id]);

  const fetchCPDetails = async () => {
    try {
      const response = await axios.get(`https://noqu.co.in/db/get-cp-details/${id}`);
      const member = response.data.cp;
      setCp(member);
      setFormData({
        id: member.id,
        full_name: member.full_name || '',
        email: member.email || '',
        phone_no: member.phone_no || '',
        country_code: member.country_code || '',
        company_name: member.company_name || '',
        type_of_company: member.type_of_company || '',
        company_address: member.company_address || '',
        company_size: member.company_size || '',
        city: member.city || '',
        state: member.state || '',
        zip: member.zip || '',
        country: member.country || '',
        website: member.website || '',
        commission_percent: member.commission_percent ?? 10,
        status: member.status || 'inactive',
      });
    } catch (err) {
      toast.error('Failed to fetch CP details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('https://noqu.co.in/db/update-cp-member', formData);
      toast.success('CP updated successfully!');
      fetchCPDetails();
      setIsEditing(false);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!cp) return <div className="error">CP not found</div>;

  return (
    <div className="cp-details-container">
      <div className="cp-header">
        <img src={backarrow} alt="Back" className="back-btn" onClick={onBack} />
        <h2>Channel Partner Details</h2>
      </div>

      {/* Read-only View */}
      <div className="cp-readonly-container">
        <div className="section-block">
          <h3 className="section-title">Company Info</h3>
          <div className="field-grid">
            <div className="field-block"><label>Company Name</label><span>{cp.company_name}</span></div>
            <div className="field-block"><label>Type of Company</label><span>{cp.type_of_company}</span></div>
            <div className="field-block"><label>Company Size</label><span>{cp.company_size}</span></div>
            <div className="field-block"><label>Company Address</label><span>{cp.company_address}</span></div>
            <div className="field-block"><label>Website</label><span>{cp.website}</span></div>
          </div>
        </div>

        <div className="section-block">
          <h3 className="section-title">Contact Info</h3>
          <div className="field-grid">
            <div className="field-block"><label>Full Name</label><span>{cp.full_name}</span></div>
            <div className="field-block"><label>Email</label><span>{cp.email}</span></div>
            <div className="field-block"><label>Country Code</label><span>{cp.country_code}</span></div>
            <div className="field-block"><label>Phone Number</label><span>{cp.phone_no}</span></div>
          </div>
        </div>

        <div className="section-block">
          <h3 className="section-title">Location Info</h3>
          <div className="field-grid">
            <div className="field-block"><label>City</label><span>{cp.city}</span></div>
            <div className="field-block"><label>State</label><span>{cp.state}</span></div>
            <div className="field-block"><label>ZIP</label><span>{cp.zip}</span></div>
            <div className="field-block"><label>Country</label><span>{cp.country}</span></div>
          </div>
        </div>

        <div className="section-block">
          <h3 className="section-title">Status & Commission</h3>
          <div className="field-grid">
            <div className="field-block"><label>Status</label><span>{cp.status}</span></div>
            <div className="field-block"><label>Commission %</label><span>{cp.commission_percent}</span></div>
            <div className="field-block full-width">
              <label>Agreement</label>
              {cp.agreement_url ? (
                <a href={`https://noqu.co.in/db/download-agreement/${cp.agreement_url}`} target="_blank" rel="noreferrer" className="view-link">View Agreement</a>
              ) : <span>—</span>}
            </div>
            
          </div>
        </div>

        <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>Edit / Approve</button>
      </div>

      {/* Edit Form Slide-in */}
      <div className={`edit-panel ${isEditing ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Edit Channel Partner</h3>
          <button onClick={() => setIsEditing(false)}>✕</button>
        </div>

        <div className="edit-form">
          {/* Country Code + Phone Number in same row */}
          <div className="form-row">
            <div className="form-group phone-code">
              <label>Country Code</label>
              <input name="country_code" value={formData.country_code} onChange={(e) => setFormData({ ...formData, country_code: e.target.value })} />
            </div>
            <div className="form-group phone-number">
              <label>Phone Number</label>
              <input name="phone_no" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} />
            </div>
          </div>

          {/* Remaining fields */}
          {Object.keys(formData).map((field) => {
            if (['id', 'country_code', 'phone_no'].includes(field)) return null;
            return (
              <div key={field} className="form-group">
                <label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                {field === 'status' ? (
                  <select name={field} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <input name={field} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />
                )}
              </div>
            );
          })}

          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CP_Details;
