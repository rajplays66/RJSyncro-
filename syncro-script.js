// Syncro AI Chat - Product Knowledge (No Buttons)
const API_URL = '/api/chat';
const SYSTEM_INSTRUCTION = `You are Syncro, AI assistant for RJSyncro.

COMPANY & PRODUCT KNOWLEDGE:
- Company: RJSyncro (Premium tech company)
- Values: Quality, innovation, customer success

AVAILABLE PRODUCTS (for information only):
1. Web Templates ($49-$199): Professional, responsive website templates for businesses
2. SaaS Starter Kit ($299): Complete SaaS boilerplate with authentication, payments, and admin panel
3. AI Chat System ($199 one-time): Customizable AI assistant system (like this one)
4. Custom Development (Custom quote): Tailored web applications and solutions

YOUR ROLE:
1. HELPFUL ASSISTANT: Answer questions clearly and professionally
2. PRODUCT INFORMATION: Mention products when relevant to user questions
3. NO PUSHING: Never push products unless user specifically asks
4. SUPPORT: Help users with their inquiries

RESPONSE GUIDELINES:
- Be professional but friendly
- If user asks about products, provide accurate information
- Never initiate product conversations
- If user seems interested, mention relevant products ONCE
- Focus on helping, not selling
- Prices are fixed - no negotiations`;

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Send message to AI
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

// Add message to chat (clean version - no buttons)
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const senderLabel = document.createElement('strong');
    senderLabel.textContent = sender === 'user' ? 'You' : 'Syncro';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-content';
    
    // Process text to make URLs clickable
    const processedText = makeLinksClickable(text);
    textDiv.innerHTML = processedText;
    
    messageDiv.appendChild(senderLabel);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make URLs clickable (returns HTML)
function makeLinksClickable(text) {
    // Simple URL detection and replacement
    const urlRegex = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?)])(?![^<]*>)/g;
    
    return text.replace(urlRegex, url => {
        const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" 
                class="chat-link">
                ${cleanUrl}
               </a>`;
    });
}

// Show typing indicator
function showTyping() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Hide typing indicator
function hideTyping() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Send message when button clicked
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();
    
    const reply = await sendToAI(message);
    addMessage(reply, 'ai');
});

// Enter key support
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// Add CSS for links
const linkCSS = `
.chat-link {
    color: #06b6d4;
    text-decoration: underline;
    font-weight: 500;
    word-break: break-all;
    transition: color 0.2s;
}

.chat-link:hover {
    color: #22d3ee;
    text-decoration: none;
}

/* Mobile friendly */
@media (max-width: 768px) {
    .chat-link {
        font-size: 15px;
        padding: 1px 0;
    }
}
`;

// Inject CSS
if (!document.querySelector('#chat-link-styles')) {
    const style = document.createElement('style');
    style.id = 'chat-link-styles';
    style.textContent = linkCSS;
    document.head.appendChild(style);
}

// Initialize chat on load
document.addEventListener('DOMContentLoaded', () => {
    // Focus input
    if (userInput) {
        userInput.focus();
    }
    
    // Add welcome message after a brief delay
    setTimeout(() => {
        if (chatMessages && chatMessages.children.length === 0) {
            addMessage("Hello! I'm Syncro, your AI assistant. I can help with general questions or information about our tech products and services. How can I assist you today?", 'ai');
        }
    }, 800);
});

// Handle external link clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-link')) {
        e.preventDefault();
        window.open(e.target.href, '_blank', 'noopener,noreferrer');
    }
});
