import React from 'react';
import { 
  Star, 
  Award, 
  Trophy, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Globe,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const leaderboardData = [
  { rank: '01', name: 'Marcus_Vane', role: 'Elite Guardian', reports: 1204, accuracy: '99.8%', score: 985, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', medal: 'amber' },
  { rank: '02', name: 'Elena_Rossi', role: 'Master Verifier', reports: 942, accuracy: '98.5%', score: 942, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop', medal: 'slate' },
  { rank: '03', name: 'Amara_K', role: 'Urban Sentinel', reports: 886, accuracy: '97.9%', score: 890, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop', medal: 'orange' },
];

export default function Achievements() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <section className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-on-surface">Achievement Board</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Track your impact and climb the ranks of civic excellence.</p>
      </section>

      {/* Progress Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Reputation Card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-2xl relative overflow-hidden group border border-border shadow-sm">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Current Reputation</p>
                <h3 className="text-5xl font-black text-on-surface">8,450 <span className="text-xl font-normal text-slate-400 dark:text-slate-500">XP</span></h3>
              </div>
              <div className="bg-primary/5 text-primary px-4 py-2 rounded-full font-bold text-sm border border-primary/10">
                Level 12: Urban Sentinel
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-on-surface">
                <span>Progress to Level 13</span>
                <span>84%</span>
              </div>
              <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-container h-full w-[84%] rounded-full"></div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">Earn 550 more XP by verifying reports to reach Level 13.</p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Stats Quick View */}
        <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between border border-border">
          <h4 className="font-bold text-on-surface">Quick Stats</h4>
          <div className="space-y-6">
            <StatItem icon={CheckCircle2} label="Verified Reports" value="142" color="text-primary" />
            <StatItem icon={ShieldCheck} label="Accuracy Rate" value="98.2%" color="text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-black text-on-surface">Badge Collection</h3>
          <a className="text-primary font-bold text-sm hover:underline" href="#">View all 48 badges</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <Badge icon={Zap} label="First Report" desc="Awarded for your very first submission." color="bg-emerald-500/10 text-emerald-500" />
          <Badge icon={ShieldCheck} label="Street Guardian" desc="Reported 50 verified safety hazards." color="bg-primary/10 text-primary" />
          <Badge icon={Award} label="Top Verifier" desc="Maintained 95%+ accuracy for 30 days." color="bg-amber-500/10 text-amber-500" />
          <Badge icon={Star} label="7-Day Streak" desc="Active for 7 consecutive days." color="bg-orange-500/10 text-orange-500" />
          <Badge icon={Lock} label="Civic Hero" desc="Reach 10,000 Reputation" locked />
          <Badge icon={Globe} label="Global Impact" desc="Contribute across 5 cities" locked />
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-on-surface">Leaderboard</h3>
          <div className="inline-flex bg-surface-container-low p-1 rounded-full border border-border">
            <button className="px-6 py-2 rounded-full text-sm font-bold transition-colors text-slate-500 dark:text-slate-400">Weekly</button>
            <button className="px-6 py-2 rounded-full text-sm font-bold bg-surface-container-lowest shadow-sm text-primary transition-colors border border-border">Monthly</button>
            <button className="px-6 py-2 rounded-full text-sm font-bold transition-colors text-slate-500 dark:text-slate-400">All-time</button>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-border shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                <th className="px-8 py-4">Rank</th>
                <th className="px-8 py-4">Citizen Name</th>
                <th className="px-8 py-4 text-center">Verified Reports</th>
                <th className="px-8 py-4 text-center">Accuracy</th>
                <th className="px-8 py-4 text-right">Trust Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboardData.map((player) => (
                <tr key={player.rank} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={cn("font-black text-lg", player.medal === 'amber' ? "text-amber-500" : player.medal === 'slate' ? "text-slate-400" : "text-orange-400")}>{player.rank}</span>
                      <Trophy size={18} className={cn(player.medal === 'amber' ? "text-amber-400" : player.medal === 'slate' ? "text-slate-300" : "text-orange-300")} fill="currentColor" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img alt={player.name} className="w-10 h-10 rounded-full object-cover" src={player.avatar} referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-on-surface">{player.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{player.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-medium text-on-surface">{player.reports}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">{player.accuracy}</span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-primary">{player.score}</td>
                </tr>
              ))}
              <tr className="bg-primary/5">
                <td className="px-8 py-6">
                  <span className="font-black text-on-surface opacity-60 text-lg">12</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img alt="You" className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" referrerPolicy="no-referrer" />
                      <span className="absolute -top-1 -right-1 bg-primary text-[8px] text-white px-1 rounded-full font-bold">YOU</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Citizen 492</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Master Verifier</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-medium text-on-surface">142</td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">98.2%</span>
                </td>
                <td className="px-8 py-6 text-right font-black text-primary">720</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm border border-border">
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter font-bold">{label}</p>
        <p className="font-bold text-xl text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label, desc, color, locked }: { icon: any, label: string, desc: string, color?: string, locked?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-xl text-center space-y-3 transition-colors",
      locked ? "bg-surface-container-low opacity-60 grayscale" : "bg-surface-container-lowest border border-border shadow-sm hover:border-primary/20"
    )}>
      <div className={cn(
        "w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-inner",
        locked ? "bg-surface-container-high text-slate-400 dark:text-slate-500" : color
      )}>
        <Icon size={32} fill={!locked ? "currentColor" : "none"} />
      </div>
      <p className="font-bold text-sm text-on-surface">{label}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}
