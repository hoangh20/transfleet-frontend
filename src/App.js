import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import AdminLayout from './components/layout/adminlayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/route/ProtectedRoute'; 
import * as UserService from './services/UserService';
import { updateUser } from './redux/slice/userSlice';
import {jwtDecode} from 'jwt-decode';
import { useDispatch } from 'react-redux';
import LoadingPage from './components/loading/LoadingPage';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const handleDecoded = useCallback(() => {
    const storageData = localStorage.getItem('access_token');
    const decoded = storageData ? jwtDecode(storageData) : {};
    return { decoded, storageData };
  }, []);

  const handleGetDetailsUser = useCallback(
    async (id, token) => {
      try {
        const res = await UserService.getDetailsUser(id, token);
        dispatch(updateUser({ ...res?.data, access_token: token }));
      } catch (error) {
        console.error("Failed to get user details:", error);
        // Handle error (e.g., redirect to login or show error message)
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const { storageData, decoded } = handleDecoded();
    if (decoded?.id) {
      handleGetDetailsUser(decoded.id, storageData).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [handleDecoded, handleGetDetailsUser]);

  // Axios interceptor for handling token refresh
  UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      try {
        const currentTime = new Date();
        const { decoded } = handleDecoded();
        if (decoded?.exp < currentTime.getTime() / 1000) {
          const data = await UserService.refreshToken();
          config.headers['token'] = `Bearer ${data?.access_token}`;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        // Handle token refresh error (e.g., redirect to login)
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  // Optional: Show loading spinner while verifying token
  if (loading) return <LoadingPage />; // Replace placeholder with LoadingPage

  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route, index) => {
            const Page = route.page;
            const isAuthRoute = route.path === '/sign-in' || route.path === '/sign-up';

            const Layout = isAuthRoute ? AuthLayout : AdminLayout;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  isAuthRoute ? (
                    <Layout>
                      <Page />
                    </Layout>
                  ) : (
                    <ProtectedRoute>
                      <Layout>
                        <Page />
                      </Layout>
                    </ProtectedRoute>
                  )
                }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
