import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const initialState = {
  agent: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const authReducer = (state, action) => {
  console.log('🔐 AuthReducer action:', action.type);
  
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        agent: action.payload, 
        isAuthenticated: true, 
        isLoading: false 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        error: action.payload, 
        isAuthenticated: false, 
        isLoading: false 
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);


  // 🆕 ADD THIS useEffect:
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedAgent = localStorage.getItem('agent');
    
    if (token && savedAgent) {
      try {
        const agent = JSON.parse(savedAgent);
        dispatch({ type: 'LOGIN_SUCCESS', payload: agent });
      } catch (error) {
        // Clear invalid saved data
        localStorage.removeItem('token');
        localStorage.removeItem('agent');
      }
    }
  }, []);  

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost/api';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/agent-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {

        // 🆕 ADD THESE 2 LINES:
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('agent', JSON.stringify(data.data.agent));

        dispatch({ type: 'LOGIN_SUCCESS', payload: data.data.agent });
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {

    // 🆕 ADD THESE 2 LINES:
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const contextValue = useMemo(() => ({
    agent: state.agent,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout
  }), [
    state.agent?.id, // Only depend on agent ID, not the whole agent object
    state.isAuthenticated, 
    state.isLoading, 
    state.error, 
    login, 
    logout
  ]);

  useEffect(() => {
    console.log('🔐 AuthContext state updated:', state);
  }, [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};