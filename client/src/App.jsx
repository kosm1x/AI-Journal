import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { JournalProvider } from './context/JournalContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EntryDetail from './pages/EntryDetail'
import EntryEditor from './pages/EntryEditor'
import './App.css'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <JournalProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/entries/:id" element={
              <ProtectedRoute>
                <EntryDetail />
              </ProtectedRoute>
            } />
            <Route path="/entries/edit/:id" element={
              <ProtectedRoute>
                <EntryEditor />
              </ProtectedRoute>
            } />
            <Route path="/entries/new" element={
              <ProtectedRoute>
                <EntryEditor />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </JournalProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
