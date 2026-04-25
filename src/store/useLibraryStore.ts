import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserMedia } from '../types';
import { useAuthStore } from './useAuthStore';

interface LibraryState {
  library: Record<string, UserMedia>;
  setLibrary: (library: Record<string, UserMedia>) => void;
  clearLibrary: () => void;
  migrateLocalToFirebase: () => Promise<void>;
  addToLibrary: (item: UserMedia) => void;
  removeFromLibrary: (id: string) => void;
  updateMedia: (id: string, updates: Partial<UserMedia>) => void;
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  library: {},
  setLibrary: (library) => set({ library }),
  clearLibrary: () => set({ library: {} }),
  
  migrateLocalToFirebase: async () => {
    const user = useAuthStore.getState().user;
    if (!user || !db) return;
    
    const localData = localStorage.getItem('cinevault-storage');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const localLibrary = parsed?.state?.library;
        
        if (localLibrary && Object.keys(localLibrary).length > 0) {
          console.log("Migrando registros locais para a nuvem...");
          const promises = Object.values(localLibrary).map((item: any) => {
            const docRef = doc(db, 'users', user.uid, 'library', item.id);
            return setDoc(docRef, item);
          });
          
          await Promise.all(promises);
          console.log(`${Object.keys(localLibrary).length} registros migrados com sucesso!`);
        }
        
        localStorage.removeItem('cinevault-storage');
      } catch (err) {
        console.error("Erro ao migrar dados locais:", err);
      }
    }
  },
  
  addToLibrary: (item) => {
    set((state) => ({
      library: { ...state.library, [item.id]: item },
    }));

    const user = useAuthStore.getState().user;
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'library', item.id);
      setDoc(docRef, item).catch(err => console.error("Error adding to Firestore:", err));
    }
  },
  
  removeFromLibrary: (id) => {
    set((state) => {
      const newLibrary = { ...state.library };
      delete newLibrary[id];
      return { library: newLibrary };
    });

    const user = useAuthStore.getState().user;
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'library', id);
      deleteDoc(docRef).catch(err => console.error("Error removing from Firestore:", err));
    }
  },
  
  updateMedia: (id, updates) => {
    set((state) => {
      if (!state.library[id]) return state;
      return {
        library: {
          ...state.library,
          [id]: { ...state.library[id], ...updates },
        },
      };
    });

    const user = useAuthStore.getState().user;
    const { library } = get();
    if (user && db && library[id]) {
      const docRef = doc(db, 'users', user.uid, 'library', id);
      setDoc(docRef, { ...library[id], ...updates }, { merge: true })
        .catch(err => console.error("Error updating Firestore:", err));
    }
  },
}));
