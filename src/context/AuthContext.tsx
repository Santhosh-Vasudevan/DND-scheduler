import React, {createContext, useContext, useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';

const AuthContext = createContext<any>({user: null, loading: true});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
