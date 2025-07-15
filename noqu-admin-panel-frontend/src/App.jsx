// App.jsx
import { Routes, Route } from 'react-router-dom';
import { AdminDataProvider } from './Context/AdminDataContext';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './Pages/Dashboard/Dashboard';
import Compose from './Pages/Compose/Compose';
import Subscribers from './Pages/Subscribers/Subscribers';
import UnSubscribers from './Pages/UnSubscribers/UnSubscribers';
import CMS_News from './Pages/CMS/News_CMS/CMS_News';
import CP_Requests from './Pages/CP/CP_Requests/CP_Requests';
import CP_Members from './Pages/CP/CP_Members/CP_Members';
import CP_Payments from './Pages/CP/CP_Payments/CP_Payments';
import CP_RequestDetail from './Pages/CP/CP_Requests/CP_RequestDetails';
import AdminLogin from './Layout/AdminLogin';
import ProtectedRoute from './Components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Unauthorized from './Pages/Unauthorized';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Blog_CMS from './Pages/CMS/Blog_CMS/Blog_CMS';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  return (
    <AdminDataProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin only */}
          <Route
            index
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'accounts']}>
                <Dashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="compose"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Compose />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="subscribers"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Subscribers />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="unsubscribers"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UnSubscribers />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="news"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <CMS_News />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="blogs"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Blog_CMS />
              </RoleProtectedRoute>
            }
          />

          {/* Shared: admin & accounts */}
          <Route
            path="cp-members"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'accounts']}>
                <CP_Members />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="cp-requests"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'accounts']}>
                <CP_Requests />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="cp-request-detail/:id"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'accounts']}>
                <CP_RequestDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="cp-payments"
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'accounts']}>
                <CP_Payments />
              </RoleProtectedRoute>
            }
          />
        </Route>
        
      </Routes>
    </AdminDataProvider>
  );
}

export default App;
