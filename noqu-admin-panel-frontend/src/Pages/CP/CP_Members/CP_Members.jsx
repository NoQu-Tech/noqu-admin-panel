import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CP_Details from './CP_Details';
import './CP_Members.css';

const CP_Members = () => {
  const [members, setMembers] = useState([]);
  const [selectedCP, setSelectedCP] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://noqu.co.in/db/get-cp-members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members.');
    }
  };

  const filteredMembers = members.filter((cp) => {
    const status = cp.status?.toLowerCase().trim();
    const hasAgreement = !!cp.agreement_url;
    const createdAt = new Date(cp.created_at);

    // Filter tab condition
    let match = true;
    if (filter === 'awaiting') match = !hasAgreement && status !== 'active';
    if (filter === 'uploaded') match = hasAgreement && status !== 'active';
    if (filter === 'active') match = status === 'active';
    if (filter === 'inactive') match = status === 'inactive';

    // Search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      const nameMatch = cp.full_name?.toLowerCase().includes(lower);
      const emailMatch = cp.email?.toLowerCase().includes(lower);
      const phoneMatch = cp.phone_no?.toLowerCase().includes(lower);
      const companyMatch = cp.company_name?.toLowerCase().includes(lower);
      match = match && (nameMatch || emailMatch || phoneMatch || companyMatch);
    }

    // Date filter
    if (dateRange.from) {
      const from = new Date(dateRange.from);
      match = match && createdAt >= from;
    }
    if (dateRange.to) {
      const to = new Date(dateRange.to);
      match = match && createdAt <= to;
    }

    return match;
  });

  if (selectedCP) {
    return (
      <CP_Details
        id={selectedCP}
        fullDetails={members.find((req) => req.id === selectedCP)}
        onBack={() => setSelectedCP(null)}
      />
    );
  }

  return (
    <div className="cp-members">
      <h2 className="page-title">Channel Partner Members</h2>

      <div className="filters">
        
        <input
          type="text"
          placeholder="Search name, email, phone, or company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="date-range">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>

      <div className="filter-tabs">
        {['all', 'awaiting', 'uploaded', 'active', 'inactive'].map((type) => (
          <button
            key={type}
            className={`tab-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' && 'All'}
            {type === 'awaiting' && 'Awaiting Agreement'}
            {type === 'uploaded' && 'Uploaded - Pending Approval'}
            {type === 'active' && 'Active'}
            {type === 'inactive' && 'Inactive'}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Agreement</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((req) => {
              const status = req.status?.toLowerCase();
              return (
                <tr key={req.id}>
                  <td>{req.company_name}</td>
                  <td>{req.full_name}</td>
                  <td>{req.email}</td>
                  <td>{req.phone_no}</td>
                  <td>
                    <span className={`badge ${
                      status === 'active' ? 'success' :
                      status === 'inactive' ? 'danger' : 'warning'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.agreement_url ? (
                      <span className="badge success">Uploaded</span>
                    ) : (
                      <span className="badge neutral">Not Uploaded</span>
                    )}
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedCP(req.id)}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
    </div>
  );
};

export default CP_Members;
