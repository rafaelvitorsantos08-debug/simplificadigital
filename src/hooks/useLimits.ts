import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface PlanLimits {
  vendasDiarias: number;
  estoque: number;
  clientesDiarios: number;
  isIlimitado: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { vendasDiarias: 5, estoque: 10, clientesDiarios: 5, isIlimitado: false },
  plus: { vendasDiarias: 30, estoque: 60, clientesDiarios: 30, isIlimitado: false },
  pro: { vendasDiarias: 999999, estoque: 999999, clientesDiarios: 999999, isIlimitado: true }
};

export function useLimits() {
  const { user, userData, updateUserData } = useAuth();
  
  const [salesTodayCount, setSalesTodayCount] = useState<number>(0);
  const [inventoryCount, setInventoryCount] = useState<number>(0);
  const [clientsTodayCount, setClientsTodayCount] = useState<number>(0);
  const [loadingLimits, setLoadingLimits] = useState(true);

  // Define active plan (check expiration)
  let activePlanType = userData?.planType || 'free';
  if (activePlanType !== 'free' && userData?.planExpiresAt) {
    if (Date.now() > userData.planExpiresAt) {
      activePlanType = 'free';
      // Could sync to db eventually
    }
  }
  
  const limits = PLAN_LIMITS[activePlanType] || PLAN_LIMITS.free;

  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      setLoadingLimits(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        // Sales today
        const qSales = query(collection(db, 'sales'), where('userId', '==', user.uid));
        const snapSales = await getDocs(qSales);
        let sCount = 0;
        snapSales.forEach(d => {
          const dt = d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt);
          if (dt >= today) sCount++;
        });
        setSalesTodayCount(sCount);

        // Clients today
        const qClients = query(collection(db, 'clients'), where('userId', '==', user.uid));
        const snapClients = await getDocs(qClients);
        let cCount = 0;
        snapClients.forEach(d => {
          const dt = d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt);
          if (dt >= today) cCount++;
        });
        setClientsTodayCount(cCount);

        // Inventory total
        const qInv = query(collection(db, 'inventory'), where('userId', '==', user.uid));
        const snapInv = await getDocs(qInv);
        setInventoryCount(snapInv.size);
      } catch (e) {
        console.error("Erro carregando contadores", e);
      } finally {
        setLoadingLimits(false);
      }
    };
    fetchUsage();
  }, [user]);
  
  const checkCanSell = () => {
    if (limits.isIlimitado) return true;
    return salesTodayCount < limits.vendasDiarias;
  };
  
  const checkCanAddInventory = () => {
    if (limits.isIlimitado) return true;
    return inventoryCount < limits.estoque;
  };

  const checkCanAddClient = () => {
    if (limits.isIlimitado) return true;
    return clientsTodayCount < limits.clientesDiarios;
  };

  return {
    activePlanType,
    limits,
    salesTodayCount,
    inventoryCount,
    clientsTodayCount,
    checkCanSell,
    checkCanAddInventory,
    checkCanAddClient,
    loadingLimits,
    // helpers to update counts optimistically
    incrementSales: () => setSalesTodayCount(v => v + 1),
    incrementInventory: () => setInventoryCount(v => v + 1),
    incrementClients: () => setClientsTodayCount(v => v + 1),
    decrementInventory: () => setInventoryCount(v => Math.max(0, v - 1)),
  };
}
