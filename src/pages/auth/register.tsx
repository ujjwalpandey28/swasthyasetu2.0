import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HeartPulse,
  CreditCard,
  QrCode,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useHospitalDB } from "@/lib/database/db";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { LanguageSwitch } from "@/components/shared/LanguageSwitch";
import { useLanguage } from "@/components/utils/LanguageContext";
import { UserRole } from "@/dto/constants/UserRole";
import { RiskLevel } from "@/dto/constants/RiskLevel";
import type { Patient } from "@/dto/patient/Patient";

export function RegisterPage() {
  const [method, setMethod] = useState<"SELECT" | "AYUSHMAN" | "ABHA" | "NORMAL">("SELECT");
  const [loading, setLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  // Ayushman Form Fields
  const [pmjayNumber, setPmjayNumber] = useState("");
  const [rationCardNumber, setRationCardNumber] = useState("");

  // ABHA Form Fields
  const [abhaAddress, setAbhaAddress] = useState("");
  const [abhaConsent, setAbhaConsent] = useState(true);

  // Normal Form Fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Female");
  const [dob, setDob] = useState("1994-05-15");
  const [phone, setPhone] = useState("+91 ");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("Rampur");
  const [stateName, setStateName] = useState("Uttar Pradesh");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [allergies, setAllergies] = useState("");

  const registerPatient = useHospitalDB((s) => s.registerPatient);
  const loginUser = useAuthStore((s) => s.loginUser);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAyushmanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newP = registerPatient({
        name: fullName || "Ganga Ram",
        age: Number(age) || 48,
        gender: "Male",
        dob: "1978-06-10",
        village: village || "Shivpur",
        district: district || "Rampur",
        state: stateName || "Uttar Pradesh",
        bloodGroup: "B+",
        phone: phone || "+91 98765 11223",
        emergencyContact: {
          name: "Laxmi Devi",
          relationship: "Spouse",
          phone: "+91 98765 11224",
        },
        riskLevel: RiskLevel.LOW,
        allergies: [],
        registeredVia: "AYUSHMAN",
        ayushmanCardNo: pmjayNumber || "PMJAY-UP-8821-4401",
        homeFacilityId: "phc-1",
      });
      setRegisteredPatient(newP);
      loginUser({
        id: `u-${newP.swasthyaId}`,
        name: newP.name,
        role: UserRole.PATIENT,
        facilityId: "phc-1",
      });
      setLoading(false);
    }, 600);
  };

  const handleAbhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newP = registerPatient({
        name: fullName || "Anand Verma",
        age: Number(age) || 35,
        gender: "Male",
        dob: "1991-03-22",
        village: village || "Kosi Kalan",
        district: district || "Kosi",
        state: stateName || "Uttar Pradesh",
        bloodGroup: "A+",
        phone: phone || "+91 98765 77889",
        emergencyContact: {
          name: "Sunil Verma",
          relationship: "Brother",
          phone: "+91 98765 77880",
        },
        riskLevel: RiskLevel.LOW,
        allergies: [],
        registeredVia: "ABHA",
        abhaId: abhaAddress || "anand.verma@abdm",
        homeFacilityId: "chc-1",
      });
      setRegisteredPatient(newP);
      loginUser({
        id: `u-${newP.swasthyaId}`,
        name: newP.name,
        role: UserRole.PATIENT,
        facilityId: "chc-1",
      });
      setLoading(false);
    }, 600);
  };

  const handleNormalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newP = registerPatient({
        name: fullName || "Pooja Kumari",
        age: Number(age) || 29,
        gender,
        dob,
        village: village || "Dhanwantri Nagar",
        district: district || "Rampur",
        state: stateName || "Uttar Pradesh",
        bloodGroup,
        phone,
        emergencyContact: emergencyName
          ? {
              name: emergencyName,
              relationship: "Family Member",
              phone: emergencyPhone || phone,
            }
          : undefined,
        riskLevel: RiskLevel.LOW,
        allergies: allergies ? allergies.split(",").map((a) => a.trim()) : [],
        registeredVia: "NORMAL",
        homeFacilityId: "phc-1",
      });
      setRegisteredPatient(newP);
      loginUser({
        id: `u-${newP.swasthyaId}`,
        name: newP.name,
        role: UserRole.PATIENT,
        facilityId: "phc-1",
      });
      setLoading(false);
    }, 600);
  };

  // Success Confirmation View
  if (registeredPatient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
        <Card className="w-full max-w-lg border-2 border-emerald-500 bg-surface shadow-2xl p-6 text-center animate-in zoom-in-95">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-fg">Registration Successful!</h2>
          <p className="text-xs text-muted mt-1">Your Permanent SwasthyaSetu Health Identity has been generated.</p>

          <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-brand-200/70 pb-2">
              <span className="text-xs font-semibold text-muted">Permanent Patient ID</span>
              <span className="font-mono text-base font-bold text-brand-700">{registeredPatient.swasthyaId}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-muted">Name:</span>
                <p className="font-semibold text-fg">{registeredPatient.name}</p>
              </div>
              <div>
                <span className="text-muted">Registered Via:</span>
                <p className="font-semibold text-fg">{registeredPatient.registeredVia}</p>
              </div>
              <div>
                <span className="text-muted">Village / District:</span>
                <p className="font-medium text-fg">{registeredPatient.village}, {registeredPatient.district}</p>
              </div>
              <div>
                <span className="text-muted">Blood Group:</span>
                <p className="font-medium text-fg">{registeredPatient.bloodGroup}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button onClick={() => navigate("/patient")} className="w-full">
              Open My Health Dashboard &amp; Digital Health Card <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/patient/appointments")} className="w-full">
              Book First Hospital Appointment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <Card className="w-full max-w-xl shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md">
            <HeartPulse className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold text-fg">{t("app_name")}</h1>
          <p className="text-xs text-muted">Rural &amp; Semi-Urban Digital Health Identification</p>
          <div className="mt-2">
            <LanguageSwitch />
          </div>
        </div>

        {/* STEP 1: METHOD SELECTION */}
        {method === "SELECT" && (
          <div className="space-y-4">
            <div className="text-center">
              <CardTitle>Create Patient Health Account</CardTitle>
              <CardDescription className="text-xs">
                Select your preferred registration method to generate your permanent Swasthya ID:
              </CardDescription>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Ayushman Card */}
              <button
                type="button"
                onClick={() => setMethod("AYUSHMAN")}
                className="w-full flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 text-left transition hover:border-brand-600 hover:bg-brand-50 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <CreditCard className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-fg">Option 1 — Ayushman Bharat (PM-JAY)</p>
                    <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                      Govt Card
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Link PM-JAY card or Ration card to auto-fetch demographic details &amp; subsidies.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted" />
              </button>

              {/* Option 2: ABHA */}
              <button
                type="button"
                onClick={() => setMethod("ABHA")}
                className="w-full flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 text-left transition hover:border-brand-600 hover:bg-brand-50 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                  <QrCode className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-fg">Option 2 — ABHA Digital Health Identity</p>
                    <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-800">
                      ABDM
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Link your Ayushman Bharat Health Account (ABHA Address) with consent verification.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted" />
              </button>

              {/* Option 3: Normal Rural Form */}
              <button
                type="button"
                onClick={() => setMethod("NORMAL")}
                className="w-full flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 text-left transition hover:border-brand-600 hover:bg-brand-50 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                  <UserCheck className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-fg">Option 3 — Simple Form Registration</p>
                    <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-800">
                      Direct
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Quick simple form designed for rural citizens with Village, District &amp; Emergency Contact.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-muted">
              Already have a SwasthyaSetu account?{" "}
              <Link to="/login" className="font-bold text-brand-700 hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: OPTION 1 — AYUSHMAN BHARAT FORM */}
        {method === "AYUSHMAN" && (
          <form onSubmit={handleAyushmanSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setMethod("SELECT")}
              className="flex items-center gap-1 text-xs text-muted hover:text-fg font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to methods
            </button>

            <div className="border-b border-border pb-2">
              <h2 className="text-base font-bold text-fg">Link Ayushman Card (PM-JAY)</h2>
              <p className="text-xs text-muted">Enter card details to verify and create your profile</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">PM-JAY ID / Card Number</label>
              <Input
                placeholder="e.g. PMJAY-UP-9842-1102"
                value={pmjayNumber}
                onChange={(e) => setPmjayNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Ration Card / Family ID (Optional)</label>
              <Input
                placeholder="e.g. RC-2024-8849102"
                value={rationCardNumber}
                onChange={(e) => setRationCardNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Full Name (As on Card)</label>
                <Input
                  placeholder="e.g. Ganga Ram"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Mobile Number</label>
                <Input
                  placeholder="+91 98765 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                PM-JAY card integration abstraction verifies eligible family members and automatically links hospital cashless benefits.
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying & Generating ID…" : "Verify Ayushman Card & Register"}
            </Button>
          </form>
        )}

        {/* STEP 3: OPTION 2 — ABHA IDENTITY FORM */}
        {method === "ABHA" && (
          <form onSubmit={handleAbhaSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setMethod("SELECT")}
              className="flex items-center gap-1 text-xs text-muted hover:text-fg font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to methods
            </button>

            <div className="border-b border-border pb-2">
              <h2 className="text-base font-bold text-fg">Link ABHA Digital Health Account</h2>
              <p className="text-xs text-muted">Connect your Ayushman Bharat Digital Mission (ABDM) profile</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">ABHA Address / Number</label>
              <Input
                placeholder="e.g. anand.verma@abdm or 91-8849-1029-3384"
                value={abhaAddress}
                onChange={(e) => setAbhaAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Full Name</label>
                <Input
                  placeholder="e.g. Anand Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Mobile Number</label>
                <Input
                  placeholder="+91 98765 77889"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
              <input
                type="checkbox"
                id="abhaConsent"
                checked={abhaConsent}
                onChange={(e) => setAbhaConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-brand-700"
              />
              <label htmlFor="abhaConsent" className="leading-tight">
                I give consent to fetch permitted ABDM profile information to generate my SwasthyaSetu Patient ID in accordance with NDHM standards.
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !abhaConsent}>
              {loading ? "Authenticating ABHA…" : "Authenticate ABHA & Create Profile"}
            </Button>
          </form>
        )}

        {/* STEP 4: OPTION 3 — NORMAL RURAL REGISTRATION */}
        {method === "NORMAL" && (
          <form onSubmit={handleNormalSubmit} className="space-y-3">
            <button
              type="button"
              onClick={() => setMethod("SELECT")}
              className="flex items-center gap-1 text-xs text-muted hover:text-fg font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to methods
            </button>

            <div className="border-b border-border pb-2">
              <h2 className="text-base font-bold text-fg">Rural Citizen Registration</h2>
              <p className="text-xs text-muted">Enter essential demographic details for your Health ID</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">Full Name *</label>
              <Input
                placeholder="e.g. Pooja Kumari"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Age *</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Gender *</label>
                <Select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Blood Group</label>
                <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Mobile Number</label>
                <Input
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Date of Birth</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Village *</label>
                <Input
                  placeholder="e.g. Dhanwantri Nagar"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">District *</label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">State</label>
                <Input
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Emergency Contact Name</label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-fg">Emergency Contact Phone</label>
                <Input
                  placeholder="+91 98765 11111"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-fg">
                Known Drug Allergies <span className="text-muted">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. Penicillin, Sulfa drugs"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Generating Patient Identity…" : "Complete Registration & Get Swasthya ID"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}