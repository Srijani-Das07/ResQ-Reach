import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, Users, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup, onBack }) => {
  const { login } = useAuth();
  const { translate } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast.success('Login successful!');
      } else {
        toast.error('Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed demo login functionality

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex flex-col">
      {/* Header with Back Button */}
      {onBack && (
        <div className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Citizen Login - Disaster Management System
            </h1>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - App Info */}
        <div className="hidden md:block space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-2">
              🚨 Disaster Management System
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your emergency response companion for safer communities
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold">Find Nearby Shelters</h3>
                <p className="text-sm text-gray-600">Locate relief centers and safe zones during emergencies</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Emergency Alerts</h3>
                <p className="text-sm text-gray-600">Receive real-time disaster warnings and safety updates</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Community Support</h3>
                <p className="text-sm text-gray-600">Connect with help and support your neighbors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <p className="text-gray-600">Sign in to access emergency services</p>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup" onClick={onNavigateToSignup}>Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={onNavigateToSignup}
                    >
                      Sign up here
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};