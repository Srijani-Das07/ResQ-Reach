import React, { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, Heart, Shield, Check, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess?: () => void;
  onBack?: () => void;
}

interface FormData {
  // Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  ageBracket: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  otpVerified: boolean;
  
  // Address
  street: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  gpsConsent: boolean;
  
  // Medical Info
  disabilities: string[];
  pregnantNursing: boolean;
  chronicConditions: string;
  
  // Consent
  dataConsent: boolean;
  alertConsent: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

const steps = ['Personal Info', 'Address & GPS', 'Medical Info', 'Consent & Verification'];

const disabilities = [
  'Visual Impairment',
  'Hearing Impairment', 
  'Mobility Impairment',
  'Cognitive Impairment'
];

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin, onSignupSuccess, onBack }) => {
  const { translate } = useLanguage();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '', middleName: '', lastName: '', dob: '', ageBracket: '18-64',
    email: '', password: '', confirmPassword: '',
    mobile: '', otpVerified: false,
    street: '', village: '', district: '', state: '', pincode: '',
    gpsConsent: false,
    disabilities: [], pregnantNursing: false, chronicConditions: '',
    dataConsent: false, alertConsent: false
  });

  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return !value ? translate('required') : '';
      case 'email':
        if (!value) return translate('required');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? translate('invalidEmail') : '';
      case 'password':
        if (!value) return translate('required');
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'confirmPassword':
        if (!value) return translate('required');
        return value !== formData.password ? 'Passwords do not match' : '';
      case 'mobile':
        if (!value) return translate('required');
        const phoneRegex = /^[0-9]{10}$/;
        return !phoneRegex.test(value) ? translate('invalidPhone') : '';
      case 'street':
      case 'district':
      case 'state':
      case 'pincode':
        return !value ? translate('required') : '';
      default:
        return '';
    }
  };

  const validateStep = () => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 0:
        ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'mobile'].forEach(field => {
          const error = validateField(field, formData[field as keyof FormData]);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        });
        if (!formData.otpVerified) {
          newErrors.mobile = 'Please verify your mobile number';
          isValid = false;
        }
        break;
      case 1:
        ['street', 'district', 'state', 'pincode'].forEach(field => {
          const error = validateField(field, formData[field as keyof FormData]);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        });
        break;
      case 2:
        // Medical info is optional
        isValid = true;
        break;
      case 3:
        if (!formData.dataConsent) {
          newErrors.dataConsent = 'You must agree to data sharing for emergency services';
          isValid = false;
        }
        if (!formData.alertConsent) {
          newErrors.alertConsent = 'You must consent to receive emergency alerts';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendOtp = () => {
    const phoneError = validateField('mobile', formData.mobile);
    if (phoneError) {
      setErrors(prev => ({ ...prev, mobile: phoneError }));
      return;
    }
    
    setShowOtp(true);
    toast.success('OTP sent to your mobile number');
  };

  const verifyOtp = () => {
    if (otp === '123456') { // Mock OTP verification
      updateFormData('otpVerified', true);
      toast.success('Mobile number verified successfully');
    } else {
      toast.error('Invalid OTP. Try 123456 for demo');
    }
  };

  const handleDisabilityChange = (disability: string, checked: boolean) => {
    const updated = checked 
      ? [...formData.disabilities, disability]
      : formData.disabilities.filter(d => d !== disability);
    updateFormData('disabilities', updated);
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dob: formData.dob,
        ageBracket: formData.ageBracket,
        mobile: formData.mobile,
        street: formData.street,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        gpsConsent: formData.gpsConsent,
        disabilities: formData.disabilities,
        pregnantNursing: formData.pregnantNursing,
        chronicConditions: formData.chronicConditions
      };

      const success = await signup(formData.email, formData.password, userData);
      if (success) {
        toast.success('Registration completed successfully!');
        // Navigate to dashboard after successful signup
        if (onSignupSuccess) {
          setTimeout(() => {
            onSignupSuccess();
          }, 1000); // Small delay to show success message
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => updateFormData('middleName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateFormData('dob', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ageBracket">Age Bracket</Label>
                <Select value={formData.ageBracket} onValueChange={(value) => updateFormData('ageBracket', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-17">0-17 years</SelectItem>
                    <SelectItem value="18-64">18-64 years</SelectItem>
                    <SelectItem value="65+">65+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number * (+91)</Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => updateFormData('mobile', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
                <Button onClick={sendOtp} disabled={formData.otpVerified}>
                  {formData.otpVerified ? <Check className="h-4 w-4" /> : 'Send OTP'}
                </Button>
              </div>
              {errors.mobile && (
                <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
              )}
            </div>

            {showOtp && !formData.otpVerified && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <Button onClick={verifyOtp}>Verify</Button>
                </div>
                <p className="text-xs text-gray-500">Demo OTP: 123456</p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => updateFormData('street', e.target.value)}
                placeholder="House/Building number, Street name"
                required
              />
              {errors.street && (
                <p className="text-xs text-red-500 mt-1">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="village">Village/City</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => updateFormData('village', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => updateFormData('district', e.target.value)}
                  required
                />
                {errors.district && (
                  <p className="text-xs text-red-500 mt-1">{errors.district}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => updateFormData('pincode', e.target.value)}
                  maxLength={6}
                  placeholder="6-digit pincode"
                  required
                />
                {errors.pincode && (
                  <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.gpsConsent}
                onCheckedChange={(checked) => updateFormData('gpsConsent', checked)}
              />
              <Label>Share GPS location for better emergency response</Label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Disabilities (if any)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {disabilities.map(disability => (
                  <div key={disability} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.disabilities.includes(disability)}
                      onCheckedChange={(checked) => handleDisabilityChange(disability, checked as boolean)}
                    />
                    <Label className="text-sm">{disability}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.pregnantNursing}
                onCheckedChange={(checked) => updateFormData('pregnantNursing', checked)}
              />
              <Label>Pregnant or Nursing</Label>
            </div>

            <div>
              <Label htmlFor="conditions">Chronic Health Conditions</Label>
              <Textarea
                id="conditions"
                value={formData.chronicConditions}
                onChange={(e) => updateFormData('chronicConditions', e.target.value)}
                placeholder="Optional: Diabetes, Hypertension, etc. or 'Prefer not to say'"
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">
                This information helps emergency responders provide appropriate care
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Data Usage & Privacy</h4>
              <p className="text-sm text-blue-700">
                Your information will be used only for disaster management and emergency response. 
                We follow strict privacy guidelines and never share personal data with unauthorized parties.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={formData.dataConsent}
                  onCheckedChange={(checked) => updateFormData('dataConsent', checked)}
                  required
                />
                <Label className="text-sm leading-relaxed">
                  I agree to share my data for disaster management and emergency response purposes only. 
                  I understand my data will be protected according to privacy guidelines. *
                </Label>
              </div>
              {errors.dataConsent && (
                <p className="text-xs text-red-500 mt-1">{errors.dataConsent}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={formData.alertConsent}
                  onCheckedChange={(checked) => updateFormData('alertConsent', checked)}
                  required
                />
                <Label className="text-sm leading-relaxed">
                  I consent to receiving disaster alerts and emergency notifications on my registered mobile number. *
                </Label>
              </div>
              {errors.alertConsent && (
                <p className="text-xs text-red-500 mt-1">{errors.alertConsent}</p>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Verification Level</h4>
              <p className="text-sm text-green-700 mb-2">
                You are registering at <strong>Basic Level</strong> (Email + Mobile verified)
              </p>
              <p className="text-xs text-green-600">
                For verified status, you can later upload government ID for enhanced access to services.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack || onNavigateToLogin}
            className="text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex items-center gap-2">
            <User className="h-6 w-6" />
            {translate('signup')} - Disaster Management Registration
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 0 && <User className="h-5 w-5" />}
              {currentStep === 1 && <MapPin className="h-5 w-5" />}
              {currentStep === 2 && <Heart className="h-5 w-5" />}
              {currentStep === 3 && <Shield className="h-5 w-5" />}
              {steps[currentStep]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? 'Complete Registration' : 'Next'}
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={onNavigateToLogin}
          >
            Sign in here
          </Button>
        </div>
      </div>
    </div>
  );
};