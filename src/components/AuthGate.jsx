
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Login from './Login';

export default function AuthGate({ children }) {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth || !db) {
      setStatus('config-error');
      return;
    }

    return onAuthStateChanged(auth, async user => {
      if (!user) {
        setStatus('signed-out');
        return;
      }

      setStatus('checking');
      setError('');

      try {
        console.log('Signed-in UID:', user.uid);
        console.log('Firebase project:', db.app.options.projectId);

        const staffRef = doc(db, 'staff', user.uid);
        const snapshot = await getDoc(staffRef);

        if (!snapshot.exists()) {
          setError('No staff document found for UID: ' + user.uid);
          await signOut(auth);
          setStatus('unauthorized');
          return;
        }

        const staff = snapshot.data();
        console.log('Staff record:', staff);

        if (
          staff.active === true &&
          ['admin', 'faculty'].includes(staff.role)
        ) {
          setStatus('authorized');
        } else {
          setError('Staff record is inactive or has an invalid role.');
          await signOut(auth);
          setStatus('unauthorized');
        }
      } catch (err) {
        console.error('Staff verification failed:', err);
        setError(`${err.code || 'error'}: ${err.message}`);
        setStatus('access-error');
      }
    });
  }, []);

  if (status === 'checking') {
    return <div className="loading">Verifying staff access…</div>;
  }

  if (status === 'config-error') {
    return <div className="notice">Firebase configuration is missing.</div>;
  }

  if (status === 'access-error') {
    return (
      <div className="notice">
        <p>Staff verification failed.</p>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (status !== 'authorized') {
    return (
      <>
        {status === 'unauthorized' && (
          <p className="login-error">{error || 'Staff access denied.'}</p>
        )}
        <Login />
      </>
    );
  }

  return children;
}
