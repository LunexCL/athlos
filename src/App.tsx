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
import { OnboardingPage } from './app/features/onboarding/OnboardingPage';
import { Toaster } from '@/components/ui/sonner';

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/reset-password" component={ResetPasswordPage} />

        {/* Onboarding Route (requires auth but not onboarding completion) */}
        <PrivateRoute exact path="/onboarding" component={OnboardingPage} />

        {/* Private Routes */}
        <PrivateRoute exact path="/home" component={HomePage} />
        <PrivateRoute exact path="/calendar" component={CalendarPage} />
        <PrivateRoute exact path="/recurring-classes" component={RecurringClassesPage} />
        <PrivateRoute exact path="/availability" component={AvailabilitySettings} />
        <PrivateRoute exact path="/clients" component={ClientListPage} />
        <PrivateRoute exact path="/payment-settings" component={PaymentSettingsPage} />

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
