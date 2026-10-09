import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

import Landing from "../pages/Landing";
import Auth from "../pages/Auth";
import { Home } from "../pages/Home";
import CreatePlayer from "../pages/CreatePlayer";
import EditPlayer from "../pages/EditPlayer";
import { PlayerProfile } from "../pages/PlayerProfile";
import { AddSeason } from "../pages/AddSeason";
import EditAchievement from "../pages/EditAchievement";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Carregando FootballStats...</h3>
          <p>Verificando sua sessão.</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-player"
          element={
            <ProtectedRoute>
              <CreatePlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/player/:id"
          element={
            <ProtectedRoute>
              <PlayerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/player/:id/edit"
          element={
            <ProtectedRoute>
              <EditPlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/player/:id/add-season"
          element={
            <ProtectedRoute>
              <AddSeason />
            </ProtectedRoute>
          }
        />

        <Route
          path="/player/:id/edit-season/:seasonId"
          element={
            <ProtectedRoute>
              <AddSeason />
            </ProtectedRoute>
          }
        />

        <Route
          path="/player/:id/edit-achievement/:achievementId"
          element={
            <ProtectedRoute>
              <EditAchievement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
