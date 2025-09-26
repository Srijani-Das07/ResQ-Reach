import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Building2, Shield, Users } from 'lucide-react';

interface PreHomePageProps {
  onRoleSelect: (role: 'government' | 'rescue-center' | 'citizen') => void;
}

export const PreHomePage: React.FC<PreHomePageProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-800">Disaster Management System</h1>
          <p className="text-lg text-gray-600">Choose your role to access the appropriate dashboard</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Government Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-blue-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-4 text-gray-800">Government</h3>
              <p className="text-gray-600 mb-6">
                Access government dashboard to monitor rescue centers, view occupancy data, and manage emergency response operations.
              </p>
              <Button 
                onClick={() => onRoleSelect('government')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Access Government Portal
              </Button>
            </CardContent>
          </Card>

          {/* Rescue Center Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-green-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-4 text-gray-800">Rescue Center</h3>
              <p className="text-gray-600 mb-6">
                Manage rescue center operations, register new guests, update capacity information, and track resources.
              </p>
              <Button 
                onClick={() => onRoleSelect('rescue-center')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Access Rescue Center
              </Button>
            </CardContent>
          </Card>

          {/* Citizen Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 hover:border-purple-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl mb-4 text-gray-800">Citizen</h3>
              <p className="text-gray-600 mb-6">
                Find nearby shelter centers, view availability, access emergency resources, and get first aid guidance.
              </p>
              <Button 
                onClick={() => onRoleSelect('citizen')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Access Citizen Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};