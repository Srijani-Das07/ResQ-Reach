import React from 'react';
import { X, Globe, Wifi, Heart, Book, User, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useLanguage, languages } from './LanguageContext';
import { useAuth } from './AuthContext';
import { Separator } from './ui/separator';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentLanguage, changeLanguage, translate, dataSaverMode, toggleDataSaver } = useLanguage();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {/* Profile Picture */}
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                
                {/* Profile Name */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || 'No email'}
                  </p>
                </div>
                
                {/* Profile Info Button */}
                <Button
                  onClick={() => {
                    try {
                      onNavigate('profile-info');
                      onClose();
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-100 p-2"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Language Mode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {translate('languageMode')}
              </label>
              <Select value={currentLanguage} onValueChange={changeLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language">
                    {languages.find(lang => lang.code === currentLanguage)?.localName || 'English'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.localName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Save Data Mode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-green-600" />
                {translate('saveData')}
              </label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={dataSaverMode}
                  onCheckedChange={toggleDataSaver}
                />
                <span className="text-sm text-gray-600">
                  {dataSaverMode ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Reduces data usage by limiting map quality and features
              </p>
            </div>

            <Separator />

            {/* First Aid */}
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => {
                onNavigate('first-aid');
                onClose();
              }}
            >
              <div className="flex items-center gap-3 p-3 w-full">
                <Heart className="h-5 w-5 text-red-500" />
                <span>{translate('firstAid')}</span>
              </div>
            </Button>

            <Separator />

            {/* Action Guide */}
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
              onClick={() => {
                onNavigate('action-guide');
                onClose();
              }}
            >
              <div className="flex items-center gap-3 p-3 w-full">
                <Book className="h-5 w-5 text-purple-600" />
                <span>{translate('actionGuide')}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};