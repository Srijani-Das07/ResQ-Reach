import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Shield, UserPlus, Users, LogOut, RefreshCw } from 'lucide-react';
import { useUnifiedDatabase } from './UnifiedDatabaseContext';
import { useLanguage } from './LanguageContext';

interface RescueCenterDashboardProps {
  onNavigate: (page: 'add-guest' | 'guest-info') => void;
  onLogout: () => void;
}

export const RescueCenterDashboard: React.FC<RescueCenterDashboardProps> = ({ onNavigate, onLogout }) => {
  const { rescueCenters, guests, refreshData, syncCenterCapacity, loading } = useUnifiedDatabase();
  
  // For demo purposes, use the first rescue center (could be enhanced to support specific center login)
  const rescueCenter = rescueCenters[0] || null;
  const { translate } = useLanguage();
  
  // Ensure center capacity is synced when component mounts or when guests change
  useEffect(() => {
    if (rescueCenter) {
      syncCenterCapacity(rescueCenter.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests.length, rescueCenter?.id]);
  
  const handleManualRefresh = async () => {
    await refreshData();
    if (rescueCenter) {
      await syncCenterCapacity(rescueCenter.id);
    }
  };

  // Remove automatic refresh on mount to prevent state override
  // useEffect(() => {
  //   refreshData();
  // }, []);

  // Calculate today's new guests
  const today = new Date().toDateString();
  const newToday = guests.filter(guest => 
    new Date(guest.createdAt).toDateString() === today
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl text-gray-900">{translate('rescueCenterDashboard')}</h1>
                <p className="text-sm text-gray-500">{rescueCenter?.name || 'Central Emergency Shelter'} ({rescueCenter?.id || 'RC001'})</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {translate('logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4 text-gray-800">{translate('guestManagementSystem')}</h2>
          <p className="text-lg text-gray-600">{translate('manageGuestRegistration')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Add Guest Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-green-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">{translate('addGuest')}</CardTitle>
              </CardHeader>
              <p className="text-gray-600 mb-6">
                {translate('registerNewGuest')}
              </p>
              <Button 
                onClick={() => onNavigate('add-guest')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {translate('registerNewGuestBtn')}
              </Button>
            </CardContent>
          </Card>

          {/* Guest Info Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-blue-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">{translate('guestInfo')}</CardTitle>
              </CardHeader>
              <p className="text-gray-600 mb-6">
                {translate('viewSearchManageGuests')}
              </p>
              <Button 
                onClick={() => onNavigate('guest-info')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                {translate('viewGuestInformation')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{rescueCenter?.currentGuests || 0}</div>
              <p className="text-gray-600">{translate('totalGuests')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{rescueCenter?.availableCapacity || 0}</div>
              <p className="text-gray-600">{translate('availableCapacity')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{newToday}</div>
              <p className="text-gray-600">{translate('newToday')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};