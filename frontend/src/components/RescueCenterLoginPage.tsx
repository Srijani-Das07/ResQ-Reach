import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RescueCenterLoginPageProps {
  onLogin: (centerId: string, password: string) => Promise<void>;
  onBack: () => void;
}

export const RescueCenterLoginPage: React.FC<RescueCenterLoginPageProps> = ({ onLogin, onBack }) => {
  const [centerId, setCenterId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!centerId || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await onLogin(centerId, password);
      toast.success('Login successful');
    } catch (error) {
      toast.error('Invalid rescue center ID or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Button>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Rescue Center Portal</CardTitle>
            <CardDescription>
              Enter your rescue center credentials to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="centerId">Rescue Center ID</Label>
                <Input
                  id="centerId"
                  type="text"
                  placeholder="Enter your rescue center ID"
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-500">Center ID: RC001</p>
              <p className="text-xs text-gray-500">Password: rescue123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};