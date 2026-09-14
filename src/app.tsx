import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/utils/AuthContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";

// Patient Portal
import { PatientDashboard } from "@/pages/patient/dashboard";
import { MyQRPage } from "@/pages/patient/my-qr";
import { HealthCardPage } from "@/pages/patient/health-card";
import { AppointmentsPage } from "@/pages/patient/appointments";
import { PatientBillsPage } from "@/pages/patient/bills";
import { FindFacilityPage } from "@/pages/patient/find-facility";
import { HealthRecordsPage } from "@/pages/patient/health-records";
import { MedicineAvailabilityPage } from "@/pages/patient/medicine-availability";
import { DiagnosticsPage } from "@/pages/patient/diagnostics";
import { ReferralStatusPage } from "@/pages/patient/referral-status";
import { TeleconsultationPage } from "@/pages/patient/teleconsultation";
import { EmergencyPage } from "@/pages/patient/emergency";

// Doctor Portal
import { DoctorDashboard } from "@/pages/doctor/dashboard";
import { DoctorConsultationPage } from "@/pages/doctor/consultation";

// Hospital Staff / Reception Portal
import { HospitalDashboard } from "@/pages/hospital/dashboard";

// Lab / Diagnostics Portal
import { LabDashboard } from "@/pages/lab/dashboard";

// Pharmacy Portal
import { PharmacyDashboard } from "@/pages/pharmacy/dashboard";

// Healthcare Worker Portal
import { WorkerDashboard } from "@/pages/healthcare_worker/dashboard";
import { WorkerPatientsPage } from "@/pages/healthcare_worker/patients";
import { TriagePage } from "@/pages/healthcare_worker/triage";
import { WorkerConsultationPage } from "@/pages/healthcare_worker/consultation";
import { HighRiskPage } from "@/pages/healthcare_worker/high-risk";
import { FollowUpsPage } from "@/pages/healthcare_worker/follow-ups";
import { WorkerReferralsPage } from "@/pages/healthcare_worker/referrals";
import { OfflineSyncPage } from "@/pages/healthcare_worker/offline-sync";

// Admin Portal
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AuditLogsPage } from "@/pages/admin/audit-logs";
import { QueuePage } from "@/pages/admin/queue";
import { WorkloadPage } from "@/pages/admin/workload";
import { AdminMedicinesPage } from "@/pages/admin/medicines";
import { AdminReferralsPage } from "@/pages/admin/referrals";
import { AdminHighRiskPage } from "@/pages/admin/high-risk";
import { AdminDiagnosticsPage } from "@/pages/admin/diagnostics";
import { AnalyticsPage } from "@/pages/admin/analytics";

// Security Portal
import { SecurityDashboard } from "@/pages/security/dashboard";

// Super Admin Portal
import { SuperAdminDashboard } from "@/pages/super_admin/dashboard";

import { NotFoundPage } from "@/pages/utils/NotFound";
import { UserRole } from "@/dto/constants/UserRole";

import { useAuthStore } from "@/stores/authStore";
import { roleRoutes } from "@/components/shared/DemoSwitcher";

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.role && roleRoutes[user.role]) {
    return <Navigate to={roleRoutes[user.role]} replace />;
  }
  return <Navigate to="/login" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 1. Patient Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.PATIENT,
                  UserRole.DOCTOR,
                  UserRole.HEALTHCARE_WORKER,
                  UserRole.HOSPITAL_STAFF,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.LAB,
                  UserRole.PHARMACY,
                  UserRole.SECURITY,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/my-qr" element={<MyQRPage />} />
            <Route path="/patient/health-card" element={<HealthCardPage />} />
            <Route path="/patient/appointments" element={<AppointmentsPage />} />
            <Route path="/patient/bills" element={<PatientBillsPage />} />
            <Route path="/patient/find-facility" element={<FindFacilityPage />} />
            <Route path="/patient/health-records" element={<HealthRecordsPage />} />
            <Route path="/patient/medicine-availability" element={<MedicineAvailabilityPage />} />
            <Route path="/patient/diagnostics" element={<DiagnosticsPage />} />
            <Route path="/patient/referral-status" element={<ReferralStatusPage />} />
            <Route path="/patient/teleconsultation" element={<TeleconsultationPage />} />
            <Route path="/patient/emergency" element={<EmergencyPage />} />
          </Route>

          {/* 2. Doctor Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.DOCTOR,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.HEALTHCARE_WORKER,
                  UserRole.HOSPITAL_STAFF,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/consultation" element={<DoctorConsultationPage />} />
          </Route>

          {/* 3. Hospital Staff / Reception Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.HOSPITAL_STAFF,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.HEALTHCARE_WORKER,
                  UserRole.DOCTOR,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/hospital" element={<HospitalDashboard />} />
          </Route>

          {/* 4. Pathology Lab Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.LAB,
                  UserRole.DOCTOR,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.HOSPITAL_STAFF,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/lab" element={<LabDashboard />} />
          </Route>

          {/* 5. Pharmacy Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.PHARMACY,
                  UserRole.DOCTOR,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.HOSPITAL_STAFF,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
          </Route>

          {/* 6. Healthcare Worker Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.HEALTHCARE_WORKER,
                  UserRole.DOCTOR,
                  UserRole.HOSPITAL_STAFF,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/worker" element={<WorkerDashboard />} />
            <Route path="/worker/patients" element={<WorkerPatientsPage />} />
            <Route path="/worker/triage" element={<TriagePage />} />
            <Route path="/worker/consultation" element={<WorkerConsultationPage />} />
            <Route path="/worker/high-risk" element={<HighRiskPage />} />
            <Route path="/worker/follow-ups" element={<FollowUpsPage />} />
            <Route path="/worker/referrals" element={<WorkerReferralsPage />} />
            <Route path="/worker/offline-sync" element={<OfflineSyncPage />} />
          </Route>

          {/* 7. Hospital Admin Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.DOCTOR,
                  UserRole.HOSPITAL_STAFF,
                  UserRole.LAB,
                  UserRole.PHARMACY,
                  UserRole.HEALTHCARE_WORKER,
                  UserRole.SECURITY,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/queue" element={<QueuePage />} />
            <Route path="/admin/workload" element={<WorkloadPage />} />
            <Route path="/admin/medicines" element={<AdminMedicinesPage />} />
            <Route path="/admin/referrals" element={<AdminReferralsPage />} />
            <Route path="/admin/high-risk" element={<AdminHighRiskPage />} />
            <Route path="/admin/diagnostics" element={<AdminDiagnosticsPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* 8. Security Portal */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  UserRole.SECURITY,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                  UserRole.HOSPITAL_STAFF,
                ]}
              >
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/security" element={<SecurityDashboard />} />
          </Route>

          {/* 9. Super Admin Portal */}
          <Route
            element={
              <ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}