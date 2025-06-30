import { createContext, useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

export const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  const [subdata, setSubData] = useState([]);
  const [filteredSubData, setFilteredSubData] = useState([]);
  const [subloading, setSubLoading] = useState(true);
  const [subcount, setSubCount] = useState();
  const [subscriptionToday, setSubscriptionToday] = useState(0);

  const [unsubdata, setUnSubData] = useState([]);
  const [filteredUnSubData, setFilteredUnSubData] = useState([]);
  const [unsubloading, setUnsubLoading] = useState(true);
  const [unsubcount, setUnSubCount] = useState();
  const [unsubscriptionToday, setUnSubscriptionToday] = useState(0);

  const fetchSubData = async () => {
    setSubLoading(true);
    try {
      const res = await axios.post('https://noqu.in/db/data');
      const data = res.data.message;
      setSubData(data);
      setFilteredSubData(data);
      setSubCount(data.length);
      const today = new Date().toISOString().split('T')[0];
      const todaySubs = data.filter(d => new Date(d.created_at).toISOString().split('T')[0] === today);
      setSubscriptionToday(todaySubs.length);
    } catch (err) {
      console.error("Subscriber fetch error:", err);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchUnSubData = async () => {
    setUnsubLoading(true);
    try {
      const res = await axios.post('https://noqu.in/db/Unsubdata');
      const data = res.data.message;
      setUnSubData(data);
      setFilteredUnSubData(data);
      setUnSubCount(data.length);
      const today = new Date().toISOString().split('T')[0];
      const todayUnsubs = data.filter(d => new Date(d.deleted_at).toISOString().split('T')[0] === today);
      setUnSubscriptionToday(todayUnsubs.length);
    } catch (err) {
      console.error("Unsubscriber fetch error:", err);
    } finally {
      setUnsubLoading(false);
    }
  };

  useEffect(() => {
    fetchSubData();
    fetchUnSubData();
  }, []);

  return (
    <AdminDataContext.Provider value={{
      subdata, filteredSubData, setFilteredSubData, subloading, subcount, subscriptionToday, fetchSubData,
      unsubdata, filteredUnSubData, setFilteredUnSubData, unsubloading, unsubcount, unsubscriptionToday, fetchUnSubData,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};
export default AdminDataContext;