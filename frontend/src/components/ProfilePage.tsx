import React from 'react';
import { ArrowLeft, User, MapPin, Phone, Calendar, Shield, Heart, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { translate } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3>No user data found</h3>
            <p className="text-gray-600 mb-4">Please log in again</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-red-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Profile Details</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {translate('personalInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg">
                  {user.firstName} {user.middleName ? user.middleName + ' ' : ''}{user.lastName}
                </p>
              </div>
              {user.dob && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-lg">{formatDate(user.dob)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Age Bracket</label>
                <p className="text-lg">{user.ageBracket}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                <p className="text-lg">{user.mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {translate('addressInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">{translate('streetAddress')}</label>
                <p className="text-lg">{user.street}</p>
              </div>
              {user.village && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{translate('village')}</label>
                  <p className="text-lg">{user.village}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">{translate('district')}</label>
                <p className="text-lg">{user.district}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{translate('state')}</label>
                <p className="text-lg">{user.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">PIN Code</label>
                <p className="text-lg">{user.pincode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">GPS Consent</label>
                <Badge variant={user.gpsConsent ? "default" : "secondary"}>
                  {user.gpsConsent ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Accessibility Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health & Accessibility Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Disabilities</label>
                {user.disabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.disabilities.map((disability, index) => (
                      <Badge key={index} variant="outline">
                        {disability}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg">None</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pregnant/Nursing</label>
                <Badge variant={user.pregnantNursing ? "default" : "secondary"}>
                  {user.pregnantNursing ? "Yes" : "No"}
                </Badge>
              </div>
              {user.chronicConditions && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Chronic Medical Conditions</label>
                  <p className="text-lg">{user.chronicConditions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-lg font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Verification Level</label>
                <Badge variant={user.verificationLevel === 'verified' ? "default" : "secondary"}>
                  {user.verificationLevel === 'verified' ? 'Verified' : 'Basic'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <p className="text-lg">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Information */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Phone className="h-5 w-5" />
              Emergency Contact Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-red-600">Primary: 8838724140</p>
              <p className="text-sm text-red-600">Secondary: 6380152442</p>
              <p className="text-xs text-gray-600 mt-2">
                These numbers will be called sequentially during emergency situations.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};