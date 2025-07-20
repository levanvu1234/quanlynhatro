import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    phonenumber: '',
    name: '',
    role: '',
    _id:'',
  },
});

export const AuthWrapper = (props) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      phonenumber: '',
      name: '',
      role: '',
      _id:'',
    },
  });
  const [apploading, SetAppLoading] = useState(true);
   useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    SetAppLoading(false);
  }, []);
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);


  return (
    <AuthContext.Provider value={{ auth, setAuth, apploading, SetAppLoading }}>
      {props.children}
    </AuthContext.Provider>
  );
};
