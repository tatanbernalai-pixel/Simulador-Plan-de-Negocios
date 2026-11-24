import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Se cerró la ventana de inicio de sesión antes de completar el acceso.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('El navegador bloqueó la ventana emergente de Google. Por favor permite ventanas emergentes e intenta nuevamente.');
      } else {
        setAuthError(err?.message || 'No se pudo iniciar sesión con Google.');
      }
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async (): Promise<void> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setAuthError(err?.message || 'Error al cerrar sesión.');
    } finally {
      setAuthLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        authLoading,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase debe usarse dentro de un FirebaseProvider');
  }
  return ctx;
}
