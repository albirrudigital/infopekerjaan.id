import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Chatbot from './components/Chatbot';
import './App.css';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SearchPage from "@/pages/search-page";
import JobDetailPage from "@/pages/job-detail-page";
import CompanyProfilePage from "@/pages/company-profile-page";
import JobseekerDashboard from "@/pages/jobseeker-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import BekasiCompaniesPage from "@/pages/bekasi-companies-page";
import FeaturesPage from "@/pages/features-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import MarketInsightsPage from "@/pages/market-insights-page";
import AchievementsPage from "@/pages/achievements-page";
import MoodTrackerPage from "@/pages/mood-tracker-page";
import ProfileCompletionPage from "@/pages/profile-completion-page";
import SoundSettingsPage from "@/pages/sound-settings-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import CareerSimulatorPage from "@/pages/career-simulator-page-enhanced";
import InterviewPreparationPage from "@/pages/interview-preparation-page";
import InterviewSessionCreatePage from "@/pages/interview-session-create-page";
import InterviewSessionDetailPage from "@/pages/interview-session-detail-page";
import InterviewSessionActivePage from "@/pages/interview-session-active-page";
import InterviewSessionReviewPage from "@/pages/interview-session-review-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

const { Content } = Layout;

// Fungsi untuk membatasi akses ke halaman admin
const AdminRoute = ({ component: Component, path }: { component: React.ComponentType, path: string }) => {
  const { user } = useAuth();
  
  return (
    <Route path={path}>
      {user && user.type === 'admin' ? <Component /> : <NotFound />}
    </Route>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/jobs/:id" component={JobDetailPage} />
      <Route path="/companies/:id" component={CompanyProfilePage} />
      <Route path="/bekasi-companies" component={BekasiCompaniesPage} />
      <Route path="/features" component={FeaturesPage} />
      <ProtectedRoute path="/market-insights" component={MarketInsightsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/mood-tracker" component={MoodTrackerPage} />
      <ProtectedRoute path="/profile-completion" component={ProfileCompletionPage} />
      <ProtectedRoute path="/sound-settings" component={SoundSettingsPage} />
      <ProtectedRoute path="/career-simulator" component={CareerSimulatorPage} />
      <ProtectedRoute path="/interview-preparation" component={InterviewPreparationPage} />
      <ProtectedRoute path="/interview-preparation/create-session" component={InterviewSessionCreatePage} />
      <ProtectedRoute path="/interview-preparation/sessions/:id" component={InterviewSessionDetailPage} />
      <ProtectedRoute path="/interview-preparation/sessions/:id/start" component={InterviewSessionActivePage} />
      <ProtectedRoute path="/interview-preparation/sessions/:id/review" component={InterviewSessionReviewPage} />
      <ProtectedRoute path="/jobseeker/dashboard" component={JobseekerDashboard} />
      <ProtectedRoute path="/employer/dashboard" component={EmployerDashboard} />
      <AdminRoute path="/admin" component={AdminDashboardPage} />
      <AdminRoute path="/admin/dashboard" component={AdminDashboardPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="infopekerjaan-theme">
          <TooltipProvider>
            <Router>
              <Layout style={{ minHeight: '100vh' }}>
                <Content style={{ padding: '24px' }}>
                  <Routes>
                    <Route path="/" element={<AnalyticsDashboard />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                  </Routes>
                  <Chatbot />
                </Content>
              </Layout>
            </Router>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
