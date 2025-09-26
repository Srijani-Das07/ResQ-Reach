import { apiService } from './api';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
}

export interface Translation {
  [key: string]: string;
}

export interface LanguageData {
  code: string;
  name: string;
  nativeName: string;
  translations: Translation;
  isActive: boolean;
}

export class LanguageService {
  async getAllLanguages(): Promise<Language[]> {
    try {
      return await apiService.get<Language[]>('/api/languages');
    } catch (error) {
      console.log('Using offline mode for languages');
      return this.getSupportedLanguages();
    }
  }

  async getTranslations(langCode: string): Promise<Translation> {
    try {
      const response = await apiService.get<LanguageData>(`/api/languages/${langCode}`);
      return response.translations;
    } catch (error) {
      console.log('Using offline mode for translations');
      const defaultTranslations = this.getDefaultTranslations();
      return defaultTranslations[langCode] || defaultTranslations['en'];
    }
  }

  async upsertLanguage(langCode: string, languageData: Omit<LanguageData, 'code'>): Promise<LanguageData> {
    try {
      return await apiService.put<LanguageData>(`/api/languages/${langCode}`, languageData);
    } catch (error) {
      console.log('Using offline mode for language upsert');
      return {
        code: langCode,
        ...languageData
      };
    }
  }

  async deactivateLanguage(langCode: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiService.delete<{ success: boolean; message: string }>(`/api/languages/${langCode}`);
    } catch (error) {
      console.log('Using offline mode for language deactivation');
      return { success: true, message: 'Language deactivated in offline mode' };
    }
  }

  // Default translations for fallback
  getDefaultTranslations(): { [langCode: string]: Translation } {
    return {
      en: {
        'dashboard': 'Dashboard',
        'first_aid': 'First Aid',
        'action_guide': 'Action Guide',
        'profile': 'Profile',
        'emergency_alert': 'Emergency Alert',
        'find_shelter': 'Find Shelter',
        'emergency_contacts': 'Emergency Contacts',
        'logout': 'Logout',
        'login': 'Login',
        'signup': 'Sign Up',
        'welcome': 'Welcome',
        'emergency': 'Emergency',
        'shelter_info': 'Shelter Information',
        'capacity': 'Capacity',
        'distance': 'Distance',
        'contact': 'Contact',
        'resources': 'Resources',
        'food': 'Food',
        'water': 'Water',
        'medicine': 'Medicine',
        'blankets': 'Blankets',
        'tents': 'Tents'
      },
      hi: {
        'dashboard': 'डैशबोर्ड',
        'first_aid': 'प्राथमिक चिकित्सा',
        'action_guide': 'कार्य गाइड',
        'profile': 'प्रोफ़ाइल',
        'emergency_alert': 'आपातकालीन अलर्ट',
        'find_shelter': 'आश्रय खोजें',
        'emergency_contacts': 'आपातकालीन संपर्क',
        'logout': 'लॉगआउट',
        'login': 'लॉगिन',
        'signup': 'साइन अप',
        'welcome': 'स्वागत',
        'emergency': 'आपातकाल',
        'shelter_info': 'आश्रय जानकारी',
        'capacity': 'क्षमता',
        'distance': 'दूरी',
        'contact': 'संपर्क',
        'resources': 'संसाधन',
        'food': 'भोजन',
        'water': 'पानी',
        'medicine': 'दवा',
        'blankets': 'कंबल',
        'tents': 'तंबू'
      }
      // Add other languages as needed
    };
  }

  // Get supported languages with fallback
  getSupportedLanguages(): Language[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English', isActive: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', isActive: true },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isActive: true },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isActive: true },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isActive: true },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isActive: true },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isActive: true },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isActive: true },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isActive: true },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isActive: true }
    ];
  }
}

export const languageService = new LanguageService();