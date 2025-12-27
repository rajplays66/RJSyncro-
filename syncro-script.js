// SIMPLE VERSION - NO ERRORS
const API_URL = '/api/chat';
// Add SYSTEM INSTRUCTION after API_URL
const SYSTEM_INSTRUCTION = `You are Syncro, AI assistant for RJSyncro tech blog.

TOPICS YOU KNOW:
1. Web Development: HTML, CSS, JavaScript, React, Next.js
2. Tech Tools: VS Code, GitHub, Chrome DevTools
3. Design: UI/UX basics, Figma, color theory
4. RJSyncro: Tech blog by RJ, dark theme with cyan colors

RESPONSE STYLE:
- Be helpful and friendly
- Give practical examples
- Use simple explanations
- Admit when you don't know

Start conversations warmly and offer specific help.`;
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
            body: JSON.stringify({
                message: message,
                system_instruction: SYSTEM_INSTRUCTION
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return `API Error: ${data.error}`;
        } else {
            return "I received an unexpected response.";
        }
        
    } catch (error) {
        console.error('AI Error:', error);
        return `Connection Error: ${error.message}`;
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
