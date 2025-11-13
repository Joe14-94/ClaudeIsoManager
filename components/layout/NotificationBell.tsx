import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertCircle, CircleDollarSign, Check, DatabaseZap } from 'lucide-react';
import { useNotificationsContext } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, path: string, state: any) => {
    markAsRead(id);
    navigate(path, { state });
    setIsOpen(false);
  };

  const NotificationIcon = ({ type }: { type: 'deadline' | 'budget' | 'warning' }) => {
    if (type === 'deadline') {
      return <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    }
    if (type === 'warning') {
        return <DatabaseZap className="w-5 h-5 text-orange-500 flex-shrink-0" />;
    }
    return <CircleDollarSign className="w-5 h-5 text-red-500 flex-shrink-0" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-slate-200 rounded-full"
        aria-label={`Notifications (${unreadCount} non lues)`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">Aucune notification.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <li
                    key={notif.id}
                    className={`p-3 hover:bg-slate-50 cursor-pointer ${notif.read ? 'opacity-60' : ''}`}
                    onClick={() => handleNotificationClick(notif.id, notif.linkTo.path, notif.linkTo.state)}
                  >
                    <div className="flex items-start gap-3">
                      <NotificationIcon type={notif.type} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                      {!notif.read && (
                        <Tooltip text="Marquer comme lu">
                            <button
                                onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                className="p-1 rounded-full hover:bg-green-100"
                            >
                                <Check size={16} className="text-green-600" />
                            </button>
                        </Tooltip>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const Tooltip: React.FC<{ children: React.ReactElement, text: string }> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="relative">
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded-md shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};


export default NotificationBell;