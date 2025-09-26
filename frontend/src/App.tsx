import React, { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { ResQReachExternalMap } from './components/ResQReachExternalMap';
import { ShelterInfo } from './components/ShelterInfo';
import { FirstAidPage } from './components/FirstAidPage';
import { ActionGuidePage } from './components/ActionGuidePage';
import { SignupPage } from './components/SignupPage';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { ProfileInfoPage } from './components/ProfileInfoPage';
import { PreHomePage } from './components/PreHomePage';
import { GovernmentLoginPage } from './components/GovernmentLoginPage';
import { GovernmentDashboard } from './components/GovernmentDashboard';
import { RescueCenterLoginPage } from './components/RescueCenterLoginPage';
import { RescueCenterDashboard } from './components/RescueCenterDashboard';
import { AddGuestPage } from './components/AddGuestPage';
import { GuestInfoPage } from './components/GuestInfoPage';
import { UnifiedDatabaseProvider, RescueCenter } from './components/UnifiedDatabaseContext';
import { OfflineNotice } from './components/OfflineNotice';
import { ErrorBoundary } from './components/ErrorBoundary';

type PageType = 'pre-home' | 'dashboard' | 'first-aid' | 'action-guide' | 'signup' | 'login' | 'profile' | 'profile-info' | 'government-login' | 'government-dashboard' | 'rescue-center-login' | 'rescue-center-dashboard' | 'add-guest' | 'guest-info';

const AppContent = () => {
  const { isAuthenticated, userRole, governmentLogin, rescueCenterLogin, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('pre-home');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<RescueCenter | null>(null);

  // Handle authentication-based navigation
  React.useEffect(() => {
    if (isAuthenticated) {
      switch (userRole) {
        case 'citizen':
          if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'pre-home') {
            setCurrentPage('dashboard');
          }
          break;
        case 'government':
          if (currentPage !== 'government-dashboard') {
            setCurrentPage('government-dashboard');
          }
          break;
        case 'rescue-center':
          if (currentPage !== 'rescue-center-dashboard' && currentPage !== 'add-guest' && currentPage !== 'guest-info') {
            setCurrentPage('rescue-center-dashboard');
          }
          break;
      }
    } else if (!isAuthenticated && currentPage !== 'pre-home' && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'government-login' && currentPage !== 'rescue-center-login') {
      setCurrentPage('pre-home');
    }
  }, [isAuthenticated, userRole]); // Removed currentPage from dependencies to prevent infinite loop

  const handleMenuToggle = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigateToSignup = () => {
    setCurrentPage('signup');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleRoleSelect = (role: 'government' | 'rescue-center' | 'citizen') => {
    switch (role) {
      case 'government':
        setCurrentPage('government-login');
        break;
      case 'rescue-center':
        setCurrentPage('rescue-center-login');
        break;
      case 'citizen':
        setCurrentPage('login');
        break;
    }
  };

  const handleGovernmentLogin = async (employeeId: string, password: string) => {
    const success = await governmentLogin(employeeId, password);
    if (!success) {
      throw new Error('Login failed');
    }
  };

  const handleRescueCenterLogin = async (centerId: string, password: string) => {
    const success = await rescueCenterLogin(centerId, password);
    if (!success) {
      throw new Error('Login failed');
    }
  };

  const handleBackToPreHome = () => {
    setCurrentPage('pre-home');
  };

  const handleRescueCenterNavigate = (page: 'add-guest' | 'guest-info') => {
    setCurrentPage(page);
  };

  const handleBackToRescueDashboard = () => {
    setCurrentPage('rescue-center-dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('pre-home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderPage = () => {
    // Pre-authentication pages
    switch (currentPage) {
      case 'pre-home':
        return <PreHomePage onRoleSelect={handleRoleSelect} />;
      case 'government-login':
        return (
          <GovernmentLoginPage
            onLogin={handleGovernmentLogin}
            onBack={handleBackToPreHome}
          />
        );
      case 'rescue-center-login':
        return (
          <RescueCenterLoginPage
            onLogin={handleRescueCenterLogin}
            onBack={handleBackToPreHome}
          />
        );
      case 'signup':
        return <SignupPage 
          onNavigateToLogin={handleNavigateToLogin}
          onSignupSuccess={() => setCurrentPage('dashboard')}
          onBack={handleBackToPreHome}
        />;
      case 'login':
        return <LoginPage 
          onNavigateToSignup={handleNavigateToSignup}
          onBack={handleBackToPreHome}
        />;
    }

    // Authenticated pages
    if (!isAuthenticated) {
      return <PreHomePage onRoleSelect={handleRoleSelect} />;
    }

    switch (currentPage) {
      // Government pages
      case 'government-dashboard':
        return <GovernmentDashboard onLogout={handleLogout} />;
      
      // Rescue center pages
      case 'rescue-center-dashboard':
        return (
          <RescueCenterDashboard
            onNavigate={handleRescueCenterNavigate}
            onLogout={handleLogout}
          />
        );
      case 'add-guest':
        return <AddGuestPage onBack={handleBackToRescueDashboard} />;
      case 'guest-info':
        return <GuestInfoPage onBack={handleBackToRescueDashboard} />;
      
      // Citizen pages
      case 'first-aid':
        return <FirstAidPage onBack={handleBackToDashboard} />;
      case 'action-guide':
        return <ActionGuidePage onBack={handleBackToDashboard} />;
      case 'profile':
        return <ProfilePage onBack={handleBackToDashboard} />;
      case 'profile-info':
        return <ProfileInfoPage onBack={handleBackToDashboard} />;
      case 'dashboard':
      default:
        return (
          <div className="flex-1 flex">
            {/* Main Content Area */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {/* ResQ Reach External Map Component */}
                <ResQReachExternalMap 
                  selectedShelter={selectedShelter}
                  onShelterSelect={setSelectedShelter}
                />
              </div>
            </div>
            
            {/* Shelter Information Sidebar */}
            <ShelterInfo shelter={selectedShelter} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - only show on citizen dashboard page */}
      {isAuthenticated && userRole === 'citizen' && currentPage === 'dashboard' && (
        <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onLogout={handleLogout} />
      )}
      
      {/* Side Menu - only show for citizen users */}
      {isAuthenticated && userRole === 'citizen' && (
        <SideMenu 
          isOpen={sideMenuOpen}
          onClose={() => setSideMenuOpen(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Content */}
      {renderPage()}

      {/* Offline Notice */}
      <OfflineNotice />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <UnifiedDatabaseProvider>
            <AppContent />
          </UnifiedDatabaseProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}