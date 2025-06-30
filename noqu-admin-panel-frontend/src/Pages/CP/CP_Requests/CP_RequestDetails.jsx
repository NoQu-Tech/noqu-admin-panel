import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CP_RequestDetails.css';
import backarrow from "./../../../../src/assets/backarrow.png";

const CP_RequestDetail = ({ id, onBack }) => {
  const [cpDetail, setCpDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchCPDetail();
  }, [id]);

  const fetchCPDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://noqu.co.in/db/get-cp-request/${id}`);
      setCpDetail(response.data.cp);
      setStatus(response.data.cp.status);
    } catch (error) {
      toast.error('Failed to load CP details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this CP?')) return;
    setIsApproving(true);
    try {
      await axios.post('https://noqu.co.in/db/approve-cp-request', { id });
      toast.success('CP Approved Successfully!');
      await fetchCPDetail();
    } catch (error) {
      toast.error('Approval failed');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this CP?')) return;
    setIsRejecting(true);
    try {
      await axios.post('https://noqu.co.in/db/reject-cp-request', { id });
      toast.success('CP Rejected Successfully!');
      await fetchCPDetail();
    } catch (error) {
      toast.error('Rejection failed');
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!cpDetail) return <p className="loading-text">No CP Detail Found</p>;

  return (
    <div className="cp-request-container">
      <div className="cp-header">
        <img src={backarrow} alt="Back" className="back-icon" onClick={onBack} />
        <h2>Channel Partner Request</h2>
      </div>

      <div className="section-block">
        <h3 className="section-title">Company Info</h3>
        <div className="field-grid">
          <div className="field-block"><label>Company Name</label><span>{cpDetail.company_name}</span></div>
          <div className="field-block"><label>Type of Company</label><span>{cpDetail.type_of_company}</span></div>
          <div className="field-block"><label>Company Size</label><span>{cpDetail.company_size}</span></div>
          <div className="field-block"><label>Company Address</label><span>{cpDetail.company_address}</span></div>
          <div className="field-block"><label>Website</label><span>{cpDetail.website || 'N/A'}</span></div>
        </div>
      </div>

      <div className="section-block">
        <h3 className="section-title">Contact Info</h3>
        <div className="field-grid">
          <div className="field-block"><label>Full Name</label><span>{cpDetail.full_name}</span></div>
          <div className="field-block"><label>Email</label><span>{cpDetail.email}</span></div>
          <div className="field-block"><label>Phone</label><span>{cpDetail.country_code} {cpDetail.phone_no}</span></div>
        </div>
      </div>

      <div className="section-block">
        <h3 className="section-title">Location Info</h3>
        <div className="field-grid">
          <div className="field-block"><label>City</label><span>{cpDetail.city}</span></div>
          <div className="field-block"><label>State</label><span>{cpDetail.state_province}</span></div>
          <div className="field-block"><label>ZIP</label><span>{cpDetail.zip}</span></div>
          <div className="field-block"><label>Country</label><span>{cpDetail.country}</span></div>
        </div>
      </div>

      <div className="cp-actions">
        {status === 'pending' || status === null ? (
          <>
            <button className="btn approve" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? 'Approving...' : 'Approve'}
            </button>
            <button className="btn reject" onClick={handleReject} disabled={isRejecting}>
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </button>
          </>
        ) : (
          <span className={`status-label ${status}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
    </div>
  );
};

export default CP_RequestDetail;
