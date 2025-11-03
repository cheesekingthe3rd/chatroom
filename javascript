// script.js
class OnlineChat {
    constructor() {
        this.username = null;
        this.socket = null;
        this.initializeElements();
        this.bindEvents();
        this.connectToServer();
    }

    initializeElements() {
        this.usernameInput = document.getElementById('usernameInput');
        this.setUsernameBtn = document.getElementById('setUsernameBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
    }

    bindEvents() {
        this.setUsernameBtn.addEventListener('click', () => this.setUsername());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setUsername();
        });
        
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    connectToServer() {
        // In a real implementation, you would connect to your WebSocket server
        // This example shows how it would work with a real server
        try {
            // Replace with your actual WebSocket server URL
            // Example: this.socket = new WebSocket('ws://localhost:8080');
            this.socket = new WebSocket('wss://your-websocket-server.com');
            
            this.socket.onopen = () => {
                console.log('Connected to chat server');
                this.addSystemMessage('Connected to chat server');
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch(data.type) {
                    case 'message':
                        this.addMessage(data.username, data.content, data.username === this.username);
                        break;
                    case 'user_joined':
                        this.addSystemMessage(`${data.username} joined the chat`);
                        break;
                    case 'user_left':
                        this.addSystemMessage(`${data.username} left the chat`);
                        break;
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.addSystemMessage('Connection error. Please refresh the page.');
            };

            this.socket.onclose = () => {
                console.log('Disconnected from chat server');
                this.addSystemMessage('Disconnected from chat server. Reconnecting...');
                // Attempt to reconnect after delay
                setTimeout(() => this.connectToServer(), 3000);
            };
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.addSystemMessage('Failed to connect to server. Please check your connection.');
        }
    }

    setUsername() {
        const username = this.usernameInput.value.trim();
        if (username && username.length <= 20) {
            this.username = username;
            this.updateUIAfterLogin();
            this.sendJoinMessage();
        } else {
            alert('Please enter a valid username (max 20 characters)');
        }
    }

    sendJoinMessage() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'join',
                username: this.username
            }));
        }
    }

    updateUIAfterLogin() {
        this.usernameInput.disabled = true;
        this.setUsernameBtn.disabled = true;
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.usernameInput.value = '';
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message && this.username && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'message',
                username: this.username,
                content: message
            }));
            this.messageInput.value = '';
        }
    }

    addMessage(username, content, isOwn) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isOwn ? 'own' : 'other');
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messageElement.innerHTML = `<strong>${username}</strong> (${time})<br>${content}`;
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addSystemMessage(content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'system');
        messageElement.style.textAlign = 'center';
        messageElement.style.fontStyle = 'italic';
        messageElement.style.color = '#6c757d';
        messageElement.innerHTML = content;
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chat = new OnlineChat();
});
