// 6. hooks/useHistorial.ts (Nuevo - Crear este archivo)
import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export const useHistorial = (userId: string, rol: string) => {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let q;
    
    if (rol === 'cliente') {
      q = query(
        collection(db, 'users', userId, 'historial'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'solicitudes'),
        where('professionalId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: any[] = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setHistorial(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, rol]);

  return { historial, loading, error };
};