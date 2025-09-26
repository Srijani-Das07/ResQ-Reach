import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { firstAidTranslations, actionGuideTranslations } from './LanguageContextTranslations';

interface Language {
  code: string;
  name: string;
  localName: string;
}

interface Translations {
  [key: string]: {
    [language: string]: string;
  };
}

export const languages: Language[] = [
  { code: "en", name: "English", localName: "English" },
  { code: "hi", name: "Hindi", localName: "हिंदी" },
  { code: "ta", name: "Tamil", localName: "தமிழ்" },
  { code: "te", name: "Telugu", localName: "తెలుగు" },
  { code: "kn", name: "Kannada", localName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", localName: "മലയാളം" },
  { code: "bn", name: "Bengali", localName: "বাংলা" },
  { code: "gu", name: "Gujarati", localName: "ગુજરાતી" },
  { code: "as", name: "Assamese", localName: "অসমীয়া" },
  { code: "mr", name: "Marathi", localName: "मराठी" },
];

const translations: Translations = {
  // Import comprehensive First Aid and Action Guide translations
  ...firstAidTranslations,
  ...actionGuideTranslations,

  // Basic UI translations
  alert: {
    en: "ALERT",
    hi: "चेतावनी",
    ta: "எச்சரிக்கை",
    te: "హెచ్చరిక",
    kn: "ಎಚ್ಚರಿಕೆ",
    ml: "മുന്നറിയിപ്പ്",
    bn: "সতর্কতা",
    gu: "ચેતવણી",
    as: "সতৰ্কতা",
    mr: "सावधान",
  },
  login: {
    en: "Login",
    hi: "लॉगिन",
    ta: "உள்நுழைவு",
    te: "లాగిన్",
    kn: "ಲಾಗಿನ್",
    ml: "ലോഗിൻ",
    bn: "লগইন",
    gu: "લોગિন",
    as: "লগইন",
    mr: "लॉगिन",
  },
  signup: {
    en: "Sign Up",
    hi: "साइन अप",
    ta: "பதிவு செய்யுங்கள்",
    te: "సైన్ అప్",
    kn: "ಸೈನ್ ಅಪ್",
    ml: "സൈൻ അപ്പ്",
    bn: "সাইন আপ",
    gu: "સાઇન અપ",
    as: "ছাইন আপ",
    mr: "साइन अप",
  },
  logout: {
    en: "Logout",
    hi: "लॉगआउट",
    ta: "வெளியேறு",
    te: "లాగౌట్",
    kn: "ಲಾಗೌಟ್",
    ml: "ലോഗൗട്ട്",
    bn: "লগআউট",
    gu: "લૉગઆઉટ",
    as: "লগআউট",
    mr: "लॉगआउट",
  },
  profile: {
    en: "Profile",
    hi: "प्रोफाइल",
    ta: "சுயவிவரம்",
    te: "ప్రొఫైల్",
    kn: "ಪ್ರೊಫೈಲ್",
    ml: "പ്രൊഫൈൽ",
    bn: "প্রোফাইল",
    gu: "પ્રોફાઇલ",
    as: "প্ৰফাইল",
    mr: "प्रोफाइल",
  },
  profileDetails: {
    en: "Profile Details",
    hi: "प्रोफाइल विवरण",
    ta: "சுயவிவர விவரங்கள்",
    te: "ప్రొఫైల్ వివరాలు",
    kn: "ಪ್ರೊಫೈಲ್ ವಿವರಗಳು",
    ml: "പ്രൊഫൈൽ വിവരങ്ങൾ",
    bn: "প্রোফাইল বিবরণ",
    gu: "પ્રોફાઇલ વિગતો",
    as: "প্ৰফাইল বিৱৰণ",
    mr: "प्रोफाइल तपशील",
  },

  // Welcome messages
  welcomeBack: {
    en: "Welcome back",
    hi: "वापस स्वागत है",
    ta: "மீண்டும் வருக",
    te: "తిరిగి స్వాగతం",
    kn: "ಮತ್ತೆ ಸ್ವಾಗತ",
    ml: "വീണ്ടും സ്വാഗതം",
    bn: "আবার স্বাগতম",
    gu: "પાછા સ્વાગત છે",
    as: "পুনৰ স্বাগতম",
    mr: "पुन्हा स्वागत",
  },

  // Emergency and shelter related
  emergency: {
    en: "Emergency",
    hi: "आपातकाल",
    ta: "அவசரநிலை",
    te: "అత్యవసర పరిస్థితి",
    kn: "ತುರ್ತುಸ್ಥಿತಿ",
    ml: "അടിയന്തിരാവസ്ഥ",
    bn: "জরুরি অবস্থা",
    gu: "કટોકટી",
    as: "জৰুৰীকালীন অৱস্থা",
    mr: "आपत्काल",
  },

  emergencyAlert: {
    en: "Emergency Alert",
    hi: "आपातकालीन चेतावनी",
    ta: "அவசர எச்சரிக்கை",
    te: "అత్యవసర హెచ్చరిక",
    kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆ",
    ml: "അടിയന്തിര മുന്നറിയിപ്പ്",
    bn: "জরুরি সতর্কতা",
    gu: "કટોકટી ચેતવણી",
    as: "জৰুৰীকালীন সতৰ্কবাণী",
    mr: "आपत्कालीन इशारा",
  },

  tsunamiWarning: {
    en: "Tsunami Warning",
    hi: "सुनामी चेतावनी",
    ta: "சுனாமி எச்சரிக்கை",
    te: "సునామీ హెచ్చరిక",
    kn: "ಸುನಾಮಿ ಎಚ್ಚರಿಕೆ",
    ml: "സുനാമി മുന്നറിയിപ്പ്",
    bn: "সুনামি সতর্কতা",
    gu: "સુનામી ચેતવણી",
    as: "চুনামী সতৰ্কবাণী",
    mr: "त्सुनामी इशारा",
  },

  emergencyContact: {
    en: "Emergency Contact",
    hi: "आपातकालीन संपर्क",
    ta: "அவசர தொடர்பு",
    te: "అత్యవసర సంప్రదింపు",
    kn: "ತುರ್ತು ಸಂಪರ್ಕ",
    ml: "അടിയന്തിര ബന്ധം",
    bn: "জরুরি যোগাযোগ",
    gu: "કટોકટી સંપર્ક",
    as: "জৰুৰীকালীন যোগাযোগ",
    mr: "आपत्कालीन संपर्क",
  },

  findNearestShelter: {
    en: "Find Nearest Shelter",
    hi: "निकटतम आश्रय खोजें",
    ta: "அருகிலுள்ள தங்குமிடம் கண்டறியவும்",
    te: "సమీపంలోని ఆశ్రయాన్ని కనుగొనండి",
    kn: "ಹತ್ತಿರದ ಆಶ್ರಯವನ್ನು ಹುಡುಕಿ",
    ml: "അടുത്തുള്ള അഭയകേന്ദ്രം കണ്ടെത്തുക",
    bn: "নিকটতম আশ্রয় খুঁজুন",
    gu: "નજીકનું આશ્રયસ્થાન શોધો",
    as: "ওচৰৰ আশ্ৰয় বিচাৰক",
    mr: "जवळचे आश्रयस्थान शोधा",
  },

  shelterInformation: {
    en: "Shelter Information",
    hi: "आश्रय जानकारी",
    ta: "தங்குமிட தகவல்",
    te: "ఆశ్రయ సమాచారం",
    kn: "ಆಶ್ರಯ ಮಾಹಿತಿ",
    ml: "അഭയകേന്ദ്ര വിവരങ്ങൾ",
    bn: "আশ্রয় তথ্য",
    gu: "આશ્રય માહિતી",
    as: "আশ্ৰয় তথ্য",
    mr: "आश्रय माहिती",
  },

  capacity: {
    en: "Capacity",
    hi: "क्षमता",
    ta: "திறன்",
    te: "సామర్థ్యం",
    kn: "ಸಾಮರ್ಥ್ಯ",
    ml: "ശേഷി",
    bn: "ধারণক্ষমতা",
    gu: "ક્ષમતા",
    as: "ক্ষমতা",
    mr: "क्षमता",
  },

  distance: {
    en: "Distance",
    hi: "दूरी",
    ta: "தூரம்",
    te: "దూరం",
    kn: "ದೂರ",
    ml: "ദൂരം",
    bn: "দূরত্ব",
    gu: "અંતર",
    as: "দূৰত্ব",
    mr: "अंतर",
  },

  available: {
    en: "Available",
    hi: "उपलब्ध",
    ta: "கிடைக்கக்கூடிய",
    te: "అందుబాటులో",
    kn: "ಲಭ್ಯವಿದೆ",
    ml: "ലഭ്യം",
    bn: "উপলব্ধ",
    gu: "ઉપલબ્ધ",
    as: "উপলব্ধ",
    mr: "उपलब्ध",
  },

  occupied: {
    en: "Occupied",
    hi: "कब्जा",
    ta: "ஆக்கிரமிக்கப்பட்ட",
    te: "ఆక్రమించబడింది",
    kn: "ಆಕ್ರಮಿಸಲಾಗಿದೆ",
    ml: "അധിവസിച്ചിരിക്കുന്നു",
    bn: "দখলীকৃত",
    gu: "કબજાવાળું",
    as: "দখলিত",
    mr: "व्यापलेले",
  },

  // Facility information
  facilities: {
    en: "Facilities",
    hi: "सुविधाएं",
    ta: "வசதிகள்",
    te: "సౌకర్యాలు",
    kn: "ಸೌಲಭ್ಯಗಳು",
    ml: "സൗകര്യങ്ങൾ",
    bn: "সুবিধা",
    gu: "સુવિધાઓ",
    as: "সুবিধা",
    mr: "सुविधा",
  },

  water: {
    en: "Water",
    hi: "पानी",
    ta: "நீர்",
    te: "నీరు",
    kn: "ನೀರು",
    ml: "വെള്ളം",
    bn: "পানি",
    gu: "પાણી",
    as: "পানী",
    mr: "पाणी",
  },

  food: {
    en: "Food",
    hi: "भोजन",
    ta: "உணவு",
    te: "ఆహారం",
    kn: "ಆಹಾರ",
    ml: "ഭക്ഷണം",
    bn: "খাবার",
    gu: "ખોરાક",
    as: "খাদ্য",
    mr: "अन्न",
  },

  medical: {
    en: "Medical",
    hi: "चिकित्सा",
    ta: "மருத்துவம்",
    te: "వైద్యం",
    kn: "ವೈದ್ಯಕೀಯ",
    ml: "വൈദ്യം",
    bn: "চিকিৎসা",
    gu: "તબીબી",
    as: "চিকিৎসা",
    mr: "वैद्यकीय",
  },

  other: {
    en: "Other",
    hi: "अन्य",
    ta: "மற்றவை",
    te: "ఇతర",
    kn: "ಇತರೆ",
    ml: "മറ്റുള്ളവ",
    bn: "অন্যান্য",
    gu: "અન્ય",
    as: "অন্যান্য",
    mr: "इतर",
  },

  // Navigation menu items  
  firstAid: {
    en: "First Aid",
    hi: "प्राथमिक चिकित्सा",
    ta: "முதலுதவி",
    te: "ప్రాథమిక చికిత్స",
    kn: "ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ",
    ml: "പ്രാഥമിക ചികിത്സ",
    bn: "প্রাথমিক চিকিৎসা",
    gu: "પ્રાથમિક સારવાર",
    as: "প্ৰাথমিক চিকিৎসা",
    mr: "प्राथमिक वैद्यकीय मदत",
  },

  actionGuide: {
    en: "Action Guide",
    hi: "कार्य मार्गदर्शिका",
    ta: "செயல் வழிகாட்டி",
    te: "చర్య మార్గదర్శి",
    kn: "ಕ್ರಿಯಾ ಮಾರ್ಗದರ್ಶಿ",
    ml: "പ്രവർത്തന ഗൈഡ്",
    bn: "কর্ম নির্দেশিকা",
    gu: "ક્રિયા માર્ગદર્શક",
    as: "কৰ্ম নিৰ্দেশিকা",
    mr: "कृती मार्गदर्शक",
  },

  // Form fields
  name: {
    en: "Name",
    hi: "नाम",
    ta: "பெயர்",
    te: "పేరు",
    kn: "ಹೆಸರು",
    ml: "പേര്",
    bn: "নাম",
    gu: "નામ",
    as: "নাম",
    mr: "नाव",
  },

  email: {
    en: "Email",
    hi: "ईमेल",
    ta: "மின்னஞ்சல்",
    te: "ఇమెయిల్",
    kn: "ಇಮೇಲ್",
    ml: "ഇമെയിൽ",
    bn: "ইমেইল",
    gu: "ઇમેઇલ",
    as: "ইমেইল",
    mr: "ईमेल",
  },

  password: {
    en: "Password",
    hi: "पासवर्ड",
    ta: "கடவுச்சொல்",
    te: "పాస్‌వర్డ్",
    kn: "ಪಾಸ್‌ವರ್ಡ್",
    ml: "പാസ്‌വേഡ്",
    bn: "পাসওয়ার্ড",
    gu: "પાસવર્ડ",
    as: "পাছৱৰ্ড",
    mr: "पासवर्ड",
  },

  phone: {
    en: "Phone",
    hi: "फोन",
    ta: "தொலைபேசி",
    te: "ఫోన్",
    kn: "ಫೋನ್",
    ml: "ഫോൺ",
    bn: "ফোন",
    gu: "ફોન",
    as: "ফোন",
    mr: "फोन",
  },

  address: {
    en: "Address",
    hi: "पता",
    ta: "முகவரி",
    te: "చిరునామా",
    kn: "ವಿಳಾಸ",
    ml: "വിലാസം",
    bn: "ঠিকানা",
    gu: "સરનામું",
    as: "ঠিকনা",
    mr: "पत्ता",
  },

  submit: {
    en: "Submit",
    hi: "जमा करें",
    ta: "சமர்பிக்கவும்",
    te: "సమర్పించండి",
    kn: "ಸಲ್ಲಿಸಿ",
    ml: "സമർപ്പിക്കുക",
    bn: "জমা দিন",
    gu: "સબમિટ",
    as: "দাখিল কৰক",
    mr: "सबमिट करा",
  },

  back: {
    en: "Back",
    hi: "वापस",
    ta: "திரும்பு",
    te: "వెనుకకు",
    kn: "ಹಿಂದೆ",
    ml: "തിരികെ",
    bn: "পিছনে",
    gu: "પાછળ",
    as: "পিছলৈ",
    mr: "मागे",
  },

  cancel: {
    en: "Cancel",
    hi: "रद्द करें",
    ta: "ரத்து செய்",
    te: "రద్దు చేయండి",
    kn: "ರದ್ದುಗೊಳಿಸಿ",
    ml: "റദ്ദാക്കുക",
    bn: "বাতিল",
    gu: "રદ કરો",
    as: "বাতিল কৰক",
    mr: "रद्द करा",
  },

  save: {
    en: "Save",
    hi: "सेव करें",
    ta: "சேமி",
    te: "సేవ్ చేయండి",
    kn: "ಉಳಿಸಿ",
    ml: "സേവ് ചെയ്യുക",
    bn: "সেভ",
    gu: "સેવ કરો",
    as: "ছেভ কৰক",
    mr: "सेव्ह करा",
  },

  edit: {
    en: "Edit",
    hi: "संपादित करें",
    ta: "திருத்து",
    te: "సవరించండి",
    kn: "ಸಂಪಾದಿಸಿ",
    ml: "എഡിറ്റ് ചെയ്യുക",
    bn: "এডিট",
    gu: "એડિટ કરો",
    as: "সম্পাদনা কৰক",
    mr: "संपादित करा",
  },

  delete: {
    en: "Delete",
    hi: "हटाएं",
    ta: "நீக்கு",
    te: "తొలగించండి",
    kn: "ಅಳಿಸಿ",
    ml: "ഇല്ലാതാക്കുക",
    bn: "ডিলিট",
    gu: "ડિલીટ કરો",
    as: "ডিলিট কৰক",
    mr: "डिलीट करा",
  },

  // Platform selection
  governmentPortal: {
    en: "Government Portal",
    hi: "सरकारी पोर्टल",
    ta: "அரசு போர்ட்டல்",
    te: "ప్రభుత్వ పోర్టల్",
    kn: "ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್",
    ml: "സർക്കാർ പോർട്ടൽ",
    bn: "সরকারি পোর্টাল",
    gu: "સરકારી પોર્ટલ",
    as: "চৰকাৰী পৰ্টেল",
    mr: "सरकारी पोर्टल",
  },

  rescueCenterPortal: {
    en: "Rescue Center Portal",
    hi: "रेस्क्यू सेंटर पोर्टल",
    ta: "மீட்பு மைய போர்ட்டல்",
    te: "రెస్క్యూ సెంటర్ పోర్టల్",
    kn: "ರಕ್ಷಣಾ ಕೇಂದ್ರ ಪೋರ್ಟಲ್",
    ml: "റെസ്ക്യൂ സെന്റർ പോർട്ടൽ",
    bn: "রেসকিউ সেন্টার পোর্টাল",
    gu: "રેસ્ક્યૂ સેન્ટર પોર્ટલ",
    as: "ৰেছকিউ কেন্দ্ৰ পৰ্টেল",
    mr: "रेस्क्यू सेंटर पोर्टल",
  },

  citizenPortal: {
    en: "Citizen Portal",
    hi: "नागरिक पोर्टल",
    ta: "குடிமகன் போர்ட்டல்",
    te: "పౌర పోర్టల్",
    kn: "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
    ml: "പൗര പോർട്ടൽ",
    bn: "নাগরিক পোর্টাল",
    gu: "નાગરિક પોર્ટલ",
    as: "নাগৰিক পৰ্টেল",
    mr: "नागरिक पोर्टल",
  },

  governmentPortalDescription: {
    en: "Monitor all rescue centers and their capacity/supply levels",
    hi: "सभी रेस्क्यू केंद्रों और उनकी क्षमता/आपूर्ति स्तरों की निगरानी करें",
    ta: "அனைத்து மீட்பு மையங்கள் மற்றும் அவற்றின் திறன்/வழங்கல் நிலைகளைக் கண்காணிக்கவும்",
    te: "అన్ని రెస్క్యూ కేంద్రాలు మరియు వాటి సామర్థ్యం/సరఫరా స్థాయిలను పర్యవేక్షించండి",
    kn: "ಎಲ್ಲಾ ರಕ್ಷಣಾ ಕೇಂದ್ರಗಳು ಮತ್ತು ಅವುಗಳ ಸಾಮರ್ಥ್ಯ/ಸರಬರಾಜು ಮಟ್ಟಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
    ml: "എല്ലാ റെസ്ക്യൂ സെന്ററുകളും അവയുടെ ശേഷി/വിതരണ നിലവാരവും നിരീക്ഷിക്കുക",
    bn: "সমস্ত রেসকিউ কেন্দ্র এবং তাদের ধারণক্ষমতা/সরবরাহ স্তর নিরীক্ষণ করুন",
    gu: "બધા રેસ્ક્યૂ સેન્ટરો અને તેમની ક્ષમતા/પુરવઠાના સ્તરોનું નિરીક્ષણ કરો",
    as: "সকলো ৰেছকিউ কেন্দ্ৰ আৰু সিহঁতৰ ক্ষমতা/যোগান স্তৰ নিৰীক্ষণ কৰক",
    mr: "सर्व रेस्क्यू केंद्रे आणि त्यांच्या क्षमता/पुरवठा पातळीचे निरीक्षण करा",
  },

  rescueCenterPortalDescription: {
    en: "Manage guest registrations and information",
    hi: "अतिथि पंजीकरण और जानकारी का प्रबंधन करें",
    ta: "விருந்தினர் பதிவுகள் மற்றும் தகவல்களை நிர்வகிக்கவும்",
    te: "అతిథి నమోదులు మరియు సమాచారాన్ని నిర్వహించండి",
    kn: "ಅತಿಥಿ ನೋಂದಣಿ ಮತ್ತು ಮಾಹಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ",
    ml: "അതിഥി രജിസ്ട്രേഷനുകളും വിവരങ്ങളും കൈകാര്യം ചെയ്യുക",
    bn: "অতিথি নিবন্ধন এবং তথ্য পরিচালনা করুন",
    gu: "મહેમાન નોંધણી અને માહિતીનું સંચાલન કરો",
    as: "অতিথি পঞ্জীয়ন আৰু তথ্য পৰিচালনা কৰক",
    mr: "पाहुण्यांची नोंदणी आणि माहितीचे व्यवस्थापन करा",
  },

  citizenPortalDescription: {
    en: "Find nearby shelter centers during emergencies",
    hi: "आपातकाल के दौरान आस-पास के आश्रय केंद्र खोजें",
    ta: "அவசரகால காலங்களில் அருகிலுள்ள தங்குமிட மையங்களைக் கண்டறியவும்",
    te: "అత్యవసర పరిస్థితుల్లో సమీపంలోని ఆశ్రయ కేంద్రాలను కనుగొనండి",
    kn: "ತುರ್ತುಸ್ಥಿತಿಯ ಸಮಯದಲ್ಲಿ ಹತ್ತಿರದ ಆಶ್ರಯ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ",
    ml: "അടിയന്തിര സമയങ്ങളിൽ സമീപത്തുള്ള അഭയകേന്ദ്രങ്ങൾ കണ്ടെത്തുക",
    bn: "জরুরি অবস্থায় কাছাকাছি আশ্রয় কেন্দ্র খুঁজুন",
    gu: "કટોકટીની દરમિયાન નજીકના આશ્રય કેન્દ્રો શોધો",
    as: "জৰুৰীকালীন সময়ত ওচৰৰ আশ্ৰয় কেন্দ্ৰসমূহ বিচাৰক",
    mr: "आपत्कालीन परिस्थितीत जवळची आश्रयस्थाने शोधा",
  },

  // GPS and Navigation translations
  gps: {
    en: "GPS",
    hi: "जीपीएस",
    ta: "ஜிபிஎஸ்",
    te: "జీపీఎస్",
    kn: "ಜಿಪಿಎಸ್",
    ml: "ജിപിএസ്",
    bn: "জিপিএস",
    gu: "જીપીએસ",
    as: "জিপিএছ",
    mr: "जीपीएस",
  },

  guideMe: {
    en: "Guide Me",
    hi: "मुझे गाइड करें",
    ta: "எனக்கு வழிகாட்டு",
    te: "నాకు మార్గదర్శకత్వం చేయండి",
    kn: "ನನಗೆ ಮಾರ್ಗದರ್ಶನ ಮಾಡಿ",
    ml: "എന്നെ വഴികാട്ടുക",
    bn: "আমাকে পথ দেখান",
    gu: "મને માર્ગદર્શન આપો",
    as: "মোক পথ দেখুৱাওক",
    mr: "मला मार्गदर्शन करा",
  },

  refresh: {
    en: "Refresh",
    hi: "रीफ्रेश",
    ta: "புதुप्पी",
    te: "రిఫ్రెష్",
    kn: "ರಿಫ್ರೆಶ್",
    ml: "പുതുക്കുക",
    bn: "রিফ্রেশ",
    gu: "રિફ્રેશ",
    as: "ৰিফ্ৰেছ",
    mr: "रिफ्रेश",
  },

  // Emergency alert related keys
  emergencyAlertSent: {
    en: "Emergency alert sent successfully",
    hi: "आपातकालीन अलर्ट सफलतापूर्वक भेजा गया",
    ta: "அவசர எச்சரிக்கை வெற்றிகரமாக அனुப்பப்பட்டது",
    te: "అత్యవసర హెచ్చరిక విజయవంతంగా పంపబడింది",
    kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ",
    ml: "അടിയന്തിര മുന്നറിയിപ്പ് വിജയകരമായി അയച്ചു",
    bn: "জরুরি সতর্কতা সফলভাবে পাঠানো হয়েছে",
    gu: "કટોકટી ચેતવણી સફળતાપૂર્વક મોકલાઈ",
    as: "জৰুৰীকালীন সতৰ্কবাণী সফলভাৱে পঠোৱা হৈছে",
    mr: "आपत्कालीन इशारा यशस्वीरित्या पाठवला",
  },

  emergencyAlertSentNoLocation: {
    en: "Emergency alert sent without location",
    hi: "बिना स्थान के आपातकालीन अलर्ट भेजा गया",
    ta: "இடம் இல்லாமல் அவசர எச்சரிக்கை அனுப்பப்பட்டது",
    te: "స్థానం లేకుండా అత్యవసర హెచ్చరిక పంపబడింది",
    kn: "ಸ್ಥಳವಿಲ್ಲದೆ ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    ml: "സ്ഥലം ഇല്ലാതെ അടിയന്തിര മുന്നറിയിപ്പ് അയച്ചു",
    bn: "অবস্থান ছাড়াই জরুরি সতর্কতা পাঠানো হয়েছে",
    gu: "સ્થાન વગર કટોકટી ચેતવણી મોકલવામાં આવી",
    as: "স্থান নোহোৱাকৈ জৰুৰীকালীন সতৰ্কবাণী পঠোৱা হৈছে",
    mr: "स्थान न देता आपत्कालीन इशारा पाठवला",
  },

  emergencyAlertFailed: {
    en: "Failed to send emergency alert",
    hi: "आपातकालीन अलर्ट भेजने में विफल",
    ta: "அவசர எச்சரிக்கை அனுப்புவதில் தோல்வি",
    te: "అత్యవసర హెచ్చరిక పంపడంలో విఫలమైంది",
    kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ",
    ml: "അടിയന്തിര മുന്നറിയിപ്പ് അയയ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു",
    bn: "জরুরি সতর্কতা পাঠাতে ব্যর্থ",
    gu: "કટોકટી ચેતવણી મોકલવામાં નિષ્ફળ",
    as: "জৰুৰীকালীন সতৰ্কবাণী পঠাবলৈ ব্যৰ্থ",
    mr: "आपत्कालीन इशारा पाठवण्यात अयशस्वी",
  },

  emergencyBuzzerActivated: {
    en: "Emergency buzzer activated",
    hi: "आपातकालীन बजर सक्रिय किया गया",
    ta: "அவசர buzzer செயல்படுத்தப்பட்டது",
    te: "అత్యవसর buzzer సక్రియം చేయబడింది",
    kn: "ತುರ್ತু buzzer ಸಕ್ರিযಗೊಳಿಸಲಾಗಿದೆ",
    ml: "അടിയന്തിര buzzer സജીవമাക്കി",
    bn: "জরুরি buzzer সক্রিয় করা হয়েছে",
    gu: "કટોકટী buzzer સક્રિય કર્યું",
    as: "জৰুৰীকালীন buzzer সক্ৰিয় কৰা হৈছে",
    mr: "आपत्कालীन buzzer सक्रिय केले",
  },

  emergencyBuzzerStopped: {
    en: "Emergency buzzer stopped",
    hi: "आपातकालীन बजर बंद किया गया",
    ta: "அவसर buzzer நிறুत्तप্পট্টদু",
    te: "అত্যवসর buzzer ఆপబడింది",
    kn: "তুর্তু buzzer নিল্লিসলাগিদে",
    ml: "അডিযন্তির buzzer নির্ত্তি",
    bn: "জরুরি buzzer বন্ধ করা হয়েছে",
    gu: "કટોકટী buzzer બंধ કর્યું",
    as: "জৰুৰীকালীন buzzer বন্ধ কৰা হৈছে",
    mr: "आपत्कालीन buzzer थांबवले",
  },

  buzzerPermissionError: {
    en: "Audio permission required for emergency buzzer",
    hi: "आपातकালীन बजर के लिए ऑडियো अनुमति आवश्यक",
    ta: "অবসর buzzer ক্কू audio அনুমতি তেবै",
    te: "అত্యবসর buzzer কোসం audio అনুমতি অবসরং",
    kn: "তুর্তু buzzer গাগি audio অনুমতি আবশ্યক",
    ml: "আডিযন্তির buzzer ন্ত audio অনুমতি আবশ্যমাণ্",
    bn: "জরুরি buzzer এর জন্য audio অনুমতি প্রয়োজন",
    gu: "કટોકટী buzzer માটে audio পরবানগী জরূরী",
    as: "জৰুৰীকালীন buzzer ৰ বাবে audio অনুমতি লাগে",
    mr: "आपत्कालীन buzzer साठी audio परवानगी आवश्यक",
  },

  stop: {
    en: "Stop",
    hi: "रोकें",
    ta: "নিறুত্তু",
    te: "ఆపు",
    kn: "নিল্লিসি",
    ml: "নির্ত্তুক",
    bn: "থামান",
    gu: "અટકાવો",
    as: "বন্ধ কৰক",
    mr: "थांबवा",
  },

  emergencyContactTitle: {
    en: "Emergency Contact",
    hi: "आपातकालীन संपर্ক",
    ta: "அবসর তোদর্পু",
    te: "అত্যবসর সংপ্রদিংপু",
    kn: "তুর্তু সংপর্ক",
    ml: "আডিযন্তির বন্ধং",
    bn: "জরুরি যোগাযোগ",
    gu: "કটોકટী સંপર્ક",
    as: "জৰুৰীকালীন যোগাযোগ",
    mr: "आपত्कालীन संपर्क",
  },

  emergencyPhone: {
    en: "Emergency Phone",
    hi: "आपातकालीन फोन",
    ta: "অবসর পোন্",
    te: "అత্যবসর পোন্",
    kn: "তুর্তু পোন্",
    ml: "আডিযন্তির পোন্",
    bn: "জরুরি ফোন",
    gu: "કટোકટী ફોન",
    as: "জৰুৰীকালীন ফোন",
    mr: "आपत्कालীन फोन",
  },
  // Override any corrupted translations with clean versions
  emergencyBuzzerStopped: {
    en: "Emergency buzzer stopped",
    hi: "आपातकालীन बजर बंद किया गया",
    ta: "அவசர buzzer நிறुத্तপ্পড়্ট্টটু",
    te: "అত্যবসর buzzer ఆপবডিন্দি",
    kn: "ತুর্তು buzzer નિল্লিসলাগিदে",
    ml: "അডিযন্তির buzzer নির্ত্তি",
    bn: "জরুরি buzzer বন্ধ করা হয়েছে",
    gu: "કટોકટી buzzer બંધ કર્યું",
    as: "জৰুৰীকালীন buzzer বন্ধ কৰা হৈছে",
    mr: "आपत्कालীन buzzer थांबवले",
  },
};

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  translate: (key: string) => string;
  dataSaverMode: boolean;
  toggleDataSaver: () => void;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider",
    );
  }
  return context;
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage if available, otherwise default to 'en'
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLanguage") || "en";
    }
    return "en";
  });
  const [dataSaverMode, setDataSaverMode] = useState(() => {
    // Initialize from localStorage if available, otherwise default to false
    if (typeof window !== "undefined") {
      return localStorage.getItem("dataSaverMode") === "true";
    }
    return false;
  });

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLanguage", language);
    }
  };

  const toggleDataSaver = () => {
    const newMode = !dataSaverMode;
    setDataSaverMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("dataSaverMode", newMode.toString());
    }
  };

  const translate = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key '${key}' not found`);
      return key; // Return the key if translation is not found
    }
    return translation[currentLanguage] || translation["en"] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        translate,
        dataSaverMode,
        toggleDataSaver,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};