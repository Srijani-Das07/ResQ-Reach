import React from 'react';
import { ArrowLeft, Book, Zap, Home, Car, Droplets, Wifi, Users, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageContext';

interface ActionGuidePageProps {
  onBack: () => void;
}

const getActionGuideData = (translate: (key: string) => string) => [
  {
    id: '1',
    title: translate('powerOutageTitle') || 'Power Outage',
    category: translate('infrastructureCategory') || 'Infrastructure',
    icon: Zap,
    videoUrl: 'https://www.youtube.com/watch?v=1xnkJm_etPw',
    problem: translate('powerOutageProblem') || 'Electricity supply has been cut off due to disaster',
    solutions: [
      translate('powerOutageSolution1') || 'Use flashlights instead of candles to avoid fire risk',
      translate('powerOutageSolution2') || 'Turn off all electrical appliances to prevent damage from power surges',
      translate('powerOutageSolution3') || 'Keep refrigerator and freezer doors closed to preserve food',
      translate('powerOutageSolution4') || 'Use battery-powered radio for emergency updates',
      translate('powerOutageSolution5') || 'Conserve phone battery for emergency communications',
      translate('powerOutageSolution6') || 'Check on elderly neighbors who may need assistance'
    ]
  },
  {
    id: '2',
    title: translate('waterShortageTitle') || 'Water Shortage/Contamination',
    category: translate('essentialServicesCategory') || 'Essential Services',
    icon: Droplets,
    videoUrl: 'https://www.youtube.com/watch?v=XkiyrBKlK8U',
    problem: translate('waterShortageProblem') || 'Clean water supply is limited or contaminated',
    solutions: [
      translate('waterShortageSolution1') || 'Store clean water immediately in clean containers',
      translate('waterShortageSolution2') || 'Boil water for at least 1 minute before drinking if unsure of quality',
      translate('waterShortageSolution3') || 'Use water purification tablets if available',
      translate('waterShortageSolution4') || 'Ration water - prioritize drinking, then cooking, then hygiene',
      translate('waterShortageSolution5') || 'Collect rainwater in clean containers if it\'s raining',
      translate('waterShortageSolution6') || 'Avoid ice unless made from safe water'
    ]
  },
  {
    id: '3',
    title: 'Building Structural Damage',
    category: 'Safety',
    icon: Home,
    videoUrl: 'https://www.youtube.com/watch?v=QCdJu30qHnk',
    problem: 'Home or building shows signs of structural damage',
    solutions: [
      'Evacuate immediately if you suspect structural damage',
      'Do not enter damaged buildings',
      'Stay away from power lines and broken glass',
      'Document damage with photos for insurance if safe to do so',
      'Turn off gas, electricity, and water if you can do so safely',
      'Report damage to local authorities'
    ]
  },
  {
    id: '4',
    title: 'Communication Network Down',
    category: 'Communication',
    icon: Wifi,
    videoUrl: 'https://www.youtube.com/watch?v=1xnkJm_etPw',
    problem: 'Phone lines and internet are not working',
    solutions: [
      'Use battery-powered or hand-crank radio for information',
      'Try different networks (WiFi, cellular data, SMS)',
      'Designate an out-of-area contact for family coordination',
      'Use social media check-in features when possible',
      'Visit community centers or shelters for information',
      'Write down important information and phone numbers'
    ]
  },
  {
    id: '5',
    title: 'Transportation Disruption',
    category: 'Mobility',
    icon: Car,
    videoUrl: 'https://www.youtube.com/watch?v=qiUMZnr0zIM',
    problem: 'Roads are blocked or vehicles are not available',
    solutions: [
      'Stay where you are if it\'s safe rather than traveling',
      'Use alternative routes if you must travel',
      'Walk in groups and stay on main roads',
      'Carry identification and emergency contact information',
      'Check with neighbors about sharing transportation',
      'Listen to traffic reports before attempting to travel'
    ]
  },
  {
    id: '6',
    title: 'Separated from Family',
    category: 'Family Safety',
    icon: Users,
    webUrl: 'https://ndma.gov.in/Capacity_Building/Aapda-Mitra',
    problem: 'Family members are in different locations during disaster',
    solutions: [
      'Stay calm and don\'t panic',
      'Try to contact family through various means (call, text, social media)',
      'Go to predetermined meeting place if you have one',
      'Contact your designated out-of-area family contact',
      'Register with NDMA Aapda Mitra program for family tracing',
      'Leave messages at your home if you must leave'
    ]
  },
  {
    id: '7',
    title: 'Food Shortage',
    category: 'Essential Services',
    icon: Home,
    webUrl: 'https://ndma.gov.in/Natural-Hazards/Floods',
    problem: 'Limited access to food and grocery stores are closed',
    solutions: [
      'Ration existing food supplies carefully',
      'Eat perishable foods first before they spoil',
      'Share resources with neighbors if possible',
      'Look for community food distribution points',
      'Check NDMA preparedness guidelines for local resources',
      'Prioritize high-energy foods and water over other items'
    ]
  },
  {
    id: '8',
    title: 'Medical Emergency Without Access to Hospital',
    category: 'Medical',
    icon: Zap,
    videoUrl: 'https://www.youtube.com/watch?v=N3Mjjx6eDGk',
    problem: 'Medical emergency when hospitals are inaccessible',
    solutions: [
      'Apply basic first aid knowledge if trained',
      'Try to reach emergency services through any available means',
      'Ask neighbors if anyone has medical training',
      'Use any available medications carefully and as directed',
      'Keep the person calm and comfortable',
      'Document symptoms and treatments given for when help arrives'
    ]
  }
];

export const ActionGuidePage: React.FC<ActionGuidePageProps> = ({ onBack }) => {
  const { translate } = useLanguage();
  
  const actionGuideData = getActionGuideData(translate);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Infrastructure': return 'bg-blue-100 text-blue-800';
      case 'Essential Services': return 'bg-green-100 text-green-800';
      case 'Safety': return 'bg-red-100 text-red-800';
      case 'Communication': return 'bg-purple-100 text-purple-800';
      case 'Mobility': return 'bg-orange-100 text-orange-800';
      case 'Family Safety': return 'bg-pink-100 text-pink-800';
      case 'Medical': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-purple-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex items-center gap-2">
            <Book className="h-6 w-6" />
            {translate('actionGuide')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-gray-600">
            {translate('actionGuideDescription') || 'Common problems faced during disasters and practical solutions to overcome them. Always prioritize safety and seek professional help when available.'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {actionGuideData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-purple-600" />
                      {item.title}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(item.category)}
                    >
                      {item.category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r">
                    <h4 className="font-medium text-red-800 mb-1">Problem:</h4>
                    <p className="text-sm text-red-700">{item.problem}</p>
                  </div>

                  {(item.videoUrl || item.webUrl) && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <a 
                        href={item.videoUrl || item.webUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {item.videoUrl ? 'Watch Tutorial Video' : 'NDMA Guidelines & Resources'}
                      </a>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Solutions:</h4>
                    <ul className="space-y-2">
                      {item.solutions.map((solution, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm">
                            {index + 1}
                          </span>
                          <span className="text-sm leading-relaxed">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Reference */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Quick Reference - Priority Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Immediate Priorities (0-1 hour):</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Ensure personal safety</li>
                  <li>• Check for injuries</li>
                  <li>• Account for all family members</li>
                  <li>• Assess immediate hazards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Short-term Actions (1-24 hours):</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Secure shelter and warmth</li>
                  <li>• Establish communication</li>
                  <li>• Manage water and food supplies</li>
                  <li>• Assist neighbors if safe to do so</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <p className="text-sm text-green-800">
            <strong>Remember:</strong> Stay calm, assess the situation, prioritize safety, 
            and take action step by step. When in doubt, seek help from emergency services 
            or trained personnel.
          </p>
        </div>
      </div>
    </div>
  );
};