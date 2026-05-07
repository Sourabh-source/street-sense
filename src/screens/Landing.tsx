import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  ArrowRight, 
  Camera, 
  Send, 
  Wallet, 
  ShieldAlert, 
  BarChart3, 
  Trophy, 
  AlertTriangle,
  CheckCircle2,
  Users,
  Coins,
  Ban,
  TrafficCone,
  ArrowLeftRight,
  UserCheck,
  ChevronRight,
  Map as MapIcon,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '../components/ThemeProvider';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const stats = [
    { label: 'Total Violations Resolved', value: '15,204', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Citizens', value: '8,450', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'SensePoints Distributed', value: '2.4M', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const rules = [
    { 
      title: 'No Parking Zones', 
      desc: 'Identifying vehicles blocking pedestrian paths or emergency exits.', 
      icon: Ban,
      bg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      title: 'Signal Jumping', 
      desc: 'Reporting hazardous red-light violations to improve junction safety.', 
      icon: TrafficCone,
      bg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      title: 'Wrong-way Driving', 
      desc: 'Critical reporting for vehicles moving against the designated traffic flow.', 
      icon: ArrowLeftRight,
      bg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      title: 'Helmet Compliance', 
      desc: 'Ensuring rider safety through community-led awareness monitoring.', 
      icon: UserCheck,
      bg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
  ];

  const steps = [
    { title: 'Snap', desc: 'Capture a clear photo or video of the traffic violation as it happens.', icon: Camera },
    { title: 'Submit', desc: 'Upload the evidence via our app with location tagging for verification.', icon: Send },
    { title: 'Earn', desc: 'Once verified by the authorities, receive SensePoints instantly.', icon: Wallet },
  ];

  const rewards = [
    { type: 'Illegal Parking', amount: '50 pts' },
    { type: 'Signal Violation', amount: '100 pts' },
    { type: 'Severe Infrastructure', amount: '200 pts' },
    { type: 'Speeding Report', amount: '150 pts' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/10 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 civic-gradient rounded-xl flex items-center justify-center text-white shadow-sm">
              <Eye size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-primary">Street Sense</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">How it Works</a>
            <a href="#traffic-rules" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Traffic Rules</a>
            <a href="#insights" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Insights</a>
            <a href="#rewards" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Rewards</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 civic-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Report Issue
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/20">
              <ShieldAlert size={12} />
              Civic Impact Platform
            </div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tight text-on-surface mb-6 leading-[1.1]">
              Street Sense: <span className="text-primary">Eyes on the Road</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed max-w-lg">
              Empowering communities through digital transparency and civic reporting. Join thousands of citizens making roads safer and smarter.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 civic-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                Start Reporting
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-surface-container text-on-surface rounded-2xl font-bold text-lg hover:bg-surface-container-high transition-all flex items-center gap-3">
                <MapIcon size={20} />
                View Live Map
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-border">
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1000&auto=format&fit=crop" 
                alt="City Street" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-6 rounded-3xl shadow-2xl border border-border flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Real-time Safety Rating</p>
                <p className="text-2xl font-black text-on-surface">98.4% Efficiency</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Insights */}
      <section id="insights" className="py-24 bg-surface-container">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">Platform Insights</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Transparency in action through community-driven data.</p>
            </div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Updated Live</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm border border-border relative overflow-hidden group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={28} />
                </div>
                <p className="text-5xl font-black text-on-surface mb-2 tracking-tight">{stat.value}</p>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{stat.label}</p>
                <div className={cn("absolute top-0 left-0 w-full h-1", stat.color.replace('text-', 'bg-'))}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules of the Road */}
      <section id="traffic-rules" className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4 text-on-surface">Rules of the Road</h2>
          <div className="w-20 h-1 civic-gradient mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rules.map((rule, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-surface-container-low p-8 rounded-[2rem] border border-border flex flex-col items-center text-center group"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform", rule.bg, rule.iconColor)}>
                <rule.icon size={32} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-on-surface">{rule.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Earn While You Impact */}
      <section id="rewards" className="py-24 bg-surface-container">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-6 text-on-surface">Earn While You Impact</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                Every verified report contributes to your SensePoints wallet. Points can be redeemed for community rewards, local merchant discounts, or donated to civic projects.
              </p>
              
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border group">
                <img 
                  src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Rewards" 
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="p-8 bg-on-surface text-surface flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-black tracking-tighter">REWARDS & BENEFITS</p>
                  </div>
                  <div className="w-12 h-12 border-2 border-surface/20 rounded-full flex items-center justify-center">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
              <div className="civic-gradient p-6 text-white flex justify-between items-center">
                <span className="font-bold">Report Type</span>
                <span className="font-bold">Reward Amount</span>
              </div>
              <div className="divide-y divide-border">
                {rewards.map((reward, i) => (
                  <div key={i} className="p-6 flex justify-between items-center hover:bg-surface-container transition-colors">
                    <span className="font-bold text-on-surface">{reward.type}</span>
                    <span className="font-black text-primary">{reward.amount}</span>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-surface-container-low text-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                  View full rewards catalog <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-5xl font-black tracking-tight mb-4 text-on-surface">How It Works</h2>
          <div className="w-24 h-1.5 civic-gradient mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-surface-container-lowest rounded-full shadow-2xl border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 z-10 relative">
                  <step.icon size={40} />
                </div>
                <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse -z-0"></div>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 left-[120%] w-full h-0.5 bg-border -translate-y-1/2"></div>
                )}
              </div>
              <h3 className="text-2xl font-black mb-4 text-on-surface">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-border pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 civic-gradient rounded-xl flex items-center justify-center text-white shadow-sm">
                <Eye size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-primary">Street Sense</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Community Guidelines</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="text-center border-t border-border pt-10">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              © 2024 Street Sense. All rights reserved. Built for Digital Democracy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
