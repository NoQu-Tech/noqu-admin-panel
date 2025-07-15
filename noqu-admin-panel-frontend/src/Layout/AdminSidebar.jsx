import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

import logo from '../assets/logo.png';
import Admin_dashboard from '../assets/Admin_dashboard.png';
import newsletterimg from '../assets/newsletterimg.png';
import arrow1 from '../assets/arrow1.png';
import { RiMenu3Line } from 'react-icons/ri';
import { FiLogOut } from 'react-icons/fi';

const AdminSidebar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [newsLetter, setNewsLetter] = useState(false);
  const [CMSmenu, setCMSmenu] = useState(false);
  const [CPmenu, setCPmenu] = useState(false);

  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  return (
    <>
      <div className="admin_mobile_menu_control">
        <RiMenu3Line color="black" size={27} onClick={() => setToggleMenu(true)} />
      </div>

      <div className="admin_menu">
        <div className="admin_menu_head">
          <div className="admin_menu_head-img">
            <img src={logo} alt="Logo" />
          </div>
          <h5>{role?.toUpperCase()}</h5>
        </div>

        <div className="admin_menu_body">
          <ul>
            {role === 'admin' && (
              <>
                <li>
                  <NavLink to="/" end>
                    <img src={Admin_dashboard} width={15} style={{ marginRight: 8 }} /> Dashboard
                  </NavLink>
                </li>

                <li onClick={() => {
                  setNewsLetter(!newsLetter);
                  setCMSmenu(false);
                  setCPmenu(false);
                }}>
                  <img src={newsletterimg} width={15} style={{ marginRight: 8 }} /> News Letter
                </li>
                {newsLetter && (
                  <div className="drop1" style={{ marginLeft: "25px" }}>
                    <li><NavLink to="/compose"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Compose</NavLink></li>
                    <li><NavLink to="/subscribers"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Subscribers</NavLink></li>
                    <li><NavLink to="/unsubscribers"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> UnSubscribers</NavLink></li>
                  </div>
                )}

                <li onClick={() => {
                  setCMSmenu(!CMSmenu);
                  setNewsLetter(false);
                  setCPmenu(false);
                }}>
                  <img src={newsletterimg} width={15} style={{ marginRight: 8 }} /> CMS
                </li>
                {CMSmenu && (
                  <div className="drop1" style={{ marginLeft: "25px" }}>
                    <li><NavLink to="/news"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> News</NavLink></li>
                    <li><NavLink to="/blogs"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Blogs</NavLink></li>
                  </div>
                )}
              </>
            )}

            {(role === 'admin' || role === 'accounts') && (
              <>
                <li onClick={() => {
                  setCPmenu(!CPmenu);
                  setNewsLetter(false);
                  setCMSmenu(false);
                }}>
                  <img src={newsletterimg} width={15} style={{ marginRight: 8 }} /> Channel Partner
                </li>
                {CPmenu && (
                  <div className="drop1" style={{ marginLeft: "25px" }}>
                    <li><NavLink to="/cp-requests"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Requests</NavLink></li>
                    <li><NavLink to="/cp-members"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Members</NavLink></li>
                    <li><NavLink to="/cp-payments"><img src={arrow1} width={10} style={{ marginRight: 8 }} /> Payments</NavLink></li>
                  </div>
                )}
              </>
            )}
          </ul>

          {/* ✅ Logout button fixed at bottom */}
          <ul className="logout_list">
            <li onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              navigate('/login');
            }}>
              <FiLogOut style={{ marginRight: 8 }} />
              <span>Logout</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
