import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HierarchyProvider } from './contexts/HierarchyContext';
import { PlatformProvider } from './contexts/PlatformContext'; // ⬅️ AJOUT
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingGuard from './components/OnboardingGuard';
import RoleBasedPage from './components/RoleBasedPage';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';

// ─── Pages publiques ───
import Login from './pages/common/Login';
import EnrollPage from './pages/public/EnrollPage';
import LandingPage from './pages/public/LandingPage';

// ─── Pages communes ───
import SetupWizard from './pages/common/SetupWizard';
import Dashboard from './pages/common/Dashboard';
import Notifications from './pages/common/Notifications';
import Profile from './pages/common/Profile';

// ─── Quiz / Examens ───
import QuizRunner from './pages/common/QuizRunner';
import QuizDetail from './pages/common/QuizDetail';
import ExamBuilder from './pages/teacher/ExamBuilder';
import ExamRunner from './pages/common/ExamRunner';
import StudentExams from './pages/student/StudentExams';

// ─── Cours ───
import CoursesAdmin from './pages/admin/CoursesAdmin';
import TeacherCourses from './pages/teacher/TeacherCourses';
import StudentCourses from './pages/student/StudentCourses';
import CourseDetailAdmin from './pages/admin/CourseDetailAdmin';
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import StudentCourseDetail from './pages/student/StudentCourseDetail';

// ─── Devoirs ───
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import StudentAssignments from './pages/student/StudentAssignments';
import AssignmentDetail from './pages/common/AssignmentDetail';

// ─── Agenda ───
import CalendarAdmin from './pages/admin/CalendarAdmin';
import TeacherCalendar from './pages/teacher/TeacherCalendar';
import StudentCalendar from './pages/student/StudentCalendar';

// ─── Notes ───
import TeacherGrades from './pages/teacher/TeacherGrades';
import StudentGrades from './pages/student/StudentGrades';

// ─── Admin ───
import Institution from './pages/admin/Institution';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import TeachingUnits from './pages/admin/TeachingUnits';
import AcademicYears from './pages/admin/AcademicYears';
import Enrollments from './pages/admin/Enrollments';
import EnrollmentDetail from './pages/admin/EnrollmentDetail';
import ClassesList from './pages/admin/ClassesList';
import ClassDetail from './pages/admin/ClassDetail';

// ─── Finance Admin ───
import FinanceDashboard from './pages/admin/FinanceDashboard';
import FeeTypes from './pages/admin/FeeTypes';
import Fees from './pages/admin/Fees';
import Invoices from './pages/admin/Invoices';
import InvoiceDetail from './pages/admin/InvoiceDetail';
import Payments from './pages/admin/Payments';

// ─── Finance Étudiant ───
import MyInvoices from './pages/student/MyInvoices';
import MobileMoneyPayment from './pages/student/MobileMoneyPayment';

function App() {
  return (
    <BrowserRouter>
      <PlatformProvider> {/* ⬅️ AJOUTÉ EN PREMIER */}
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <HierarchyProvider>
                  <OnboardingGuard>
                    <Routes>
                      {/* ═══ ROUTES PUBLIQUES (sans Layout) ═══ */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/enroll" element={<EnrollPage />} />

                      {/* ═══ WIZARD DE CONFIGURATION ═══ */}
                      <Route
                        path="/setup"
                        element={
                          <ProtectedRoute>
                            <SetupWizard />
                          </ProtectedRoute>
                        }
                      />

                      {/* ═══ QUIZ RUNNER (plein écran) ═══ */}
                      <Route
                        path="/quiz/:id"
                        element={
                          <ProtectedRoute>
                            <QuizDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/:courseId/exams/create"
                        element={
                          <ProtectedRoute requiredRole="TEACHER">
                            <ExamBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/quiz/:id/runner"
                        element={
                          <ProtectedRoute>
                            <QuizRunner />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exam/:id/runner"
                        element={
                          <ProtectedRoute>
                            <ExamRunner />
                          </ProtectedRoute>
                        }
                      />

                      {/* ═══ ROUTES AVEC LAYOUT (Sidebar + Header) ═══ */}
                      <Route
                        element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profile" element={<Profile />} />

                        <Route 
                          path="/exams" 
                          element={
                            <ProtectedRoute requiredRole="STUDENT">
                              <StudentExams />
                            </ProtectedRoute>
                          } 
                        />

                        {/* ─── Cours (Role-based) ─── */}
                        <Route
                          path="/courses"
                          element={
                            <RoleBasedPage
                              admin={<CoursesAdmin />}
                              teacher={<TeacherCourses />}
                              student={<StudentCourses />}
                            />
                          }
                        />
                        <Route
                          path="/courses/:id"
                          element={
                            <RoleBasedPage
                              admin={<CourseDetailAdmin />}
                              teacher={<TeacherCourseDetail />}
                              student={<StudentCourseDetail />}
                            />
                          }
                        />

                        {/* ─── Agenda ─── */}
                        <Route
                          path="/calendar"
                          element={
                            <RoleBasedPage
                              admin={<CalendarAdmin />}
                              teacher={<TeacherCalendar />}
                              student={<StudentCalendar />}
                            />
                          }
                        />

                        {/* ─── Devoirs ─── */}
                        <Route
                          path="/assignments"
                          element={
                            <RoleBasedPage
                              admin={<TeacherAssignments />}
                              teacher={<TeacherAssignments />}
                              student={<StudentAssignments />}
                            />
                          }
                        />
                        <Route path="/assignments/:id" element={<AssignmentDetail />} />

                        {/* ─── Notes ─── */}
                        <Route path="/grades" element={<TeacherGrades />} />
                        <Route path="/my-grades" element={<StudentGrades />} />

                        {/* ─── ADMIN UNIQUEMENT ─── */}
                        <Route
                          path="/academic-years"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <AcademicYears />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/institution"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Institution />
                            </ProtectedRoute>
                          }
                        />
                        <Route 
                          path="/admin/classes" 
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <ClassesList />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/admin/classes/:id" 
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <ClassDetail />
                            </ProtectedRoute>
                          } 
                        />
                        <Route
                          path="/teaching-units"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <TeachingUnits />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/users"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Users />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Settings />
                            </ProtectedRoute>
                          }
                        />

                        {/* ─── Enrollments ─── */}
                        <Route
                          path="/enrollments"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Enrollments />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/enrollments/:id"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <EnrollmentDetail />
                            </ProtectedRoute>
                          }
                        />

                        {/* ─── FINANCE ─── */}
                        <Route
                          path="/finance"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <FinanceDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finance/fee-types"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <FeeTypes />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finance/fees"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Fees />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finance/invoices"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Invoices />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finance/invoices/:id"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <InvoiceDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finance/payments"
                          element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <Payments />
                            </ProtectedRoute>
                          }
                        />

                        {/* ─── FINANCE ÉTUDIANT ─── */}
                        <Route path="/my-invoices" element={<MyInvoices />} />
                        <Route path="/my-payments" element={<MobileMoneyPayment />} />
                      </Route>

                      {/* ═══ REDIRECTIONS ═══ */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </OnboardingGuard>
                </HierarchyProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </PlatformProvider>
    </BrowserRouter>
  );
}

export default App;