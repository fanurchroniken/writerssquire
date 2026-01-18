import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthCallback } from './pages/AuthCallback';
import Home from './pages/Home';
import WorldDetail from './pages/WorldDetail';
import WorldAtlas from './pages/WorldAtlas';
import DocumentEditor from './pages/DocumentEditor';
import WorldWriting from './pages/WorldWriting';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:documentId"
            element={
              <ProtectedRoute>
                <DocumentEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worlds/:worldId/writing"
            element={
              <ProtectedRoute>
                <WorldWriting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worlds/:worldId"
            element={
              <ProtectedRoute>
                <WorldDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/worlds/:worldId/atlas" element={<WorldAtlas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
