import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { BottomNav, AppHeader } from './components/layout/Navigation';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { HomePage } from './features/home/HomePage';
import { EventsPage, EventDetailPage } from './features/events/EventsPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { GroupsPage, GroupDetailPage } from './features/groups/GroupsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { useAppStore } from './store/useAppStore';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const PageSkeleton = () => (
  <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="skeleton h-32 rounded-3xl" />
    ))}
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-150px] left-[-80px] w-[600px] h-[600px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, rgba(170,235,0,0.07), transparent)' }} />
        <div className="absolute top-[35%] right-[-120px] w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent)' }} />
        <div className="absolute bottom-[-80px] left-[25%] w-[400px] h-[400px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(170,235,0,0.04), transparent)' }} />
      </div>

      {!isLanding && !isAuthPage && <AppHeader />}

      <main className={isLanding || isAuthPage ? '' : 'safe-bottom'}>
        <Suspense fallback={<PageSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
              <Route path="/home" element={<PageWrapper><ProtectedRoute><HomePage /></ProtectedRoute></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><ProtectedRoute><EventsPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/events/:id" element={<PageWrapper><ProtectedRoute><EventDetailPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/calendar" element={<PageWrapper><ProtectedRoute><CalendarPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/leaderboard" element={<PageWrapper><ProtectedRoute><LeaderboardPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><ProtectedRoute><ProfilePage /></ProtectedRoute></PageWrapper>} />
              <Route path="/groups" element={<PageWrapper><ProtectedRoute><GroupsPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/groups/:id" element={<PageWrapper><ProtectedRoute><GroupDetailPage /></ProtectedRoute></PageWrapper>} />
              <Route path="/notifications" element={<PageWrapper><ProtectedRoute><NotificationsPage /></ProtectedRoute></PageWrapper>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <BottomNav />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e1535',
            color: '#f8f8ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
