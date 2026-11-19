'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import { ClientProfile, ClientProject } from '@/lib/client-portal-types';

interface ClientPortalContextType {
  client: ClientProfile | null;
  project: ClientProject | null;
  isLoading: boolean;
  unreadCount: number;
  projectError: boolean;
}

const ClientPortalContext = createContext<ClientPortalContextType | undefined>(undefined);

export function ClientPortalProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [projectError, setProjectError] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || !db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setProjectError(false);
    let stopUnread: (()=>void) | undefined;
    // Subscribe to client profile
    const clientRef = doc(db, 'clients', user.uid);
    const unsubscribeClient = onSnapshot(clientRef, (snap) => {
      if (snap.exists()) {
        setClient({ ...snap.data() as ClientProfile, uid: snap.id });
      } else {
        // Admin Mock for testing
        if (isAdmin) {
           setClient({
             uid: user.uid,
             name: user.displayName || 'David Admin',
             email: user.email || 'admin@mwijay.com',
             phone: '+255 620 641 695',
             company: 'Lead Architect Node',
             projectId: 'mock_project',
             createdAt: new Date()
           });
        } else {
           setClient(null);
        }
      }
    });

    // Subscribe to client project
    const projectsRef = collection(db, 'client_projects');
    const projectQuery = query(projectsRef, where('clientId', '==', user.uid), limit(1));
    const unsubscribeProject = onSnapshot(projectQuery, (snap) => {
      stopUnread?.();
      setUnreadCount(0);
      setProjectError(false);
      if (!snap.empty) {
        const projData = snap.docs[0].data() as ClientProject;
        const projId = snap.docs[0].id;
        setProject({ ...projData, projectId: projId });
        
        // Subscribe to unread messages for this project
        const messagesRef = collection(db, 'client_messages', projId, 'messages');
        const unreadQuery = query(
          messagesRef, 
          where('senderRole', '==', 'admin'),
          where('isRead', '==', false)
        );
        
        stopUnread = onSnapshot(unreadQuery, (unreadSnap) => {
          setUnreadCount(unreadSnap.size);
        });


      } else {
        // Admin Mock project for testing
        if (isAdmin) {
           setProject({
              projectId: 'mock_project',
              clientId: user.uid,
              projectName: 'Test Architecture Build',
              service: 'Platform Testing',
              description: 'This is a mock project for verifying the client portal UI/UX.',
              status: 'development',
              progressPercent: 65,
              currentMilestone: 'Development Phase',
              milestones: [
                { id: '1', name: 'Handshake', status: 'completed', completedAt: { toDate: () => new Date() }, notes: 'Registry linked.', order: 1 },
                { id: '2', name: 'UI Sync', status: 'in_progress', completedAt: null, notes: 'Polishing visuals.', order: 2 }
              ],
              totalAmount: 500000,
              amountPaid: 250000,
              startDate: { toDate: () => new Date() },
              estimatedCompletion: { toDate: () => new Date(Date.now() + 86400000 * 14) },
              deliverables: [
                { id: 'd1', name: 'Blueprint_v1.pdf', url: '#', fileType: 'pdf', uploadedAt: { toDate: () => new Date() } }
              ],
              createdAt: new Date(),
              updatedAt: new Date()
           } as any);
        } else {
          setProject(null);
        }
      }
      setIsLoading(false);
    }, () => {
      stopUnread?.();
      setProject(null);
      setUnreadCount(0);
      setProjectError(true);
      setIsLoading(false);
    });

    return () => {
      unsubscribeClient();
      unsubscribeProject();
      stopUnread?.();
    };
  }, [user, isAdmin, isUserLoading, db]);

  const value = useMemo(() => ({
    client,
    project,
    isLoading,
    unreadCount, projectError
  }), [client, project, isLoading, unreadCount, projectError]);

  return (
    <ClientPortalContext.Provider value={value}>
      {children}
    </ClientPortalContext.Provider>
  );
}

export function useClientPortal() {
  const context = useContext(ClientPortalContext);
  if (context === undefined) {
    throw new Error('useClientPortal must be used within a ClientPortalProvider');
  }
  return context;
}
