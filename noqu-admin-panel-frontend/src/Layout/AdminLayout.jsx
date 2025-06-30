import { Outlet } from 'react-router-dom';
import './AdminLayout.css';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="admin">
      <AdminSidebar />
      <div className="admin_display">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
