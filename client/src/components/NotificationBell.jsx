// Notification bell with proper SVG icon and outside-click-to-close
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => { fetchNotifications(); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/my');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button className="bell-btn" onClick={() => setIsOpen(!isOpen)} title="Notifications">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 && <div className="notification-item">No notifications</div>}
          {notifications.map(n => (
            <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`} onClick={() => markAsRead(n._id)}>
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
