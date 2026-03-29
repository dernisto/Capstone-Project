import { useRef, useEffect } from "react";
import { io } from "socket.io-client";
const socketUrl = typeof window !== "undefined" ? window.location.origin : "";
let sharedSocket = null;
function getSharedSocket() {
  if (!socketUrl) return null;
  if (!sharedSocket || sharedSocket.disconnected) {
    sharedSocket = io(socketUrl, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 800
    });
  }
  return sharedSocket;
}
function useGameSocket() {
  const socketRef = useRef(null);
  useEffect(() => {
    const s = getSharedSocket();
    socketRef.current = s;
    return () => {
    };
  }, []);
  if (typeof window !== "undefined") {
    socketRef.current = getSharedSocket();
  }
  return socketRef;
}
export {
  useGameSocket
};
