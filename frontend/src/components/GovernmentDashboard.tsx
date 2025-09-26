import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Building2, Users, Phone, MapPin, Droplets, UtensilsCrossed, LogOut, RefreshCw, AlertTriangle, Clock, User, Navigation } from 'lucide-react';
import { useUnifiedDatabase, RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface Alert {
  id: string;
  userId: string;
  userEmail: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  type: string;
  message: string;
  status: string;
}

interface GovernmentDashboardProps {
  onLogout: () => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ onLogout }) => {
  const { rescueCenters, loading, refreshData } = useUnifiedDatabase();
  const [selectedCenter, setSelectedCenter] = useState<RescueCenter | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState('centers');

  // Update selected center when rescueCenters data changes
  useEffect(() => {
    if (selectedCenter && rescueCenters.length > 0) {
      const updated = rescueCenters.find(center => center.id === selectedCenter.id);
      setSelectedCenter(updated || null);
    }
  }, [rescueCenters, selectedCenter]);

  // Load alerts from localStorage
  useEffect(() => {
    const loadAlerts = () => {
      const storedAlerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
      setAlerts(storedAlerts);
    };

    loadAlerts();
    // Refresh alerts every 5 seconds
    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'full': return 'bg-red-500';
      case 'inactive': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getOccupancyPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      // Also refresh alerts
      const storedAlerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
      setAlerts(storedAlerts);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const handleMarkAlertResolved = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('emergencyAlerts', JSON.stringify(updatedAlerts));
    toast.success('Alert marked as resolved');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl text-gray-900">Government Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Summary */}
        {activeAlerts.length > 0 && (
          <div className="mb-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Active Emergency Alerts</h3>
                    <p className="text-sm text-red-600">
                      {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} requiring attention
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('alerts')}
                    className="ml-auto bg-red-600 hover:bg-red-700"
                  >
                    View Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="centers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Rescue Centers
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Alerts
              {activeAlerts.length > 0 && (
                <Badge className="bg-red-500 text-white">{activeAlerts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="centers">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Rescue Centers List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Rescue Centers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading rescue centers...
                        </div>
                      ) : rescueCenters.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No rescue centers found
                        </div>
                      ) : (
                        rescueCenters.map((center) => (
                          <div
                            key={center.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                              selectedCenter?.id === center.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => setSelectedCenter(center)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{center.name}</h3>
                              <Badge className={getStatusColor(center.status)}>
                                {center.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{center.id}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              {center.currentGuests}/{center.totalCapacity}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rescue Center Details */}
              <div className="lg:col-span-2">
                {selectedCenter ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        {selectedCenter.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Rescue Center Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start">
                              <span className="font-medium w-24">Center ID:</span>
                              <span className="text-gray-600">{selectedCenter.id}</span>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mt-0.5 mr-2 text-gray-400" />
                              <span className="text-gray-600">{selectedCenter.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-600">{selectedCenter.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Status</h4>
                          <Badge className={`${getStatusColor(selectedCenter.status)} text-white`}>
                            {selectedCenter.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* Occupancy */}
                      <div>
                        <h4 className="font-medium mb-4">Current Occupancy</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">People Count</span>
                            <span className="font-medium">
                              {selectedCenter.currentGuests} / {selectedCenter.totalCapacity}
                            </span>
                          </div>
                          <Progress 
                            value={getOccupancyPercentage(selectedCenter.currentGuests, selectedCenter.totalCapacity)} 
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0</span>
                            <span>{selectedCenter.totalCapacity} max capacity</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Supplies */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-4 flex items-center">
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            Food Supply
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Availability</span>
                              <span className="font-medium">{selectedCenter.foodLevel}%</span>
                            </div>
                            <Progress value={selectedCenter.foodLevel} className="h-3" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-4 flex items-center">
                            <Droplets className="w-4 h-4 mr-2" />
                            Water Supply
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Availability</span>
                              <span className="font-medium">{selectedCenter.waterLevel}%</span>
                            </div>
                            <Progress value={selectedCenter.waterLevel} className="h-3" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Actions */}
                      <div>
                        <h4 className="font-medium mb-3">Contact Actions</h4>
                        <Button className="w-full md:w-auto">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Rescue Center
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Rescue Center</h3>
                      <p className="text-gray-600">Choose a rescue center from the list to view detailed information</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-6">
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Active Emergency Alerts ({activeAlerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getAlertStatusColor(alert.status)}>
                                  {alert.status.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 mb-2">{alert.message}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>User: {alert.userEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Time: {formatTimestamp(alert.timestamp)}</span>
                                </div>
                                {alert.latitude && alert.longitude && (
                                  <div className="flex items-center gap-1">
                                    <Navigation className="w-4 h-4" />
                                    <span>Location: {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</span>
                                    <a 
                                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 ml-2"
                                    >
                                      View on Map
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleMarkAlertResolved(alert.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resolved Alerts */}
              {resolvedAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <AlertTriangle className="w-5 h-5" />
                      Resolved Alerts ({resolvedAlerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resolvedAlerts.slice(0, 10).map((alert) => (
                        <div key={alert.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getAlertStatusColor(alert.status)}>
                                  {alert.status.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 mb-2">{alert.message}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>User: {alert.userEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Time: {formatTimestamp(alert.timestamp)}</span>
                                </div>
                                {alert.latitude && alert.longitude && (
                                  <div className="flex items-center gap-1">
                                    <Navigation className="w-4 h-4" />
                                    <span>Location: {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}</span>
                                    <a 
                                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 ml-2"
                                    >
                                      View on Map
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Alerts */}
              {alerts.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Alerts</h3>
                    <p className="text-gray-600">All systems are running normally. Emergency alerts will appear here when received.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};