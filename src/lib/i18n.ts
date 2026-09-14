import type { Language } from "@/dto/constants/Language";

export type TranslationKey =
  | "app_name"
  | "tagline"
  | "login"
  | "register"
  | "logout"
  | "dashboard"
  | "my_qr"
  | "health_card"
  | "bills"
  | "find_facility"
  | "appointments"
  | "health_records"
  | "medicine_availability"
  | "diagnostics"
  | "referral_status"
  | "teleconsultation"
  | "emergency"
  | "patients"
  | "triage"
  | "high_risk"
  | "follow_ups"
  | "referrals"
  | "offline_sync"
  | "queue"
  | "workload"
  | "analytics"
  | "audit_logs"
  | "search"
  | "welcome"
  | "logout_confirm"
  | "view_record"
  | "begin_consultation"
  | "doctor_consultation"
  | "hospital_reception"
  | "pharmacy_dispense"
  | "lab_diagnostics"
  | "security_desk"
  | "super_admin";

const en: Record<TranslationKey, string> = {
  app_name: "SwasthyaSetu",
  tagline: "Scan. Verify. Continue Care.",
  login: "Login",
  register: "Register",
  logout: "Logout",
  dashboard: "Dashboard",
  my_qr: "My Visit QR",
  health_card: "Digital Health Card",
  bills: "My Bills & Receipts",
  find_facility: "Find Facility",
  appointments: "Appointments",
  health_records: "Health Records",
  medicine_availability: "Medicine Availability",
  diagnostics: "Diagnostics & Lab Reports",
  referral_status: "Referral Status",
  teleconsultation: "Teleconsultation",
  emergency: "Emergency",
  patients: "Patients",
  triage: "Triage",
  high_risk: "High Risk",
  follow_ups: "Follow-ups",
  referrals: "Referrals",
  offline_sync: "Offline Sync",
  queue: "Patient Queue",
  workload: "Facility Workload",
  analytics: "Transparency & Analytics",
  audit_logs: "Audit Ledger",
  search: "Search",
  welcome: "Welcome",
  logout_confirm: "Are you sure you want to logout?",
  view_record: "View Record",
  begin_consultation: "Begin Consultation",
  doctor_consultation: "Doctor Consultation",
  hospital_reception: "Reception & Check-In",
  pharmacy_dispense: "Pharmacy Dispensing",
  lab_diagnostics: "Pathology Lab Queue",
  security_desk: "Security Checkpoint",
  super_admin: "National Governance",
};

const hi: Record<TranslationKey, string> = {
  app_name: "स्वास्थ्यसेतु",
  tagline: "स्कैन करें। पुष्टि करें। उपचार जारी रखें।",
  login: "लॉग इन",
  register: "पंजीकरण",
  logout: "लॉग आउट",
  dashboard: "डैशबोर्ड",
  my_qr: "मेरा विज़िट क्यूआर",
  health_card: "डिजिटल स्वास्थ्य कार्ड",
  bills: "मेरे बिल व रसीदें",
  find_facility: "सुविधा खोजें",
  appointments: "अपॉइंटमेंट",
  health_records: "स्वास्थ्य रिकॉर्ड",
  medicine_availability: "दवा उपलब्धता",
  diagnostics: "निदान व लैब रिपोर्ट",
  referral_status: "रेफरल स्थिति",
  teleconsultation: "टेलीकंसल्टेशन",
  emergency: "आपातकाल",
  patients: "मरीज़",
  triage: "त्राइएज",
  high_risk: "उच्च जोखिम",
  follow_ups: "फॉलो-अप",
  referrals: "रेफरल",
  offline_sync: "ऑफ़लाइन सिंक",
  queue: "मरीज़ कतार",
  workload: "सुविधा कार्यभार",
  analytics: "पारदर्शिता व विश्लेषण",
  audit_logs: "ऑडिट बहीखाता",
  search: "खोजें",
  welcome: "स्वागत है",
  logout_confirm: "क्या आप लॉग आउट करना चाहते हैं?",
  view_record: "रिकॉर्ड देखें",
  begin_consultation: "परामर्श शुरू करें",
  doctor_consultation: "डॉक्टर परामर्श",
  hospital_reception: "रिसेप्शन व चेक-इन",
  pharmacy_dispense: "दवा वितरण केंद्र",
  lab_diagnostics: "पैथोलॉजी जांच कतार",
  security_desk: "सुरक्षा चेकपॉइंट",
  super_admin: "राष्ट्रीय निगरानी",
};

const dict: Record<Language, Record<TranslationKey, string>> = { en, hi };

export function translate(lang: Language, key: TranslationKey): string {
  return dict[lang][key] || key;
}

export { dict };