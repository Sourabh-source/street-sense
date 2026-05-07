import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, CheckCheck, Inbox } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const { user, profile } = useFirebase();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-3 sticky top-0 bg-surface/80 backdrop-blur-xl z-40 border-b border-border">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input 
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" 
            placeholder="Search reports, areas, or users..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center bg-surface-container-low/50">
                    <h3 className="font-bold text-on-surface">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Inbox className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-sm text-slate-500">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-4 border-b border-border last:border-0 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className={`text-sm font-bold ${!notif.read ? 'text-on-surface' : 'text-slate-600'}`}>{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2">
                                {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </p>
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="h-6 w-6 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors"
                                title="Mark as read"
                              >
                                <CheckCheck size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-surface-container-low/50 text-center border-t border-border">
                    <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <div className="h-8 w-[1px] bg-border mx-2"></div>
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-2 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              {profile?.role === 'admin' ? (profile?.displayName || 'Admin Verifier') : (profile?.displayName || user?.displayName || 'Citizen')}
            </p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">
              {profile?.role === 'admin' ? `Badge #SS-${user?.uid?.slice(0, 4).toUpperCase() || '8821'}` : 'Civic Contributor'}
            </p>
          </div>
          <img 
            alt="User avatar" 
            className="w-10 h-10 rounded-full border-2 border-surface shadow-sm object-cover group-hover:border-primary/20 transition-all" 
            src={profile?.photoURL || user?.photoURL || (profile?.role === 'admin' ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop")}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
