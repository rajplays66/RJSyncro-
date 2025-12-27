// SIMPLE VERSION - NO ERRORS
const API_URL = '/api/chat';
const SYSTEM_INSTRUCTION = "You are Syncro, AI assistant for RJSyncro tech blog. Be helpful and friendly.";

// Update the fetch body:
body: JSON.stringify({
    message: message,
    system_instruction: SYSTEM_INSTRUCTION
})
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

function showTyping() {
    if (typingIndicator) typingIndicator.style.display = 'block';
}

function hideTyping() {
    if (typingIndicator) typingIndicator.style.display = 'none';
}

// Update sendToAI function:
async function sendToAI(message) {
    showTyping();
    try {
        // ... existing code ...
    } catch (error) {
        // ... error handling ...
    } finally {
        hideTyping();
    }
}
async function sendToAI(message) {
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
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = sender + '-message';
    
    // Add sender label
    const senderLabel = document.createElement('strong');
    senderLabel.textContent = sender === 'user' ? 'You: ' : 'Syncro: ';
    
    const messageText = document.createTextNode(text);
    
    div.appendChild(senderLabel);
    div.appendChild(messageText);
    chatMessages.appendChild(div);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    
    const reply = await sendToAI(message);
    addMessage(reply, 'ai');
});

// Allow Enter key to send
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});
