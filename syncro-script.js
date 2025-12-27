// SIMPLE VERSION - NO ERRORS
const API_URL = '/api/chat';

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

async function sendToAI(message) {
    showTyping();
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: message})
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        }
        return "Error: No response from AI";
        
    } catch (error) {
        console.error('AI Error:', error);
        return `Error: ${error.message}`;
    } finally {
        hideTyping();
    }
}

// NEW UPDATED FUNCTION (REPLACE OLD ONE)
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const senderLabel = document.createElement('strong');
    senderLabel.textContent = sender === 'user' ? 'You' : 'Syncro';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-content';
    textDiv.textContent = text;
    
    messageDiv.appendChild(senderLabel);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    if (typingIndicator) typingIndicator.style.display = 'block';
}

function hideTyping() {
    if (typingIndicator) typingIndicator.style.display = 'none';
}

sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    
    const reply = await sendToAI(message);
    addMessage(reply, 'ai');
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});
