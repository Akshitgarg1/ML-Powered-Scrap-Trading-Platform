import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Get fresh token
                const token = await currentUser.getIdToken();
                localStorage.setItem('token', token);
                
                // Fetch additional user details from database
                const userRef = ref(db, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);
                const dbData = snapshot.exists() ? snapshot.val() : {};

                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || dbData.full_name || '',
                    ...dbData
                });
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, additionalData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        if (additionalData.full_name) {
            await firebaseUpdateProfile(newUser, { displayName: additionalData.full_name });
        }

        const userData = {
            email: newUser.email,
            username: additionalData.username,
            full_name: additionalData.full_name || '',
            phone: additionalData.phone || '',
            createdAt: new Date().toISOString()
        };

        // Store user under isolated UID
        await set(ref(db, `users/${newUser.uid}`), userData);
        return newUser;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    }

    const updateProfile = async (newData) => {
        if (!user) return;
        await set(ref(db, `users/${user.uid}`), { ...user, ...newData });
        setUser({ ...user, ...newData });
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, resetPassword, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
