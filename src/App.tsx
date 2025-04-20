import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { UserSession } from './types';
import Login from './components/Login';
import ObjectDetection from './components/ObjectDetection';

function App() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={session ? <ObjectDetection /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;