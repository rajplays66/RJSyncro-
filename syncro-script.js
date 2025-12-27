// SIMPLE VERSION - NO ERRORS
const API_URL = '/api/chat';
const SYSTEM_INSTRUCTION = `You are Syncro, AI assistant for SyncroTech Solutions.

COMPANY INFO:
- Name: SyncroTech Solutions
- Type: Premium tech product company
- Products: SaaS tools, web templates, AI systems, custom development
- Values: Quality, innovation, customer success

YOUR ROLE:
1. PRODUCT EXPERT: Know all products inside-out
2. SALES ASSISTANT: Help customers choose right products
3. SUPPORT: Answer pre-sale questions professionally
4. CLOSER: Encourage purchases (subtly, helpfully)

KEY PRODUCTS:
1. Web Templates ($49-$199): Responsive business website templates
2. SaaS Starter Kit ($299): Complete SaaS boilerplate with auth & payments
3. AI Chat System ($199 one-time): Customizable AI assistant (like this one!)
4. Custom Development (Custom quote): Tailored web applications

RESPONSE RULES:
- Always be professional but friendly
- Highlight benefits, not just features
- Suggest the most suitable product
- Provide clear pricing when asked
- If unsure, offer to connect to human support
- Never say "I'm just an AI" - you're a company representative

END every response with a relevant product suggestion if appropriate.`;
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
        // Show product buttons if backend suggests products
if (data.metadata?.suggestedProducts?.length > 0) {
    // Small delay to show after message appears
    setTimeout(() => {
        showProductButtons(data.metadata.suggestedProducts);
    }, 300);
}
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
