import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth) {
      setError("Autenticação não configurada. Verifique o arquivo .env.local");
      return;
    }

    if (!email || !password || (isSignUp && !name)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Observer in App.tsx catches signup and logs the user in globally.
        navigate('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error("Auth error", err);
      switch(err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError("E-mail ou senha incorretos.");
          break;
        case 'auth/email-already-in-use':
          setError("Esse e-mail já está sendo utilizado.");
          break;
        case 'auth/weak-password':
          setError("A senha deve possuir pelo menos 6 caracteres.");
          break;
        case 'auth/invalid-email':
          setError("E-mail com formato inválido.");
          break;
        default:
          setError(err.message || "Ocorreu um erro ao tentar autenticar.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!auth) {
      setError("Autenticação não configurada.");
      return;
    }
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      console.error("Google Auth error", err);
      // Code for popup closed before finishing is auth/popup-closed-by-user
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || "Ocorreu um erro com o login do Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4 relative overflow-hidden text-white noise-overlay">

      {/* ═══ Cinematic volumetric lights ═══ */}
      <div className="volumetric-blue" style={{ top: '-25%', left: '-15%', width: '60%', height: '60%' }} />
      <div className="volumetric-amber" style={{ bottom: '-20%', right: '-15%', width: '50%', height: '50%' }} />
      <div className="volumetric-cyan" style={{ top: '50%', left: '50%', width: '35%', height: '35%', transform: 'translate(-50%, -50%)' }} />

      {/* ═══ Subtle grid pattern ═══ */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Brand Mark floating above */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex items-center justify-center shadow-xl shadow-blue-900/40 animate-float">
            <Film className="w-5 h-5 text-white stroke-[1.5]" />
          </div>
        </div>
      </motion.div>

      {/* ═══ Login Card ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="w-full max-w-[420px] liquid-glass-elevated rounded-[var(--radius-2xl)] z-10 overflow-hidden"
      >
        <div className="relative z-10 p-10 md:p-12">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-[1.5rem] font-semibold tracking-tight mb-2 text-white/90">
              CineVault
            </h1>
            <p className="text-[10px] font-medium text-white/25 uppercase tracking-[0.2em]">
              Sua cinemateca pessoal
            </p>
          </div>

          <div className="flex bg-white/[0.03] p-1 rounded-[var(--radius-lg)] mb-8 border border-white/[0.05]">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.1em] font-semibold rounded-[var(--radius-md)] transition-all duration-300 ${
                !isSignUp 
                  ? 'bg-blue-600/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/20' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.1em] font-semibold rounded-[var(--radius-md)] transition-all duration-300 ${
                isSignUp 
                  ? 'bg-blue-600/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-blue-500/20' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-[var(--radius-lg)] p-3 px-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-red-200/90 leading-relaxed font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence>
              {isSignUp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="space-y-2"
                >
                  <label htmlFor="name" className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em] pl-1 flex items-center gap-1.5">
                    <span className={cn_transition(focused === 'name' ? 'text-blue-400/60' : '')}>Nome Completo</span>
                  </label>
                  <div className={`relative rounded-[var(--radius-lg)] transition-all duration-500 ${focused === 'name' ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.05)]' : ''}`}>
                    <input
                      id="name"
                      type="text"
                      required={isSignUp}
                      value={name}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[var(--radius-lg)] px-5 py-4 text-white/90 placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition-all duration-400 text-[14px] font-light"
                      placeholder="Como quer ser chamado?"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em] pl-1 flex items-center gap-1.5">
                <span className={cn_transition(focused === 'email' ? 'text-blue-400/60' : '')}>Email</span>
              </label>
              <div className={`relative rounded-[var(--radius-lg)] transition-all duration-500 ${focused === 'email' ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.05)]' : ''}`}>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[var(--radius-lg)] px-5 py-4 text-white/90 placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition-all duration-400 text-[14px] font-light"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em] pl-1 flex items-center gap-1.5 mt-1">
                <span className={cn_transition(focused === 'password' ? 'text-blue-400/60' : '')}>Senha</span>
              </label>
              <div className={`relative rounded-[var(--radius-lg)] transition-all duration-500 ${focused === 'password' ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.05)]' : ''}`}>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[var(--radius-lg)] px-5 py-4 text-white/90 placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition-all duration-400 text-[14px] font-light"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white font-semibold uppercase tracking-[0.12em] text-[11px] py-4.5 px-4 rounded-[var(--radius-lg)] mt-8 transition-all duration-500 shadow-lg shadow-blue-900/30 hover:shadow-blue-700/40 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {/* Shimmer effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 disabled:hidden" />
              <span className="relative z-10 flex items-center gap-2 h-[20px]">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                ) : (
                  <>
                    {isSignUp ? 'Criar Conta' : 'Acessar Cofre'}
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.05]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.1em]">
              <span className="bg-[#0a0a0c] px-4 text-white/40">Ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white font-medium text-[12px] py-4 flex rounded-[var(--radius-lg)] transition-all duration-300 items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none shadow-sm hover:shadow-white/[0.02]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-white/[0.04]">
            <p className="text-center text-[9px] font-medium text-white/20 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-500/30" />
              Criptografia AES-256
              <Sparkles className="w-3 h-3 text-amber-500/30" />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Version tag */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-[9px] text-white/10 font-mono tracking-wider z-10"
      >
        v2.0 — Auth Edition
      </motion.p>
    </div>
  );
}

function cn_transition(cls: string) {
  return `transition-colors duration-300 ${cls}`;
}
