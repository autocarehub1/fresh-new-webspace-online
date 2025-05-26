#!/bin/bash

# This script updates the App.tsx file to add customer portal routes

# Define the file path
APP_FILE="src/App.tsx"

# Add import statements
sed -i '' '21i\
import CustomerPortal from "./pages/CustomerPortal";\
import CustomerLogin from "./pages/CustomerLogin";
' $APP_FILE

# Add CustomerRoute component after ProtectedRoute
sed -i '' '43i\
// Customer route protection\
const CustomerRoute = ({ children }: { children: React.ReactNode }) => {\
  const { user, isLoading } = useAuth();\
  \
  if (isLoading) {\
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;\
  }\
  \
  if (!user) {\
    return <Navigate to="/customer-login" replace />;\
  }\
  \
  return <>{children}</>;\
};
' $APP_FILE

# Update the Routes section to include customer portal routes
sed -i '' '75i\
            {/* Admin routes */}
' $APP_FILE

sed -i '' '82i\
            \
            {/* Driver routes */}
' $APP_FILE

sed -i '' '84i\
            \
            {/* Customer portal routes */}\
            <Route path="/customer-login" element={<CustomerLogin />} />\
            <Route path="/customer-portal" element={\
              <CustomerRoute>\
                <CustomerPortal />\
              </CustomerRoute>\
            } />\
            <Route path="/customer-portal/:tabId" element={\
              <CustomerRoute>\
                <CustomerPortal />\
              </CustomerRoute>\
            } />
' $APP_FILE

echo "App.tsx updated with customer portal routes!" 