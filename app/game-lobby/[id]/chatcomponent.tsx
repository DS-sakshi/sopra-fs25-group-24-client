import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import styles from "./Chat.module.css";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

interface ChatProps {
  gameId: string;
}

const Chat: React.FC<ChatProps> = ({ gameId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getUser } = useAuth();
  const currentUser = getUser();
  
   // Scroll to bottom of chat when messages change
   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for messages
  useEffect(() => {
    if (!gameId) return;
    
    console.log("Setting up chat listener for game:", gameId);
    
    // Create a reference to this game's chat messages
    const messagesRef = ref(database, `chats/${gameId}/messages`);
    
    // Listen for new messages
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Chat data received:", data);
      
      if (data) {
        // Convert object to array and sort by timestamp
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as any)
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      console.log("Cleaning up chat listener");
      unsubscribe();
    };
  }, [gameId]);

  // Send message handler with improved error handling
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    try {
      const messagesRef = ref(database, `chats/${gameId}/messages`);
      const newMessageRef = push(messagesRef);
      
      set(newMessageRef, {
        text: message,
        sender: currentUser.username,
        userId: currentUser.id,
        timestamp: Date.now()
      }).then(() => {
        console.log("Message sent successfully");
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
          placeholder="Type a message..."
          className={styles.chatInput}
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;