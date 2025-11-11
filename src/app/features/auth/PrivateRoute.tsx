import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { IonSpinner, IonContent, IonPage } from '@ionic/react';
import { useAuth } from './AuthContext';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected route that requires authentication
 * Redirects to login if user is not authenticated
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  requireAuth = true,
  redirectTo = '/login',
  ...rest
}) => {
  const { user, loading, initialized } = useAuth();

  // Show loading spinner while auth is initializing
  if (loading || !initialized) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="flex min-h-full items-center justify-center">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        requireAuth && !user ? (
          <Redirect to={{ pathname: redirectTo, state: { from: props.location } }} />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};
