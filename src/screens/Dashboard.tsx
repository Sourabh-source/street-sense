import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Camera, 
  Award, 
  Trophy, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ArrowRight,
  AlertTriangle,
  Megaphone as MegaphoneIcon,
  BarChart3 as BarChart3Icon
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/src/lib/utils';

const trendData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 65 },
  { name: 'Wed', value: 50 },
  { name: 'Thu', value: 85 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 45 },
  { name: 'Sun', value: 30 },
];

import { useFirebase } from '../components/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useFirebase();
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('reporterUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const latestReport = reports[0];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div className="md:col-span-2 space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Welcome back, {profile?.displayName || user?.displayName || 'Citizen'}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
            Your reports helped resolve {profile?.sensePoints ? Math.floor(profile.sensePoints / 10) : 0} issues this week. The city is safer because of you.
          </p>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center border-b-4 border-primary">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Total SensePoints</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-on-surface">{profile?.sensePoints || 0}</span>
            <Star className="text-primary fill-primary" size={24} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 italic">Keep reporting to earn more!</p>
        </div>
      </section>

      {/* Quick Actions Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => navigate('/report')}
          className="group relative overflow-hidden bg-primary p-8 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-md cursor-pointer"
        >
          <div className="relative z-10">
            <Camera className="text-white/80 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white">Report Violation</h3>
            <p className="text-white/70 text-sm mt-1">Submit a new geo-tagged incident report.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <MegaphoneIcon className="w-32 h-32 text-white" />
          </div>
        </button>
        
        <button 
          onClick={() => navigate('/achievements')}
          className="group relative overflow-hidden bg-surface-container-lowest p-8 rounded-2xl text-left transition-all hover:scale-[1.02] border border-border hover:border-primary/10 shadow-sm cursor-pointer"
        >
          <div className="relative z-10">
            <Award className="text-primary mb-4" size={40} />
            <h3 className="text-xl font-bold text-on-surface">View Achievements</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unlock badges and redeem SensePoints.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Trophy className="w-32 h-32 text-primary" />
          </div>
        </button>
      </section>

      {/* Insights & Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Violation Trends Chart */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6 border border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Violation Trends</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase text-on-surface">Weekly</span>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--color-on-surface)', opacity: 0.5 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: 'var(--color-on-surface)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? 'var(--color-primary)' : 'var(--color-primary-container)'} className="hover:fill-primary/40 transition-colors" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk Areas */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col border border-border">
          <div className="p-8 pb-4">
            <h3 className="text-xl font-bold text-on-surface">High-Risk Watchlist</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suggested areas for patrol based on recent reports.</p>
          </div>
          <div className="flex-1 px-8 pb-8 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-error-container/20 group hover:bg-error-container/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center text-error">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface leading-tight">Koramangala Market</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">14 unauthorized stalls reported today</p>
              </div>
              <span className="px-2 py-1 bg-error text-white text-[10px] font-bold rounded">URGENT</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-high group hover:bg-surface-container-highest transition-colors">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface leading-tight">Indiranagar Residential</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Illegal dumping trends rising</p>
              </div>
              <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded">WATCH</span>
            </div>
          </div>
        </div>
      </section>

      {/* My Reports Tracker */}
      <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-8 border border-border">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-on-surface">My Reports Tracker</h3>
            {latestReport ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Real-time status of your last submission: <span className="font-bold text-on-surface">#{latestReport.id.slice(0, 8).toUpperCase()}</span></p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No reports submitted yet.</p>
            )}
          </div>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View All Reports
            <ArrowRight size={16} />
          </button>
        </div>

        {latestReport && (
          <>
            <div className="relative py-4">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 w-3/4 h-[2px] bg-primary -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 flex justify-between items-center">
                <StatusStep label="Submitted" time={latestReport.createdAt?.toDate().toLocaleDateString() || 'Just now'} completed />
                <StatusStep label="Under Review" time="Pending" active={latestReport.status === 'under-review'} completed={['verified', 'action-taken', 'resolved'].includes(latestReport.status)} />
                <StatusStep label="Verified" time="Pending" active={latestReport.status === 'verified'} completed={['action-taken', 'resolved'].includes(latestReport.status)} />
                <StatusStep label="Action Taken" time="Pending" active={latestReport.status === 'action-taken'} completed={latestReport.status === 'resolved'} />
                <StatusStep label="Resolved" time="Pending" active={latestReport.status === 'resolved'} />
              </div>
            </div>

            <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-6 border border-border">
              <img 
                alt="Issue thumbnail" 
                className="w-24 h-24 rounded-lg object-cover shadow-sm" 
                src={latestReport.imageUrl}
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded">{latestReport.type}</span>
                <h4 className="font-bold text-on-surface">{latestReport.type} at {latestReport.location}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{latestReport.notes || 'No additional notes provided.'}</p>
                <div className="flex items-center gap-4 pt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {latestReport.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {latestReport.createdAt?.toDate().toLocaleTimeString() || 'Just now'}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatusStep({ label, time, completed, active }: { label: string, time: string, completed?: boolean, active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all",
        completed ? "bg-primary text-white" : active ? "bg-primary-container text-white animate-pulse scale-110 border-4 border-surface-container-lowest" : "bg-surface-container-high text-slate-400 dark:text-slate-500"
      )}>
        {completed ? <CheckCircle2 size={20} /> : active ? <Wrench size={20} /> : <CheckCircle2 size={20} />}
      </div>
      <div className="text-center">
        <p className={cn("text-[11px] font-bold uppercase tracking-wider", active ? "text-primary" : "text-on-surface")}>{label}</p>
        <p className={cn("text-[9px]", active ? "text-primary font-medium italic underline" : "text-slate-400 dark:text-slate-500")}>{time}</p>
      </div>
    </div>
  );
}

// Removed redundant icon components as they are now imported correctly
