import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAppStore(s => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error('Name, Email, Phone, and Password are required');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    const ok = signup(name, email, phone, password);
    if (ok) {
      toast.success('Account created! Welcome to WhosIn!');
      navigate('/home');
    } else {
      toast.error('Email already registered');
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
          <motion.button
            onClick={() => navigate('/login')}
            className="text-white/30 text-sm mb-4 block"
            whileHover={{ x: -2 }}
          >← Back</motion.button>
          <span className="text-4xl">🏸</span>
          <h1 className="font-logo text-3xl tracking-wider text-white mt-2">Whos<span className="text-[#00ff41] text-4xl">I</span>n</h1>
          <p className="text-white/40 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 99999 99001"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 4 characters"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold mb-1.5 block">Confirm Password *</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full glass rounded-2xl px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-[#aaeb00]/50 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            className="btn-lime w-full py-3 font-black text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account →
          </motion.button>
        </form>

        <p className="text-white/30 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#aaeb00] font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
