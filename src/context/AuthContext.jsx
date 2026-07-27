import { createContext, useState, useEffect } from 'react';
import { db } from '../services/db';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Instead of a JWT token, we store the local user ID to keep them logged in
  const [userId, setUserId] = useState(localStorage.getItem('localUserId') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (userId) {
        try {
          // Fetch user directly from the local database
          const foundUser = await db.users.get(Number(userId));
          if (foundUser) {
            setUser(foundUser);
          } else {
            // User was deleted from DB
            setUserId(null);
            localStorage.removeItem('localUserId');
          }
        } catch (error) {
          console.error("Failed to fetch local user", error);
          setUserId(null);
          localStorage.removeItem('localUserId');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [userId]);

  const login = async (emailOrMobile, password) => {
    try {
      const cleanInput = emailOrMobile.trim();
      const allUsers = await db.users.toArray();
      const foundUser = allUsers.find(u => u.email === cleanInput || u.mobile === cleanInput);

      if (!foundUser) {
        return { success: false, message: "User not found." };
      }

      // Check password (In this local version, we match exactly against what was saved)
      const storedPassword = foundUser.password || foundUser.password_hash;
      if (storedPassword !== password) {
        return { success: false, message: "Invalid credentials." };
      }

      // Success - save session locally
      setUserId(foundUser.id.toString());
      localStorage.setItem('localUserId', foundUser.id.toString());
      setUser(foundUser);

      // Return the same structure the existing components expect
      return { 
        success: true, 
        data: { 
          token: foundUser.id.toString(), // Provide the ID as a fake token so existing code doesn't break
          user: foundUser 
        } 
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Login error occurred." };
    }
  };

  const logout = () => {
    setUser(null);
    setUserId(null);
    localStorage.removeItem('localUserId');
    // Also remove the old JWT token if it's still lingering from the old version
    localStorage.removeItem('token');
  };

  return (
    // We expose 'token: userId' so that any components checking 'token' still work
    <AuthContext.Provider value={{ user, setUser, token: userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
