import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, User, Phone, MapPin, Heart, Shield, Check, Mail, Calendar, Edit, Save, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { toast } from 'sonner@2.0.3';

interface ProfileInfoPageProps {
  onBack: () => void;
}

export const ProfileInfoPage: React.FC<ProfileInfoPageProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  const { translate } = useLanguage();
  
  // Edit states
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  
  // Form states for editing - initialize properly with useEffect
  const [addressData, setAddressData] = useState({
    street: '',
    village: '',
    district: '',
    state: '',
    pincode: ''
  });
  
  const [medicalData, setMedicalData] = useState({
    disabilities: [] as string[],
    chronicConditions: '',
    pregnantNursing: false
  });

  // Initialize form data when user data is available
  React.useEffect(() => {
    if (user) {
      setAddressData({
        street: user.street || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
      
      setMedicalData({
        disabilities: user.disabilities || [],
        chronicConditions: user.chronicConditions || '',
        pregnantNursing: user.pregnantNursing || false
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">{translate('noUserInfo')}</h2>
          <Button onClick={onBack}>{translate('goBack')}</Button>
        </div>
      </div>
    );
  }

  const handleSaveAddress = async () => {
    try {
      const success = await updateProfile(addressData);
      if (success) {
        setIsEditingAddress(false);
        toast.success('Address information updated successfully!');
      } else {
        toast.error('Failed to update address information');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Error updating address information');
    }
  };

  const handleSaveMedical = async () => {
    try {
      const success = await updateProfile(medicalData);
      if (success) {
        setIsEditingMedical(false);
        toast.success('Medical information updated successfully!');
      } else {
        toast.error('Failed to update medical information');
      }
    } catch (error) {
      console.error('Error updating medical info:', error);
      toast.error('Error updating medical information');
    }
  };

  const toggleDisability = (disability: string) => {
    setMedicalData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter(d => d !== disability)
        : [...prev.disabilities, disability]
    }));
  };

  const availableDisabilities = [
    'Visual Impairment',
    'Hearing Impairment',
    'Physical Disability',
    'Cognitive Disability',
    'Speech Impairment',
    'Multiple Disabilities'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Information
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">First Name</label>
                  <p className="font-medium">{user.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Middle Name</label>
                  <p className="font-medium">{user.middleName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Name</label>
                  <p className="font-medium">{user.lastName || 'Not provided'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Date of Birth</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {user.dob || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Age Bracket</label>
                  <p className="font-medium">
                    <Badge variant="outline">{user.ageBracket || 'Not specified'}</Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Email Address</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mobile Number</label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {user.mobile ? `+91 ${user.mobile}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </div>
                {!isEditingAddress ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditingAddress(false);
                        setAddressData({
                          street: user?.street || '',
                          village: user?.village || '',
                          district: user?.district || '',
                          state: user?.state || '',
                          pincode: user?.pincode || ''
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSaveAddress}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingAddress ? (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Street Address</label>
                    <p className="font-medium">{user.street || 'Not provided'}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Village/City</label>
                      <p className="font-medium">{user.village || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">District</label>
                      <p className="font-medium">{user.district || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">State</label>
                      <p className="font-medium">{user.state || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="font-medium">{user.pincode || 'Not provided'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Street Address</label>
                    <Input
                      value={addressData.street}
                      onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="Enter street address"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Village/City</label>
                      <Input
                        value={addressData.village}
                        onChange={(e) => setAddressData(prev => ({ ...prev, village: e.target.value }))}
                        placeholder="Village/City"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">District</label>
                      <Input
                        value={addressData.district}
                        onChange={(e) => setAddressData(prev => ({ ...prev, district: e.target.value }))}
                        placeholder="District"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">State</label>
                      <Input
                        value={addressData.state}
                        onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <Input
                      value={addressData.pincode}
                      onChange={(e) => setAddressData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Pincode"
                    />
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <label className="text-sm text-gray-600">GPS Consent</label>
                <p className="font-medium flex items-center gap-2">
                  {user.gpsConsent ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </>
                  ) : (
                    <Badge variant="outline">Not enabled</Badge>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </div>
                {!isEditingMedical ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingMedical(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditingMedical(false);
                        setMedicalData({
                          disabilities: user?.disabilities || [],
                          chronicConditions: user?.chronicConditions || '',
                          pregnantNursing: user?.pregnantNursing || false
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSaveMedical}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingMedical ? (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Disabilities</label>
                    {user.disabilities && user.disabilities.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.disabilities.map((disability, index) => (
                          <Badge key={index} variant="outline">{disability}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-gray-500">None specified</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Pregnancy/Nursing Status</label>
                    <p className="font-medium">
                      {user.pregnantNursing ? (
                        <Badge className="bg-pink-100 text-pink-800">Pregnant or Nursing</Badge>
                      ) : (
                        <span className="text-gray-500">Not applicable</span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Chronic Health Conditions</label>
                    <p className="font-medium">{user.chronicConditions || 'None specified'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Disabilities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableDisabilities.map((disability) => (
                        <div key={disability} className="flex items-center space-x-2">
                          <Checkbox
                            id={disability}
                            checked={medicalData.disabilities.includes(disability)}
                            onCheckedChange={() => toggleDisability(disability)}
                          />
                          <label htmlFor={disability} className="text-sm">{disability}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Pregnancy/Nursing Status</label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pregnantNursing"
                        checked={medicalData.pregnantNursing}
                        onCheckedChange={(checked) => 
                          setMedicalData(prev => ({ ...prev, pregnantNursing: !!checked }))
                        }
                      />
                      <label htmlFor="pregnantNursing" className="text-sm">Currently pregnant or nursing</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Chronic Health Conditions</label>
                    <Textarea
                      value={medicalData.chronicConditions}
                      onChange={(e) => setMedicalData(prev => ({ ...prev, chronicConditions: e.target.value }))}
                      placeholder="Describe any chronic health conditions..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Data Sharing Consent</label>
                  <p className="font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Granted</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Emergency Alerts</label>
                  <p className="font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button onClick={onBack} className="w-full md:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};