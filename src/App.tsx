import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { LabDataProvider } from './context/LabDataContext'
import './App.css'

const AuditTrailPage = lazy(() =>
  import('./pages/AuditTrailPage').then((module) => ({ default: module.AuditTrailPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const EvidencePage = lazy(() =>
  import('./pages/EvidencePage').then((module) => ({ default: module.EvidencePage })),
)
const InstrumentDetailPage = lazy(() =>
  import('./pages/InstrumentDetailPage').then((module) => ({ default: module.InstrumentDetailPage })),
)
const InstrumentsPage = lazy(() =>
  import('./pages/InstrumentsPage').then((module) => ({ default: module.InstrumentsPage })),
)
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const ReportPreviewPage = lazy(() =>
  import('./pages/ReportPreviewPage').then((module) => ({ default: module.ReportPreviewPage })),
)
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const TestDetailPage = lazy(() =>
  import('./pages/TestDetailPage').then((module) => ({ default: module.TestDetailPage })),
)
const TestsPage = lazy(() => import('./pages/TestsPage').then((module) => ({ default: module.TestsPage })))

function App() {
  return (
    <AuthProvider>
      <LabDataProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="loading-screen">Loading MetriWeigh...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="instruments" element={<InstrumentsPage />} />
                  <Route path="instruments/:id" element={<InstrumentDetailPage />} />
                  <Route path="tests" element={<TestsPage />} />
                  <Route path="tests/:id" element={<TestDetailPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="reports/:id" element={<ReportPreviewPage />} />
                  <Route path="evidence" element={<EvidencePage />} />
                  <Route path="audit" element={<AuditTrailPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LabDataProvider>
    </AuthProvider>
  )
}

export default App
