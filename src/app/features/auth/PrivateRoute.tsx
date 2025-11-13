import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected route that requires authentication
 * Redirects to login if user is not authenticated
 * Redirects to onboarding if tenant hasn't completed onboarding
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  requireAuth = true,
  redirectTo = '/login',
  ...rest
}) => {
  const { user, tenant, loading, initialized } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Show loading spinner while auth is initializing
        if (loading || !initialized) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">Cargando...</p>
              </div>
            </div>
          );
        }

        // Redirect to login if not authenticated
        if (requireAuth && !user) {
          return <Redirect to={{ pathname: redirectTo, state: { from: props.location } }} />;
        }

        // Check if onboarding is completed (except for onboarding page itself)
        const isOnboardingPage = props.location.pathname === '/onboarding';
        const onboardingCompleted = tenant?.settings?.onboardingCompleted ?? false;
        
        if (requireAuth && user && !isOnboardingPage && !onboardingCompleted) {
          return <Redirect to="/onboarding" />;
        }

        // If onboarding is completed and user is on onboarding page, redirect to home
        if (isOnboardingPage && onboardingCompleted) {
          return <Redirect to="/home" />;
        }

        // Render component if authenticated
        return <Component {...props} />;
      }}
    />
  );
};
