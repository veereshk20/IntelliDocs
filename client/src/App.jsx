import './App.css';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar'; 
import { Toaster } from 'react-hot-toast';

function App() {
  
  const {user, isLoaded, isSignedIn} = useUser();

  if(!isSignedIn && isLoaded) {
    return <Navigate to = {'/auth/login'} />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header />
        
        {/* Sidebar + Content */}
        <div className="flex flex-1 font-montserrat">
          <Sidebar />
          
          {/* Main content area - will be filled by route components */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>    
  )
}

export default App;