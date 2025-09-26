import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ArrowLeft, Search, Users, X, Trash2, Eye, Phone, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUnifiedDatabase, Guest } from './UnifiedDatabaseContext';
import { useLanguage } from './LanguageContext';

interface GuestInfoPageProps {
  onBack: () => void;
}

export const GuestInfoPage: React.FC<GuestInfoPageProps> = ({ onBack }) => {
  const { guests, deleteGuest, refreshData } = useUnifiedDatabase();
  const { translate } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  // Removed automatic refresh to prevent data reset
  // useEffect(() => {
  //   refreshData();
  // }, []);

  const filteredGuests = guests.filter(guest =>
    guest.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.mobilePhone.includes(searchQuery)
  );

  const handleSearch = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      setSelectedGuest(guest);
    } else {
      toast.error('Guest not found');
    }
  };

  const handleDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (guestToDelete) {
      try {
        await deleteGuest(guestToDelete.id);
        toast.success('Guest deleted successfully');
        if (selectedGuest?.id === guestToDelete.id) {
          setSelectedGuest(null);
        }
        setGuestToDelete(null);
      } catch (error) {
        toast.error('Failed to delete guest');
      }
    }
    setDeleteConfirmOpen(false);
  };

  const closeGuestDetails = () => {
    setSelectedGuest(null);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {translate('backToDashboard')}
              </Button>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl text-gray-900">{translate('guestInformation')}</h1>
              </div>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="ml-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              {translate('refresh')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={translate('searchByGuestIdOnly')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleSearch(searchQuery)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {translate('searchGuest')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selected Guest Details */}
        {selectedGuest && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{translate('guestDetails')}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={closeGuestDetails}>
                  <X className="w-4 h-4 mr-2" />
                  {translate('close')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGuest(selectedGuest)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {translate('delete')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{translate('personalInformation')}</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">{translate('guestId')}:</span> {selectedGuest.id}</div>
                    <div><span className="font-medium">{translate('name')}:</span> {`${selectedGuest.firstName} ${selectedGuest.middleName || ''} ${selectedGuest.lastName}`.trim()}</div>
                    <div><span className="font-medium">{translate('gender')}:</span> {selectedGuest.gender}</div>
                    <div><span className="font-medium">{translate('age')}:</span> {selectedGuest.age}</div>
                    <div><span className="font-medium">{translate('registration')}:</span> {new Date(selectedGuest.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{translate('contactInformation')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedGuest.mobilePhone}
                    </div>
                    {selectedGuest.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedGuest.email}
                      </div>
                    )}
                    <div><span className="font-medium">{translate('emergencyContactTitle')}:</span> {selectedGuest.emergencyContactName}</div>
                    <div><span className="font-medium">{translate('emergencyPhone')}:</span> {selectedGuest.emergencyContactPhone}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{translate('medicalInformation')}</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">{translate('medicalConditions')}:</span> {selectedGuest.medicalConditions || translate('none')}</div>
                    <div><span className="font-medium">{translate('specialNeeds')}:</span> {selectedGuest.specialNeeds || translate('none')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guests List */}
        <Card>
          <CardHeader>
            <CardTitle>{translate('allRegisteredGuests')} ({filteredGuests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {`${guest.firstName} ${guest.middleName || ''} ${guest.lastName}`.trim()}
                        </h4>
                        <p className="text-sm text-gray-600">ID: {guest.id}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{guest.mobilePhone}</span>
                          <Badge variant="outline">{guest.gender}</Badge>
                          <Badge variant="outline">{translate('age')} {guest.age}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGuest(guest)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {translate('view')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGuest(guest)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredGuests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{translate('noGuestsFound')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the guest record for{' '}
              {guestToDelete && `${guestToDelete.firstName} ${guestToDelete.lastName}`}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translate('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Yes, {translate('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};