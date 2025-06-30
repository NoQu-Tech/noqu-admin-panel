import React, { useState, useContext, useMemo, useEffect } from 'react';
import AdminDataContext from '../../Context/AdminDataContext';
import './UnSubscribers.css';

import refresh from './../../../src/assets/refresh.png';
import subscriber from './../../../src/assets/subscriber.png';
import subscribers from './../../../src/assets/subscribers.png';

const UnSubscribers = () => {
  const {
    unsubdata,
    filteredUnSubData,
    setFilteredUnSubData,
    unsubloading,
    unsubcount,
    unsubscriptionToday,
    fetchUnSubData,
  } = useContext(AdminDataContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  useEffect(() => {
    if (unsubdata.length && filteredUnSubData.length === 0) {
      setFilteredUnSubData(unsubdata);
    }
  }, [unsubdata, filteredUnSubData]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length) {
      const filtered = unsubdata.filter(item =>
        item.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUnSubData(filtered);
    } else {
      setFilteredUnSubData(unsubdata);
    }
  };

  const handleSearch2 = (event) => {
    const value = event.target.value;
    setSearchTerm2(value);
    if (value.length) {
      const filtered = unsubdata.filter(item =>
        item.deleted_at.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUnSubData(filtered);
    } else {
      setFilteredUnSubData(unsubdata);
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
    const data = Array.isArray(filteredUnSubData) ? filteredUnSubData : [];
    const sorted = [...data];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUnSubData, sortConfig]);

  return (
    <div className="subscribers">
      <div className="subscribers_head">
        <h1 className='TAM_h1'>Unsubscribers</h1>
        <div className="subscribers_search-box">
          <div className="subscribers_search">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="subscribers_search_date">
            <span onClick={fetchUnSubData}>
              <img src={refresh} width={17} style={{ marginRight: 8 }} /> Refresh
            </span>
            <div className="subscribers_count">
              <img src={subscribers} width={17} style={{ marginRight: 8 }} /> Total: {unsubcount}
            </div>
            <div className="subscribers_count">
              <img src={subscriber} width={17} style={{ marginRight: 8 }} /> Unsubscribed Today: {unsubscriptionToday}
            </div>
            <input type="date" value={searchTerm2} onChange={handleSearch2} />
          </div>
        </div>
      </div>

      <div className="subscribers_container">
        {unsubloading ? (
          <div className="nodata">Loading...</div>
        ) : sortedData.length === 0 ? (
          <div className="nodata"><p>No data found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
                <th onClick={() => requestSort('email')}>Email {sortConfig.key === 'email' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
                <th onClick={() => requestSort('deleted_at')}>Unsubscribed At {sortConfig.key === 'deleted_at' ? (sortConfig.direction === 'ascending' ? '▼' : '▲') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.deleted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UnSubscribers;
