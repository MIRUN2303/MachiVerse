import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAppStore(s => s.login);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      toast.error('Email/Phone and Password are required');
      return;
    }
    const ok = login(emailOrPhone, password);
    if (ok) {
      toast.success('Welcome back!');
      navigate('/home');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080808' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🏸</span>
          <h1 className="font-logo text-3xl tracking-wider text-white mt-2">Whos<span className="text-[#00ff41] text-4xl">I</span>n</h1>
          <p className="text-white/40 text-sm mt-1">Who's in? Sign in to find out.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Email or Phone *</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              placeholder="mirun@email.com or +919999999001"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            className="btn-lime w-full py-3 font-black text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In →
          </motion.button>
        </form>

        <p className="text-white/30 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#aaeb00] font-semibold hover:underline">Create one</Link>
        </p>

        <div className="mt-6 glass rounded-2xl p-3">
          <p className="text-white/30 text-xs text-center">Demo accounts — any password works</p>
          <p className="text-white/20 text-[10px] text-center mt-1">mirun@email.com / arjun@email.com / priya@email.com</p>
        </div>
      </motion.div>
    </div>
  );
};
