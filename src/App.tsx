import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { useLibraryStore } from './store/useLibraryStore';
import { UserMedia } from './types';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Library from './pages/Library';
import ItemDetails from './pages/ItemDetails';
import CategoryPage from './pages/CategoryPage';
import { Film } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import LenisProvider from './components/LenisProvider';

export default function App() {
  const { login, logout, setAuthLoading, authLoading } = useAuthStore();
  const { setLibrary, migrateLocalToFirebase } = useLibraryStore();

  useEffect(() => {
    if (!auth) {
      // If Firebase isn't configured, immediately stop loading
      setAuthLoading(false);
      return;
    }

    let unsubFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        login(
          firebaseUser.email || '', 
          firebaseUser.displayName || 'Cinéfilo', 
          firebaseUser.uid
        );

        // Make sure to migrate any local items once
        await migrateLocalToFirebase();

        // Listen for library changes in real time
        if (db) {
          const libraryRef = collection(db, 'users', firebaseUser.uid, 'library');
          unsubFirestore = onSnapshot(libraryRef, (snapshot) => {
            const newLibrary: Record<string, UserMedia> = {};
            snapshot.forEach(doc => {
              newLibrary[doc.id] = doc.data() as UserMedia;
            });
            setLibrary(newLibrary);
            setAuthLoading(false); // Stop loading after initial data fetch
          }, (err) => {
            console.error("Firestore listener error:", err);
            setAuthLoading(false);
          });
        } else {
          setAuthLoading(false);
        }
      } else {
        if (unsubFirestore) {
          unsubFirestore();
        }
        logout();
        setAuthLoading(false); // Stop loading when we confirmed logged out
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubFirestore) {
        unsubFirestore();
      }
    };
  }, [login, logout, setAuthLoading, setLibrary, migrateLocalToFirebase]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden noise-overlay">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex items-center justify-center animate-pulse shadow-xl shadow-blue-900/40">
          <Film className="w-8 h-8 text-white stroke-[1.5]" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <LenisProvider>
        <CustomCursor />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="discover" element={<Discover />} />
            <Route path="discover/:categoryId" element={<CategoryPage />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="item/:id" element={<ItemDetails />} />
          </Route>
        </Routes>
      </LenisProvider>
    </BrowserRouter>
  );
}
