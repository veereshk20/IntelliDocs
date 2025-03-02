/* eslint-disable react/prop-types */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import { ClerkProvider, SignUp, useAuth, useUser } from "@clerk/clerk-react";
import Home from "./pages/Home.jsx";
// Import all the pages for the routes
import Files from "./pages/Files.jsx";
import Starred from "./pages/Starred.jsx";
import CollabEdit from "./pages/CollabEdit.jsx";
import FileConvertor from "./pages/FileConvertor.jsx";
import Recent from "./pages/Recent.jsx";
import Settings from "./pages/Settings.jsx";
import Loading from './components/Loading';
import axios from '../axios.js';
import { AppProvider } from "./context/AppContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const api_url = import.meta.env.VITE_BACKEND_URL;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser();

  const formData = {
    user_name: user?.username || "", 
    password: "", // Assuming password is not required for this request
    email: user?.emailAddresses?.[0]?.emailAddress || ""
  };

  
    const checkAndSendUserData = async () => {
      try {
        // Check if the user exists in the database
        console.log(formData);
        const checkResponse = await axios.get(`/getuser?user_name=${formData.user_name}`);
        if (checkResponse.status !== 200) {
          // If user does not exist, send the POST request
          const response = await axios.post(`/register`, formData);
          console.log("Server Response:", response.data);
        } else {
          console.log("User already exists in the database.");
        }
      } catch (error) {
        console.error("Error checking or sending user data:", error);
      }
    };

    if (isSignedIn) {
      checkAndSendUserData();
    };

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return <Loading />;
  }

  console.log(user);

  

  

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  // If signed in, render the children
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/files",
        element: <Files />,
      },
      {
        path: "/starred",
        element: <Starred />,
      },
      {
        path: "/collab",
        element: <CollabEdit />,
      },
      {
        path: "/convertor",
        element: <FileConvertor />,
      },
      {
        path: "/recent",
        element: <Recent />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signup",
    element: <SignUp />,
  },
  // Catch-all redirect to login
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/auth/login'>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>      
    </ClerkProvider>
  </StrictMode>
)
