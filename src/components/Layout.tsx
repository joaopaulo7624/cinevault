import {Outlet, Navigate, Link, useLocation} from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Home, Search, Library, Compass, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

import { QueryErrorBoundary } from './QueryErrorBoundary';
import { AIChatButton } from './AIChatButton';

export default function Layout() {
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Descobrir', path: '/discover', icon: Compass },
    { name: 'Buscar', path: '/search', icon: Search },
    { name: 'Biblioteca', path: '/library', icon: Library },
  ];

  return (
    <div className="h-screen bg-void text-slate-300 flex font-sans relative noise-overlay overflow-hidden">

      {/* ═══ Volumetric Ambient Lights ═══ */}
      <div className="volumetric-blue" style={{ top: '-15%', left: '-10%', width: '55%', height: '55%' }} />
      <div className="volumetric-amber" style={{ bottom: '-10%', right: '-8%', width: '40%', height: '45%' }} />
      <div className="volumetric-cyan" style={{ top: '40%', left: '30%', width: '30%', height: '30%' }} />

      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="w-[280px] liquid-glass-elevated hidden md:flex flex-col h-[calc(100vh-2.5rem)] mx-5 my-5 rounded-[var(--radius-2xl)] z-20 shrink-0 overflow-hidden">

        {/* Logo */}
        <div className="p-8 pb-10 relative z-10">
          <Link to="/" className="flex items-center gap-4 group magnetic">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:shadow-blue-700/40 transition-shadow duration-500">
              <span className="text-white font-semibold text-lg leading-none tracking-tight">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[1rem] font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">CineVault</span>
              <span className="text-[9px] font-medium text-white/25 uppercase tracking-[0.15em]">Cinemateca</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-lg)] text-[13px] font-medium transition-all duration-300 relative group magnetic",
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-500"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn(
                  "w-[20px] h-[20px] flex-shrink-0 stroke-[1.5] transition-colors duration-300",
                  isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/60"
                )} />
                {item.name}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/20" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Panel */}
        <div className="px-5 pt-4 pb-8 mt-auto relative z-10">
          <div className="liquid-glass-interactive rounded-[var(--radius-xl)] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-white/[0.06] text-blue-400/80 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold uppercase">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/80 truncate">{user.name}</p>
                <p className="text-[11px] text-white/25 truncate font-mono">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="magnetic w-full flex items-center justify-center py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/30 hover:text-white/60 bg-white/[0.02] hover:bg-white/[0.05] rounded-[var(--radius-md)] transition-all duration-300 border border-white/[0.03] hover:border-white/[0.06]"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <main className="flex-1 relative mb-20 md:mb-0 overflow-y-auto overflow-x-hidden px-2 md:px-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split('/')[1] || '/'}
            initial={{ opacity: 0, y: 15, scale: 0.985, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, scale: 0.985, filter: 'blur(12px)' }}
            transition={{ 
              duration: 0.45, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="h-full"
          >
            <QueryErrorBoundary>
              <Outlet />
            </QueryErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ═══ Mobile Bottom Bar ═══ */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 liquid-glass-elevated rounded-[var(--radius-2xl)]">

        <div className="flex items-center justify-around p-2 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 px-5 rounded-[var(--radius-lg)] text-[9px] font-medium uppercase tracking-[0.08em] transition-all duration-300 relative",
                  isActive
                    ? "text-blue-400 bg-blue-500/[0.08]"
                    : "text-white/30 hover:text-white/60"
                )}
              >
                <item.icon className="w-5 h-5 stroke-[1.5]" />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-blue-500"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══ AI Chat Button (Fase 3) ═══ */}
      <AIChatButton />
    </div>
  );
}
