'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Lock, CheckCircle2, Layout, Zap, MessagesSquare, 
  Code, ShieldAlert, Database, ListTodo, Route, Key, Users, Workflow
} from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get('/api/auth/me').then(res => setUser(res.data.user)).catch(() => setUser(null));
  }, []);

  // Auto-sliding showcase timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const showcaseSlides = [
    {
      id: 'tasks',
      title: 'Task Management',
      desc: 'Create, assign, and prioritize tasks instantly.',
      icon: <ListTodo className="text-[#0092d1]" />,
      mockup: (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} layoutId={`task-${i}`} className="bg-white p-4 rounded-xl shadow-sm border border-base-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-primary"></div>
                <div className="h-4 w-32 bg-base-200 rounded"></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-base-200"></div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'sprints',
      title: 'Sprints',
      desc: 'Execute agile sprint planning and track real-time progress.',
      icon: <Route className="text-purple-500" />,
      mockup: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-purple-100 rounded"></div>
            <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">Sprint 12 (Active)</div>
          </div>
          <div className="w-full bg-base-200 rounded-full h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="bg-purple-500 h-2 rounded-full"></motion.div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="h-24 bg-base-100 border border-base-200 rounded-lg p-2">
              <div className="h-3 w-12 bg-base-200 rounded mb-2"></div>
              <div className="h-10 bg-purple-50 border border-purple-100 rounded"></div>
            </div>
            <div className="h-24 bg-base-100 border border-base-200 rounded-lg p-2">
              <div className="h-3 w-12 bg-base-200 rounded mb-2"></div>
            </div>
            <div className="h-24 bg-base-100 border border-base-200 rounded-lg p-2">
              <div className="h-3 w-12 bg-base-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'backlog',
      title: 'Backlog',
      desc: 'Organize and refine upcoming work.',
      icon: <Database className="text-orange-500" />,
      mockup: (
        <div className="space-y-2 border border-base-200 rounded-xl overflow-hidden">
          <div className="bg-base-200/50 p-3 flex justify-between">
            <div className="h-4 w-20 bg-base-300 rounded"></div>
            <div className="h-4 w-8 bg-base-300 rounded"></div>
          </div>
          {[1,2,3,4].map(i => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-3 border-b border-base-100 flex gap-3">
              <div className="h-4 w-4 bg-orange-100 rounded"></div>
              <div className="h-4 w-full bg-base-100 rounded"></div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'chat',
      title: 'Team Chat',
      desc: 'Communicate with your team in real-time context.',
      icon: <MessagesSquare className="text-green-500" />,
      mockup: (
        <div className="flex flex-col h-full justify-end space-y-3 bg-base-100 p-4 rounded-xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100"></div>
            <div className="bg-base-200 p-3 rounded-2xl rounded-tl-none w-3/4"><div className="h-3 bg-base-300 rounded w-full mb-2"></div><div className="h-3 bg-base-300 rounded w-2/3"></div></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex gap-2 justify-end">
             <div className="bg-green-500 p-3 rounded-2xl rounded-tr-none w-3/4"><div className="h-3 bg-green-400 rounded w-full"></div></div>
             <div className="w-8 h-8 rounded-full bg-green-200"></div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security',
      desc: 'Show encrypted, private collaboration.',
      icon: <ShieldAlert className="text-red-500" />,
      mockup: (
        <div className="h-full flex items-center justify-center bg-black/5 rounded-xl border border-black/10 relative overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 border border-dashed border-red-200 rounded-full"></motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10 w-20 h-20 bg-red-50 rounded-2xl shadow-xl flex items-center justify-center border border-red-100">
            <Lock className="text-red-500" size={32} />
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-black font-sans selection:bg-black selection:text-white">
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#fdfdfc]/90 backdrop-blur-md border-b border-black/5 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Coltask</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <Link href="#features" className="hover:text-black/60 transition-colors">Features</Link>
            <Link href="#security" className="hover:text-black/60 transition-colors">Security</Link>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            {user ? (
              <Link href="/workshops" className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/80 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
                Go to Workshops 
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block hover:text-black/60 transition-colors">Login</Link>
                <Link href="/register" className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/80 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none mask-[radial-gradient(ellipse_60%_80%_at_50%_0%,#000_10%,transparent_100%)]"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-black font-bold text-sm border border-black/10 mb-8">
              <Zap size={16} className="text-[#0092d1]" /> The new standard for team productivity
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-6">
              Manage your work.<br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0092d1] to-purple-600">Collaborate securely.</span>
            </h1>
            <p className="text-xl md:text-2xl text-black/60 font-medium mb-10 max-w-2xl leading-relaxed">
              The all-in-one workspace for high-velocity teams. Plan sprints, manage tasks, and chat in total privacy—without jumping between apps.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full">
              <Link href="/register" className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full text-lg font-bold hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all flex items-center justify-center gap-2">
                Get Started Free <ArrowRight size={20} />
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold border-2 border-black/10 hover:bg-black/5 transition-colors flex justify-center">
                See How It Works
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-4xl relative"
          >
            {/* Animated Dashboard Mockup floating */}
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-black/10 p-4 aspect-video flex flex-col transform hover:-translate-y-2 transition-transform duration-500 relative z-10">
              <div className="flex gap-2 mb-4 border-b border-base-200 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 flex gap-4">
                <div className="w-1/4 bg-base-100 rounded-lg p-3 space-y-3 hidden sm:block">
                  <div className="h-4 bg-base-200 rounded w-3/4"></div>
                  <div className="h-4 bg-base-200 rounded w-1/2"></div>
                  <div className="h-4 bg-base-200 rounded w-2/3"></div>
                </div>
                <div className="flex-1 bg-base-100 rounded-lg p-4 relative overflow-hidden flex flex-col">
                  {/* Floating cards */}
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-white p-4 rounded-xl shadow-sm border border-base-200 mb-4 flex justify-between items-center w-3/4">
                    <div className="h-4 bg-base-200 rounded w-1/2"></div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="bg-white p-4 rounded-xl shadow-sm border border-base-200 mb-4 flex justify-between items-center w-full ml-auto">
                    <div className="h-4 bg-base-200 rounded w-2/3"></div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
                  </motion.div>
                  
                  {/* Chat bubble */}
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-6 right-6 bg-green-500 text-white p-4 rounded-2xl rounded-br-none shadow-xl text-sm font-bold flex items-center gap-2">
                    <MessagesSquare size={16} /> Shipped to prod!
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Beautiful Glow behind the mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#0092d1]/20 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-[100%] opacity-70"></div>
          </motion.div>
        </div>
      </section>

      {/* ANIMATED PRODUCT SHOWCASE */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Everything you need to ship.</h2>
            <p className="text-xl text-white/60">One unified platform for your entire workflow.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Nav Menu */}
            <div className="space-y-2">
              {showcaseSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 flex gap-4 ${
                    activeSlide === idx ? 'bg-white/10 shadow-lg border border-white/10' : 'hover:bg-white/5 border border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeSlide === idx ? 'bg-white/10' : 'bg-transparent'}`}>
                    {slide.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{slide.title}</h3>
                    {activeSlide === idx && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/60">
                        {slide.desc}
                      </motion.p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Mockup Display */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-2 aspect-square md:aspect-video lg:aspect-square flex flex-col relative overflow-hidden shadow-2xl">
              <div className="flex gap-2 p-4 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="flex-1 p-6 bg-white rounded-b-2xl overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {showcaseSlides[activeSlide].mockup}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW COLTASK WORKS (STEPPER) */}
      <section id="how-it-works" className="py-24 px-6 bg-base-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How Coltask works</h2>
            <p className="text-xl text-base-content/60">From blank canvas to shipped product in five steps.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-black/10 -z-10"></div>
            {[
              { icon: <Layout />, label: 'Create Workspace' },
              { icon: <Users />, label: 'Add Team' },
              { icon: <ListTodo />, label: 'Plan Work' },
              { icon: <MessagesSquare />, label: 'Collaborate' },
              { icon: <Zap />, label: 'Ship' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center mb-8 md:mb-0 relative bg-base-200 md:bg-transparent px-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/10 shadow-lg flex items-center justify-center mb-4 text-black z-10">
                  {step.icon}
                </div>
                <h4 className="font-bold text-center">{step.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Task Management', desc: 'Drag-and-drop boards that update instantly across your team.', icon: <Layout className="text-blue-500"/> },
              { title: 'Scrum & Sprints', desc: 'Powerful sprint planning to keep your team velocity high.', icon: <Route className="text-purple-500"/> },
              { title: 'Backlog Refinement', desc: 'A dedicated space to organize and point future user stories.', icon: <Database className="text-orange-500"/> },
              { title: 'Team Chat', desc: 'Built-in encrypted chat. No need to tab over to Slack.', icon: <MessagesSquare className="text-green-500"/> },
              { title: 'Workspaces', desc: 'Isolated environments for different teams or clients.', icon: <Workflow className="text-pink-500"/> },
              { title: 'Notifications', desc: 'Real-time alerts so you never miss a tag or status change.', icon: <Zap className="text-yellow-500"/> },
            ].map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-black/5 hover:border-black/20 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-black/60">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section id="security" className="py-32 px-6 bg-black text-white relative overflow-hidden">
        {/* Abstract security bg */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-green-500 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 font-bold text-sm border border-green-500/30">
              <ShieldAlert size={16} /> Enterprise-Grade Security
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-tight">Your data is<br/>strictly yours.</h2>
            <p className="text-xl text-white/60">
              Coltask is built from the ground up with end-to-end encryption for team chat and strict workspace segregation. We can't see your data, and neither can anyone else.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                'End-to-End Encrypted Team Chat',
                'Strict Workspace Isolation',
                'Role-Based Access Control',
                'Actionable Audit Logs'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle2 className="text-green-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                  <Key className="text-green-500" size={32} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">Encryption Layer</span>
                  <span className="text-green-400 font-mono text-sm">AES-256-GCM</span>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">Data Segregation</span>
                  <span className="text-green-400 font-mono text-sm">ACTIVE</span>
                </div>
              </div>
            </motion.div>
            <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full z-0"></div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Your team's work.<br/>One secure workspace.
          </h2>
          <Link href="/register" className="inline-flex bg-black text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl shadow-black/20 items-center gap-3">
            Get Started Free <ArrowRight />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 pt-16 pb-8 px-6 bg-base-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg">Coltask</span>
            </div>
            <p className="text-sm text-base-content/60">Secure project management for high-velocity teams.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-base-content/60">
              <li><Link href="#features" className="hover:text-black">Features</Link></li>
              <li><Link href="#security" className="hover:text-black">Security</Link></li>
              <li><Link href="#" className="hover:text-black">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-base-content/60">
              <li><Link href="#" className="hover:text-black">About</Link></li>
              <li><Link href="#" className="hover:text-black">Blog</Link></li>
              <li><Link href="#" className="hover:text-black">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-base-content/60">
              <li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-black">Security Audit</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-black/10 text-center text-sm text-base-content/40 font-medium">
          © {new Date().getFullYear()} Coltask Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
