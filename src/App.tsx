import { Redirect, Route, Switch } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/features/auth/AuthContext';
import { PrivateRoute } from './app/features/auth/PrivateRoute';
import { LoginPage } from './app/features/auth/LoginPage';
import { RegisterPage } from './app/features/auth/RegisterPage';
import { ResetPasswordPage } from './app/features/auth/ResetPasswordPage';
import { HomePage } from './app/features/home/HomePage';
import { CalendarPage } from './app/features/calendar/CalendarPage';
import { RecurringClassesPage } from './app/features/calendar/RecurringClassesPage';
import { AvailabilitySettings } from './app/features/calendar/AvailabilitySettings';
import { ClientListPage } from './app/features/clients/ClientListPage';
import { PaymentSettingsPage } from './app/features/payments/PaymentSettingsPage';
import { PublicPaymentPage } from './app/features/payments/PublicPaymentPage';
import { OnboardingPage } from './app/features/onboarding/OnboardingPage';
import { SelectSportPage } from './app/features/onboarding/SelectSportPage';
import { AcademiesPage } from './app/features/academies/AcademiesPage';
import { ExercisesPage } from './app/features/academies/ExercisesPage';
import { CoachAssignmentsPage } from './app/features/academies/CoachAssignmentsPage';
import { AcademyDetailPage } from './app/features/academies/AcademyDetailPage';
import { Toaster } from '@/components/ui/sonner';

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/reset-password" component={ResetPasswordPage} />
        <Route exact path="/payment/:token" component={PublicPaymentPage} />

        {/* Onboarding Route (requires auth but not onboarding completion) */}
        <PrivateRoute exact path="/onboarding" component={OnboardingPage} />
        <PrivateRoute exact path="/select-sport" component={SelectSportPage} />

        {/* Private Routes */}
        <PrivateRoute exact path="/home" component={HomePage} />
        <PrivateRoute exact path="/calendar" component={CalendarPage} />
        <PrivateRoute exact path="/recurring-classes" component={RecurringClassesPage} />
        <PrivateRoute exact path="/availability" component={AvailabilitySettings} />
        <PrivateRoute exact path="/clients" component={ClientListPage} />
        <PrivateRoute exact path="/payment-settings" component={PaymentSettingsPage} />
        
        {/* Academies/Grupos Routes */}
        <PrivateRoute exact path="/academies" component={AcademiesPage} />
        <PrivateRoute exact path="/academies/:academyId" component={AcademyDetailPage} />
        <PrivateRoute exact path="/exercises" component={ExercisesPage} />
        <PrivateRoute exact path="/coach-assignments" component={CoachAssignmentsPage} />

        {/* Default Redirect - go to login */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </Switch>
      
      <Toaster position="top-center" />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
