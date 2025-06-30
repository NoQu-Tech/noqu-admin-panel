import React, { useState, useEffect, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from '../../utils/axiosInstance';
import "./Dashboard.css"
import { AdminDataContext } from '../../Context/AdminDataContext';

const Dashboard = () => {
    const {
    subdata, unsubdata, subscriptionToday, unsubscriptionToday
  } = useContext(AdminDataContext);
  const [subChartData, setSubChartData] = useState({});
  const [unsubChartData, setUnsubChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [subscribers, setSubscribers] = useState([]);
  const [unsubscribers, setUnsubscribers] = useState([]);
  const [todaySubscribers, setTodaySubscribers] = useState(0);
  const [todayUnsubscribers, setTodayUnsubscribers] = useState(0);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      // const subResponse = await axios.post('http://localhost:3003/db/data');
      // const unsubResponse = await axios.post('http://localhost:3003/db/Unsubdata');
      
      const subResponse = await axios.post('https://noqu.co.in/db/data');
      const unsubResponse = await axios.post('https://noqu.co.in/db/Unsubdata');

      const subData = subResponse.data.message;
      const unsubData = unsubResponse.data.message;
      
      setSubscribers(subData);
      setUnsubscribers(unsubData);
      
      // Calculate today's subscribers and unsubscribers
      const today = new Date().toISOString().split('T')[0];
      const todaySub = subData.filter((item) => item.created_at.startsWith(today));
      const todayUnsub = unsubData.filter((item) => item.deleted_at.startsWith(today));
      
      setTodaySubscribers(todaySub.length);
      setTodayUnsubscribers(todayUnsub.length);
      
      updateCharts(subData, unsubData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  // Set up auto-refresh with useEffect
  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  
  // Update charts based on data
  const updateCharts = (subData, unsubData) => {
    const getLastThreeDates = () => {
      const today = new Date();
      const dates = [];
      for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
      }
      return dates;
    };

    const calculateCounts = (data, dates, dateKey) => {
      return dates.map((date) =>
        data.filter((item) => item[dateKey]?.startsWith(date)).length
      );
    };

    const lastThreeDates = getLastThreeDates();

    const subCounts = calculateCounts(subData, lastThreeDates, 'created_at');
    const unsubCounts = calculateCounts(unsubData, lastThreeDates, 'deleted_at');

    setSubChartData({
      labels: lastThreeDates,
      datasets: [
        {
          label: 'Subscribers',
          data: subCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    });

    setUnsubChartData({
      labels: lastThreeDates,
      datasets: [
        {
          label: 'Unsubscribers',
          data: unsubCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    });

    setChartOptions({
      responsive: true,
      plugins: {
        tooltip: { enabled: true },
      },
    });
  };


  return (
    <div className="Dashboard">
      <div className="Dashboard_head">
        <h2 className="TAM_h1">Dashboard</h2>
        {/* <button className="refresh-button" onClick={fetchData}>
          Refresh
        </button> */}
      </div>
      <div className="Dashboard_data-container">
        <div className="Dashboard_data">
          <h5>Total Subscribers</h5>
          <p>{subscribers.length}</p>
        </div>
        <div className="Dashboard_data">
          <h5>Total UnSubscribers</h5>
          <p>{unsubscribers.length}</p>
        </div>
        <div className="Dashboard_data">
          <h5>Today Subscribers</h5>
          <p>{todaySubscribers}</p>
        </div>
        <div className="Dashboard_data">
          <h5>Today UnSubscribers</h5>
          <p>{todayUnsubscribers}</p>
        </div>
      </div>
      <div className="chart">
        <div className="chart-container">
          <h3>Subscribers Over Last 5 Days</h3>
          {subChartData.labels && (
            <Bar data={subChartData} options={{ ...chartOptions, plugins: { title: { text: 'Subscribers' } } }} />
          )}
        </div>
        <div className="chart-container">
          <h3>Unsubscribers Over Last 5 Days</h3>
          {unsubChartData.labels && (
            <Bar data={unsubChartData} options={{ ...chartOptions, plugins: { title: { text: 'Unsubscribers' } } }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
