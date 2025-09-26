import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, UserPlus, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUnifiedDatabase } from './UnifiedDatabaseContext';
import { useLanguage } from './LanguageContext';

interface AddGuestPageProps {
  onBack: () => void;
}

interface GuestFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  mobilePhone: string;
  alternateMobile: string;
  email: string;
  permanentAddress: string;
  medicalConditions: string;
  currentMedications: string;
  allergies: string;
  disabilityStatus: string;
  specialNeeds: string;
}

interface FieldErrors {
  [key: string]: string;
}

export const AddGuestPage: React.FC<AddGuestPageProps> = ({ onBack }) => {
  const { addGuest, loading, rescueCenters } = useUnifiedDatabase();
  const { translate } = useLanguage();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedGuestId, setAddedGuestId] = useState<string>('');
  
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    mobilePhone: '',
    alternateMobile: '',
    email: '',
    permanentAddress: '',
    medicalConditions: '',
    currentMedications: '',
    allergies: '',
    disabilityStatus: '',
    specialNeeds: ''
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return !value.trim() ? translate('required') : '';
      case 'gender':
        return !value ? translate('required') : '';
      case 'mobilePhone':
        if (!value.trim()) return translate('required');
        const phoneRegex = /^[0-9]{10}$/;
        return !phoneRegex.test(value) ? translate('invalidPhone') : '';
      case 'email':
        if (value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !emailRegex.test(value) ? translate('invalidEmail') : '';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    // Validate required fields
    ['firstName', 'lastName', 'gender', 'mobilePhone'].forEach(field => {
      const error = validateField(field, formData[field as keyof GuestFormData] as string);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate email if provided
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) {
        newErrors.email = emailError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      // Use the first rescue center or default to RC001
      const currentCenterId = rescueCenters.length > 0 ? rescueCenters[0].id : 'RC001';
      
      const guestData = {
        ...formData,
        centerId: currentCenterId
      };

      const newGuest = await addGuest(guestData);
      
      // Show success modal instead of just toast
      setAddedGuestId(newGuest.id);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        mobilePhone: '',
        alternateMobile: '',
        email: '',
        permanentAddress: '',
        medicalConditions: '',
        currentMedications: '',
        allergies: '',
        disabilityStatus: '',
        specialNeeds: ''
      });
    } catch (error) {
      toast.error('Failed to register guest. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setAddedGuestId('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {translate('backToDashboard')}
            </Button>
            <div className="flex items-center">
              <UserPlus className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-xl text-gray-900">{translate('addNewGuest')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{translate('guestRegistrationForm')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Identification */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{translate('basicIdentification')}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{translate('firstName')} *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">{translate('middleName')}</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{translate('lastName')} *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">{translate('gender')} *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={translate('selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{translate('male')}</SelectItem>
                        <SelectItem value="female">{translate('female')}</SelectItem>
                        <SelectItem value="other">{translate('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{translate('dateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{translate('age')}</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{translate('contactInformation')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobilePhone">{translate('mobilePhone')} *</Label>
                    <Input
                      id="mobilePhone"
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      required
                    />
                    {errors.mobilePhone && (
                      <p className="text-xs text-red-500 mt-1">{errors.mobilePhone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternateMobile">{translate('alternateMobile')}</Label>
                    <Input
                      id="alternateMobile"
                      type="tel"
                      value={formData.alternateMobile}
                      onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{translate('emailAddress')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Optional email address"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">{translate('permanentAddress')}</Label>
                    <Textarea
                      id="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    checked={showMedicalInfo}
                    onCheckedChange={(checked) => setShowMedicalInfo(checked as boolean)}
                  />
                  <h3 className="text-lg font-medium text-gray-900">{translate('medicalCondition')}</h3>
                </div>
                
                {showMedicalInfo && (
                  <>
                    <h4 className="text-md font-medium text-gray-700 mb-4">{translate('medicalInformation')}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Existing Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="e.g., diabetes, hypertension, heart problems"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      value={formData.currentMedications}
                      onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Food/medicine allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabilityStatus">Disability Status</Label>
                    <Input
                      id="disabilityStatus"
                      value={formData.disabilityStatus}
                      onChange={(e) => handleInputChange('disabilityStatus', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialNeeds">Special Needs</Label>
                    <Input
                      id="specialNeeds"
                      placeholder="wheelchair, hearing aid, etc."
                      value={formData.specialNeeds}
                      onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                    />
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  {translate('cancel')}
                </Button>
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? (
                    translate('registering')
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {translate('registerGuest')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Guest Added Successfully!
            </DialogTitle>
            <DialogDescription>
              The guest has been successfully registered in the system and assigned a unique ID.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Guest Registration Complete
            </h3>
            <p className="text-gray-600 mb-4">
              The guest has been successfully registered in the system.
            </p>
            {addedGuestId && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Guest ID:</p>
                <p className="font-mono font-medium text-gray-900">{addedGuestId}</p>
              </div>
            )}
            <Button onClick={handleSuccessModalClose} className="w-full">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};