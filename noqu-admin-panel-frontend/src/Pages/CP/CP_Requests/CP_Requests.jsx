import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import CP_RequestDetail from './CP_RequestDetails';
import "./CP_Requests.css";

const CP_Requests = () => {
    const [requests, setRequests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selectedCP, setSelectedCP] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const statusMap = {
        active: ['active', 'approved'],
        inactive: ['inactive', 'rejected'],
        pending: ['pending', 'awaiting approval']
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('https://noqu.co.in/db/get-cp-requests');
            setRequests(response.data.requests);
            setFiltered(response.data.requests); // Initial render
            console.log('Fetched requests:', response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    useEffect(() => {
        let result = [...requests];

        if (statusFilter !== 'all') {
            result = result.filter(r =>
                statusMap[statusFilter]?.some(value =>
                    r.status?.toLowerCase().includes(value)
                )
            );
        }

        // Search filter
        if (searchTerm.trim() !== '') {
            const keyword = searchTerm.toLowerCase();
            result = result.filter(r =>
                r.company_name?.toLowerCase().includes(keyword) ||
                r.full_name?.toLowerCase().includes(keyword) ||
                r.phone_no?.includes(keyword)
            );
        }

        // Date range filter
        if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            result = result.filter(r => new Date(r.created_at) >= fromDate);
        }
        if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            result = result.filter(r => new Date(r.created_at) <= toDate);
        }

        // Sorting
        if (sortKey) {
            result.sort((a, b) => {
                const valA = a[sortKey]?.toString().toLowerCase() || '';
                const valB = b[sortKey]?.toString().toLowerCase() || '';
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFiltered(result);
    }, [statusFilter, searchTerm, dateRange, sortKey, sortOrder, requests]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    if (selectedCP) {
        return (
            <CP_RequestDetail
                id={selectedCP}
                fullDetails={requests.find((req) => req.id === selectedCP)}
                onBack={() => setSelectedCP(null)}
            />
        );
    }

    return (
        <div className="cp-requests">
            <h2 className="page-title">Channel Partner Requests</h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by name, company, or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="active">Approved</option>
                    <option value="inactive">Rejected</option>
                    <option value="pending">Pending</option>
                </select>

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

            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th onClick={() => toggleSort('company_name')}>Company</th>
                            <th onClick={() => toggleSort('full_name')}>Name</th>
                            <th onClick={() => toggleSort('phone_no')}>Phone</th>
                            <th onClick={() => toggleSort('city')}>City</th>
                            <th onClick={() => toggleSort('created_at')}>Applied At</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((req) => {
                            const status = req.status?.toLowerCase();
                            return (
                                <tr key={req.id}>
                                    <td>{req.company_name}</td>
                                    <td>{req.full_name}</td>
                                    <td>{req.phone_no}</td>
                                    <td>{req.city || '—'}</td>
                                    <td>{formatDate(req.created_at)}</td>
                                    <td>
                                        <span className={`badge ${status === 'approved' ? 'success' :
                                                status === 'rejected' ? 'danger' : 'warning'
                                            }`}>
                                            {req.status}
                                        </span>
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
        </div>
    );
};

export default CP_Requests;