import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  CreditCard, 
  UserCircle,
  PlusCircle,
  Eye,
  LayoutGrid,
  Users
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { useFirebase } from './FirebaseProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Megaphone, label: 'Report', path: '/report' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: ShieldCheck, label: 'KYC', path: '/kyc' },
  { icon: CreditCard, label: 'Bank Details', path: '/bank' },
  { icon: Users, label: 'Directory', path: '/directory' },
  { icon: UserCircle, label: 'Profile', path: '/profile' },
];

const adminItems = [
  { icon: Eye, label: 'Admin Queue', path: '/admin' },
  { icon: LayoutGrid, label: 'Photo Moderation', path: '/admin/photos' },
];

export function Sidebar() {
  const { profile } = useFirebase();
  const isAdmin = profile?.role === 'admin';

  const items = isAdmin ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Megaphone, label: 'Report', path: '/admin' },
    { icon: Award, label: 'Achievements', path: '/achievements' },
    { icon: BarChart3, label: 'Leaderboard', path: '/leaderboard' },
    { icon: ShieldCheck, label: 'KYC', path: '/kyc' },
    { icon: CreditCard, label: 'Bank Details', path: '/bank' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ] : navItems;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-border flex flex-col py-8 px-6 z-50 transition-colors duration-300">
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 civic-gradient rounded-xl flex items-center justify-center text-white shadow-sm">
            <Eye size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">Street Sense</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Civic Reporting</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Menu</p>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "text-primary bg-primary/10 border-l-4 border-primary font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-surface-container hover:translate-x-1"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                  <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Administration</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "text-primary bg-primary/10 border-l-4 border-primary font-bold" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-surface-container hover:translate-x-1"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="pt-6 border-t border-border">
        <NavLink
          to={isAdmin ? "/admin" : "/report"}
          className="w-full py-4 civic-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {isAdmin ? <Eye size={18} /> : <PlusCircle size={18} />}
          {isAdmin ? "Moderation Queue" : "Report Violation"}
        </NavLink>
      </div>
    </aside>
  );
}
