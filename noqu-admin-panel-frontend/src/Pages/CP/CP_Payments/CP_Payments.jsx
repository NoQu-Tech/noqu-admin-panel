import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CP_Payments.css';

const CP_Payments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState({ from: '', to: '' });
  const [status, setStatus] = useState('all');
  const [loadingId, setLoadingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/db/get-commission-details');
      setPayments(res.data || []);
    } catch {
      toast.error('Failed to fetch commission payments.');
    }
  };

  const triggerPayout = async (paymentMethod) => {
    setLoadingId(selectedPaymentId);
    try {
      await axios.post('/db/razorpay-payout', {
        commission_request_id: selectedPaymentId,
        payment_method: paymentMethod,
      });
      toast.success('Payout triggered!');
      fetchPayments();
    } catch {
      toast.error('Failed to process payout.');
    } finally {
      setLoadingId(null);
      setShowModal(false);
      setSelectedPaymentId(null);
    }
  };

  const handlePayClick = (id) => {
    setSelectedPaymentId(id);
    setShowModal(true);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((item) => {
    const s = search.toLowerCase();
    const matchStatus = status === 'all' || item.status === status;
    const matchSearch = item.cp_name.toLowerCase().includes(s) || item.lead_title.toLowerCase().includes(s);

    const closeDate = new Date(item.closed_at);
    const from = date.from ? new Date(date.from) : null;
    const to = date.to ? new Date(date.to) : null;

    const matchDate = (!from || closeDate >= from) && (!to || closeDate <= to);
    return matchStatus && matchSearch && matchDate;
  });

  return (
    <div className="cp-payments">
      <h2>CP Commission Payments</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by CP or Lead"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="date-range">
          <input type="date" value={date.from} onChange={(e) => setDate({ ...date, from: e.target.value })} />
          <span>to</span>
          <input type="date" value={date.to} onChange={(e) => setDate({ ...date, to: e.target.value })} />
        </div>
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'paid', 'failed'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${status === tab ? 'active' : ''}`}
            onClick={() => setStatus(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>CP Name</th>
              <th>Lead</th>
              <th>Lead ₹</th>
              <th>%</th>
              <th>Commission ₹</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.cp_name}</td>
                <td>{row.lead_title}</td>
                <td>₹ {row.lead_amount}</td>
                <td>{row.commission_percent}%</td>
                <td>₹ {row.commission_amount}</td>
                <td>
                  <span className={`badge ${row.status}`}>{row.status}</span>
                </td>
                <td>
                  {row.status === 'pending' ? (
                    <button
                      onClick={() => handlePayClick(row.id)}
                      disabled={loadingId === row.id}
                      className="pay-btn"
                    >
                      {loadingId === row.id ? 'Paying...' : 'Pay'}
                    </button>
                  ) : (
                    <span className="view-btn">View</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Select Payment Method</h3>
            <div className="modal-buttons">
              <button onClick={() => triggerPayout('upi')} className="method-btn upi">Pay via UPI</button>
              <button onClick={() => triggerPayout('bank')} className="method-btn bank">Pay via Bank</button>
            </div>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CP_Payments;
