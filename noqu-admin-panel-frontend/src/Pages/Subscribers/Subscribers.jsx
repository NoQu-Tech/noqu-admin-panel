import React, { useState, useContext, useMemo, useEffect } from 'react';
import AdminDataContext from '../../Context/AdminDataContext';
import './Subscribers.css';

import refresh from './../../../src/assets/refresh.png';
import subscriber from './../../../src/assets/subscriber.png';
import subscribers from './../../../src/assets/subscribers.png';
import axios from '../../utils/axiosInstance';

const Subscribers = () => {
  const {
    subdata,
    filteredSubData,
    setFilteredSubData,
    subloading,
    subcount,
    subscriptionToday,
    setSubscriptionToday,
    fetchSubData,
  } = useContext(AdminDataContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  useEffect(() => {
    if (subdata.length && filteredSubData.length === 0) {
      setFilteredSubData(subdata);
    }
  }, [subdata, filteredSubData]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length) {
      const filtered = subdata.filter(item =>
        item.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSubData(filtered);
    } else {
      setFilteredSubData(subdata);
    }
  };

  const handleSearch2 = (event) => {
    const value = event.target.value;
    setSearchTerm2(value);
    if (value.length) {
      const filtered = subdata.filter(item =>
        item.created_at.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSubData(filtered);
      setSubscriptionToday(filtered.length);
    } else {
      setFilteredSubData(subdata);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const data = Array.isArray(filteredSubData) ? filteredSubData : [];
    const sorted = [...data];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSubData, sortConfig]);

  const handleUnsubscribe = (id, email) => {
    setSubscriptionStatus(prev => ({ ...prev, [id]: false }));

    axios.post('https://noqu.co.in/db/delete', { id, email })
      .then(res => console.log(res.data.message))
      .catch(err => console.error(err));
  };

  return (
    <div className="subscribers">
      <div className="subscribers_head">
        <h1 className='TAM_h1'>Subscribers</h1>
        <div className="subscribers_search-box">
          <div className="subscribers_search">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="subscribers_search_date">
            <span onClick={fetchSubData}>
              <img src={refresh} width={17} style={{ marginRight: 8 }} /> Refresh
            </span>
            <div className="subscribers_count">
              <img src={subscribers} width={17} style={{ marginRight: 8 }} /> Total: {subcount}
            </div>
            <div className="subscribers_count">
              <img src={subscriber} width={17} style={{ marginRight: 8 }} /> New Today: {subscriptionToday}
            </div>
            <input type="date" value={searchTerm2} onChange={handleSearch2} />
          </div>
        </div>
      </div>

      <div className="subscribers_container">
        {subloading ? (
          <div className="nodata">Loading...</div>
        ) : sortedData.length === 0 ? (
          <div className="nodata"><p>No data found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
                <th onClick={() => requestSort('email')}>Email {sortConfig.key === 'email' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
                <th onClick={() => requestSort('created_at')}>Subscribed At {sortConfig.key === 'created_at' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className={subscriptionStatus[user.id] === false ? 'Admin_Unsubcribed' : 'Admin_Unsubcribe'}
                      onClick={() => handleUnsubscribe(user.id, user.email)}
                    >
                      {subscriptionStatus[user.id] === false ? 'Unsubscribed' : 'Unsubscribe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
