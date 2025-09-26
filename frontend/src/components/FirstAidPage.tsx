import React from 'react';
import { ArrowLeft, Heart, AlertTriangle, Thermometer, Scissors, Shield, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageContext';

interface FirstAidPageProps {
  onBack: () => void;
}

// First Aid content that will be translated
const getFirstAidData = (translate: (key: string) => string) => [
  {
    id: '1',
    title: translate('bleedingControl') || 'Bleeding Control',
    severity: 'critical',
    icon: Heart,
    videoUrl: 'https://www.youtube.com/watch?v=LkmJZ-JBWi4',
    steps: [
      translate('bleedingStep1') || 'Apply direct, firm pressure on the wound with a clean cloth or sterile gauze pad',
      translate('bleedingStep2') || 'Maintain pressure for 10-15 minutes without lifting to check if bleeding has stopped',
      translate('bleedingStep3') || 'If bleeding soaks through, add more layers without removing the first cloth',
      translate('bleedingStep4') || 'Elevate the injured limb above heart level if no fracture is suspected',
      translate('bleedingStep5') || 'If bleeding continues, apply pressure to nearest pressure point (wrist, upper arm, groin, or behind knee)',
      translate('bleedingStep6') || 'Never remove objects embedded in wounds - secure them in place and seek immediate medical help'
    ]
  },
  {
    id: '2',
    title: translate('burnsTreatment') || 'Burns Treatment',
    severity: 'high',
    icon: Thermometer,
    videoUrl: 'https://www.youtube.com/watch?v=i2aT5fhpvgA',
    steps: [
      translate('burnsStep1') || 'Move person away from heat source and stop the burning process immediately',
      translate('burnsStep2') || 'Cool the burn with cool (not cold) running water for 15-20 minutes',
      translate('burnsStep3') || 'Remove jewelry, clothing, and accessories near the burn before swelling begins',
      translate('burnsStep4') || 'Cover burn with clean, dry cloth or sterile non-adhesive bandage',
      translate('burnsStep5') || 'Never apply ice, butter, oil, or any ointments to severe burns',
      translate('burnsStep6') || 'For chemical burns, flush with water for at least 20 minutes while removing contaminated clothing',
      translate('burnsStep7') || 'Seek immediate medical attention for burns larger than palm of hand or on face, hands, feet, or genitals'
    ]
  },
  {
    id: '3',
    title: translate('fractureManagement') || 'Fracture Management',
    severity: 'high',
    icon: Shield,
    videoUrl: 'https://www.youtube.com/watch?v=N3Mjjx6eDGk',
    steps: [
      translate('fractureStep1') || 'Do not move the person unless they are in immediate danger',
      translate('fractureStep2') || 'Support the injured area and prevent movement above and below the fracture site',
      translate('fractureStep3') || 'Use rigid materials (boards, magazines) as splints to immobilize the area',
      translate('fractureStep4') || 'Pad splints with soft material and secure with cloth strips, not directly over the fracture',
      translate('fractureStep5') || 'Check for numbness, tingling, or color changes in fingers/toes every 15 minutes',
      translate('fractureStep6') || 'Apply ice pack wrapped in cloth for 20 minutes at a time to reduce swelling',
      translate('fractureStep7') || 'Call emergency services immediately - do not give food or water'
    ]
  },
  {
    id: '4',
    title: translate('chokingRelief') || 'Choking Relief',
    severity: 'critical',
    icon: AlertTriangle,
    videoUrl: 'https://www.youtube.com/watch?v=Zk-npz72GWI',
    steps: [
      translate('chokingStep1') || 'Ask "Are you choking?" If person can speak or cough forcefully, encourage continued coughing',
      translate('chokingStep2') || 'If person cannot speak, cough, or breathe, stand behind them and lean them forward',
      translate('chokingStep3') || 'Give 5 sharp back blows between shoulder blades with heel of your hand',
      translate('chokingStep4') || 'If unsuccessful, place arms around waist, make fist above navel, grasp with other hand',
      translate('chokingStep5') || 'Give 5 quick upward abdominal thrusts (Heimlich maneuver)',
      translate('chokingStep6') || 'Alternate 5 back blows and 5 abdominal thrusts until object dislodges or person becomes unconscious',
      translate('chokingStep7') || 'If unconscious, begin CPR immediately and call emergency services'
    ]
  },
  {
    id: '5',
    title: translate('unconsciousnessFainting') || 'Unconsciousness/Fainting',
    severity: 'medium',
    icon: Heart,
    videoUrl: 'https://www.youtube.com/watch?v=-KidD6_Fmio',
    steps: [
      translate('unconsciousnessStep1') || 'Check responsiveness by tapping shoulders firmly and shouting "Hello! Are you okay?"',
      translate('unconsciousnessStep2') || 'Call for help immediately and ask someone to call emergency services',
      translate('unconsciousnessStep3') || 'Check for normal breathing by looking for chest movement for no more than 10 seconds',
      translate('unconsciousnessStep4') || 'If breathing normally, place in recovery position: on side, head tilted back, top leg bent',
      translate('unconsciousnessStep5') || 'If not breathing normally, begin CPR immediately with chest compressions',
      translate('unconsciousnessStep6') || 'Loosen tight clothing around neck and waist to help breathing',
      translate('unconsciousnessStep7') || 'Monitor breathing and consciousness continuously until emergency services arrive'
    ]
  },
  {
    id: '6',
    title: translate('basicWoundCare') || 'Basic Wound Care',
    severity: 'low',
    icon: Scissors,
    videoUrl: 'https://www.youtube.com/watch?v=0TZspUGZskY',
    steps: [
      translate('woundCareStep1') || 'Wash your hands thoroughly with soap and water for at least 20 seconds',
      translate('woundCareStep2') || 'Stop bleeding by applying gentle, direct pressure with clean cloth',
      translate('woundCareStep3') || 'Rinse wound gently with clean water to remove dirt and debris',
      translate('woundCareStep4') || 'Pat dry with clean cloth and apply thin layer of antibiotic ointment if available',
      translate('woundCareStep5') || 'Cover with sterile adhesive bandage or gauze and medical tape',
      translate('woundCareStep6') || 'Change dressing daily or when it becomes wet, dirty, or loose',
      translate('woundCareStep7') || 'Watch for signs of infection: increased pain, redness, swelling, warmth, or pus'
    ]
  }
];

export const FirstAidPage: React.FC<FirstAidPageProps> = ({ onBack }) => {
  const { translate } = useLanguage();
  
  const firstAidData = getFirstAidData(translate);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    return translate(`severity${severity.charAt(0).toUpperCase() + severity.slice(1)}`) || severity.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-red-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex items-center gap-2">
            <Heart className="h-6 w-6" />
            {translate('firstAidGuide')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-gray-600">
            {translate('firstAidDescription')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {firstAidData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-red-600" />
                      {item.title}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={getSeverityColor(item.severity)}
                    >
                      {getSeverityLabel(item.severity)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.videoUrl && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <a 
                        href={item.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {translate('watchTutorialVideo')}
                      </a>
                    </div>
                  )}
                  <ol className="space-y-2">
                    {item.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Numbers */}
        <Card className="mt-6 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">{translate('emergencyContactNumbers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-red-800">{translate('police')}</div>
                <div>100</div>
              </div>
              <div>
                <div className="font-medium text-red-800">{translate('fireService')}</div>
                <div>101</div>
              </div>
              <div>
                <div className="font-medium text-red-800">{translate('ambulance')}</div>
                <div>108</div>
              </div>
              <div>
                <div className="font-medium text-red-800">{translate('disasterHelpline')}</div>
                <div>1078</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <p className="text-sm text-yellow-800">
            <strong>{translate('importantNote')}</strong> {translate('firstAidDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};