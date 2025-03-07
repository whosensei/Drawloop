"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const joinRoom = () => {
    if (roomCode.trim()) {
      // Here you would connect to the room via WebSocket
      setCurrentRoom(roomCode);
      setShowModal(false);
      
      // Add a system message
      addSystemMessage(`You joined room: ${roomCode}`);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && username && currentRoom) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: username,
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setInputMessage("");
      
      // Here you would send the message via WebSocket
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const setUserAndContinue = () => {
    if (username.trim()) {
      setShowUsernameModal(false);
    }
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "system",
      timestamp: new Date(),
    };
    
    setMessages([...messages, systemMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showUsernameModal) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2 className={styles.modalTitle}>Welcome to Chat App</h2>
          <p className={styles.modalText}>Please enter your username to continue</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.modalInput}
            placeholder="Your username"
            autoFocus
          />
          <button 
            className={styles.modalButton}
            onClick={setUserAndContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.chatContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chat App</h1>
          <div className={styles.roomInfo}>
            {currentRoom ? (
              <div className={styles.currentRoom}>
                Room: <span>{currentRoom}</span>
              </div>
            ) : (
              <div className={styles.noRoom}>Not in a room</div>
            )}
            <button 
              className={styles.joinButton} 
              onClick={() => setShowModal(true)}
            >
              {currentRoom ? "Change Room" : "Join Room"}
            </button>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💬</div>
              <p>No messages yet</p>
              {!currentRoom && (
                <p className={styles.emptyStateHint}>Join a room to start chatting</p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.message} ${
                  message.sender === username 
                    ? styles.outgoingMessage 
                    : message.sender === "system" 
                      ? styles.systemMessage 
                      : styles.incomingMessage
                }`}
              >
                {message.sender !== "system" && message.sender !== username && (
                  <div className={styles.messageSender}>{message.sender}</div>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.text}</div>
                  <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <textarea
            className={styles.messageInput}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={!currentRoom}
          />
          <button 
            className={styles.sendButton} 
            onClick={sendMessage}
            disabled={!currentRoom || !inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Join a Room</h2>
            <p className={styles.modalText}>Enter a room code to join</p>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className={styles.modalInput}
              placeholder="Room code"
              autoFocus
            />
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalCancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalButton}
                onClick={joinRoom}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
