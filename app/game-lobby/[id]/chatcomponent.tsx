import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue, set, remove, Database } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import styles from "./Chat.module.css";

import { GameStatus } from '@/types/game';

// Firebase configuration - put in an environment variable in production
const firebaseConfig = {
  apiKey: "AIzaSyAdeQdi_b1s8dlSKxQcSxnSMi3egi1I3qU",
  authDomain: "quoridor-chat.firebaseapp.com",
  databaseURL: "https://quoridor-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quoridor-chat",
  storageBucket: "quoridor-chat.firebasestorage.app",
  messagingSenderId: "656373608509",
  appId: "1:656373608509:web:5fb8a21cf6c5371c00fa54",
  measurementId: "G-1ZJPSGQYWX"
};

// Initialize Firebase - use existing instance if available
let app;
let database: Database | undefined;

try {
  // Try to get the existing Firebase app instance
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

interface ChatProps {
  gameId: string;
  gameEnded?: boolean;
}

// Utility function to delete game chat - can be called from outside component
export const deleteGameChat = (gameId: string) => {
  if (!gameId || !database) return;
  
  try {
    const chatRef = ref(database, `chats/${gameId}`);
    remove(chatRef)
      .then(() => console.log(`Chat for game ${gameId} deleted successfully`))
      .catch(error => console.error(`Error deleting chat: ${error.message}`));
  } catch (error) {
    console.error("Error in deleteGameChat:", error);
  }
};

// Utility function to ensure fresh chat for new games
export const initializeGameChat = (gameId: string) => {
  if (!gameId || !database) return;
  
  // First delete any existing chat data for this gameId
  deleteGameChat(gameId);
  
  // Create an initial empty structure to ensure fresh start
  try {
    const chatRef = ref(database, `chats/${gameId}`);
    set(chatRef, { initialized: Date.now() })
      .then(() => console.log(`Fresh chat initialized for game ${gameId}`))
      .catch(error => console.error(`Error initializing chat: ${error.message}`));
  } catch (error) {
    console.error("Error in initializeGameChat:", error);
  }
};

const Chat: React.FC<ChatProps> = ({ gameId, gameEnded = false }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getUser } = useAuth();
  const currentUser = getUser();
  
  // Initialize fresh chat when component mounts with a new gameId
  useEffect(() => {
    if (!gameId || !database) return;
    
    // Check if this is a new game chat that needs initialization
    const chatRef = ref(database, `chats/${gameId}`);
    onValue(chatRef, (snapshot) => {
      // If there's no data yet for this game ID, initialize it
      if (!snapshot.exists()) {
        set(chatRef, { initialized: Date.now() })
          .then(() => console.log(`Fresh chat initialized for game ${gameId}`))
          .catch(error => console.error(`Error initializing chat: ${error.message}`));
      }
    }, { onlyOnce: true });
    
  }, [gameId]);
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    if (!gameId || !database) return;
    
    console.log("Setting up chat listener for game:", gameId);
    
    // Create a reference to this game's chat messages
    const messagesRef = ref(database, `chats/${gameId}/messages`);
    
    // Listen for new messages
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Convert object to array and sort by timestamp
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as any)
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
      } else {
        setMessages([]);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      console.log("Cleaning up chat listener");
      unsubscribe();
    };
  }, [gameId]);

  // Delete chat when game ends
  useEffect(() => {
    if (gameEnded && gameId) {
      console.log("Game ended, deleting chat");
      deleteGameChat(gameId);
    }
  }, [gameEnded, gameId]);

  // Send message handler
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || gameEnded || !database) return;

    try {
      const messagesRef = ref(database, `chats/${gameId}/messages`);
      const newMessageRef = push(messagesRef);
      
      set(newMessageRef, {
        text: message,
        sender: currentUser.username,
        userId: currentUser.id,
        timestamp: Date.now()
      }).then(() => {
        setMessage("");
      }).catch(error => {
        console.error("Error sending message:", error);
      });
    } catch (error) {
      console.error("Error in send message:", error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h3 className={styles.chatHeader}>Game Chat</h3>
      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.emptyChat}>No messages yet. Say hello!</div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.message} ${msg.userId === currentUser?.id ? styles.myMessage : styles.otherMessage}`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.sender}>{msg.sender}</span>
              <span className={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className={styles.messageText}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className={styles.chatForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={gameEnded ? "Chat disabled - game ended" : "Type a message..."}
          className={styles.chatInput}
          disabled={gameEnded}
        />
        <button type="submit" className={styles.sendButton} disabled={gameEnded}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
