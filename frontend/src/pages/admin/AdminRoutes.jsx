import { Routes, Route } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminQuestions from './AdminQuestions';
import AdminProgramming from './AdminProgramming';
import AdminCompanyQuestions from './AdminCompanyQuestions';
import AdminMockTests from './AdminMockTests';
import AdminLeaderboard from './AdminLeaderboard';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="questions" element={<AdminQuestions />} />
      <Route path="programming" element={<AdminProgramming />} />
      <Route path="company-questions" element={<AdminCompanyQuestions />} />
      <Route path="mock-tests" element={<AdminMockTests />} />
      <Route path="leaderboard" element={<AdminLeaderboard />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="settings" element={<AdminSettings />} />
    </Routes>
  );
}

