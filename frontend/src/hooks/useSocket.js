import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      // Connect to the backend
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        if (user.role === 'admin') {
          newSocket.emit('join_admin');
        } else {
          newSocket.emit('join_student', user._id || user.id);
        }
      });
    }

    return () => {
      // Disconnect on unmount if it was created here
      if (socketRef.current && !user) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user]);

  return socket;
};
