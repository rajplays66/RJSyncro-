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
    // PRODUCT BUTTONS FUNCTION - ADD THIS WHERE IT WAS CUT OFF
function showProductButtons(products) {
    // Remove any existing product buttons
    const existingButtons = document.querySelectorAll('.product-button');
    existingButtons.forEach(button => button.remove());
    
    // Create container for product buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'product-buttons-container';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.gap = '8px';
    
    // Create a button for each suggested product
    products.forEach(product => {
        const button = document.createElement('button');
        button.className = 'product-button';
        button.textContent = product.name || `Product: ${product.id}`;
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        
        // Add click handler for product selection
        button.addEventListener('click', () => {
            userInput.value = `Tell me more about ${product.name || 'this product'}`;
            sendbutton.click();
        });
        
        buttonContainer.appendChild(button);
    });
    
    // Add the buttons to the chat
    chatMessages.appendChild(buttonContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
// ===== PRODUCT BUTTONS FUNCTION =====
function showProductButtons(products) {
    // Remove any existing product buttons
    const existingButtons = document.querySelector('.product-buttons');
    if (existingButtons) {
        existingButtons.remove();
    }
    
    // Create container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'product-buttons';
    buttonContainer.style.cssText = `
        margin: 15px 0;
        padding: 15px;
        background: #f8fafc;
        border-radius: 10px;
        border-left: 4px solid #667eea;
    `;
    
    // Add title
    const title = document.createElement('p');
    title.textContent = '📦 Related Products:';
    title.style.cssText = `
        margin-bottom: 10px;
        font-weight: 600;
        color: #2d3748;
    `;
    buttonContainer.appendChild(title);
    
    // Add buttons for each product
    products.forEach(product => {
        const button = document.createElement('button');
        button.textContent = `🔍 ${product.name} (${product.price})`;
        button.style.cssText = `
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            margin: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        `;
        button.onmouseover = () => {
            button.style.background = '#667eea';
            button.style.color = 'white';
            button.style.borderColor = '#667eea';
        };
        button.onmouseout = () => {
            button.style.background = 'white';
            button.style.color = 'black';
            button.style.borderColor = '#e2e8f0';
        };
        button.onclick = () => {
            document.getElementById('userInput').value = `Tell me more about ${product.name}`;
            document.getElementById('sendButton').click();
        };
        buttonContainer.appendChild(button);
    });
    
    // Add to chat
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.appendChild(buttonContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
// ===== END PRODUCT BUTTONS =====
// ===== CLICKABLE LINKS FIX =====
function makeLinksClickable() {
    // Find all AI messages
    const aiMessages = document.querySelectorAll('.ai-message, .bot-message');
    
    aiMessages.forEach(message => {
        // Convert URLs to clickable links
        const html = message.innerHTML;
        
        // URL detection regex
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        // Replace URLs with clickable links
        const withLinks = html.replace(urlRegex, function(url) {
            // Clean up URL (remove trailing punctuation)
            let cleanUrl = url.replace(/[.,;:!?)]+$/, '');
            
            // Check if already a link
            if (cleanUrl.includes('href=')) return url;
            
            // Make it clickable
            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${cleanUrl}</a>`;
        });
        
        // Update only if changed
        if (withLinks !== html) {
            message.innerHTML = withLinks;
        }
    });
    
    // Add click event to newly created links
    document.querySelectorAll('.chat-link').forEach(link => {
        link.onclick = function(e) {
            e.stopPropagation(); // Prevent bubbling
            window.open(this.href, '_blank');
            return false;
        };
    });
}

// Call after adding any new message
const originalAddMessage = addMessage;
addMessage = function(text, sender) {
    originalAddMessage(text, sender);
    
    // Make links clickable after a short delay
    setTimeout(makeLinksClickable, 100);
    
    // Lead capture logic (if you added it)
    if (window.messageCount !== undefined) {
        window.messageCount++;
        if (window.messageCount === 3 && typeof showLeadModal === 'function') {
            setTimeout(showLeadModal, 1000);
        }
    }
};

// Also add CSS for links
const linkCSS = `
.chat-link {
    color: #667eea;
    text-decoration: underline;
    font-weight: 600;
    word-break: break-all;
}

.chat-link:hover {
    color: #764ba2;
    text-decoration: none;
}

/* Mobile link fix */
@media (max-width: 768px) {
    .chat-link {
        font-size: 14px;
        padding: 2px 0;
        display: inline-block;
    }
}
`;

// Inject the CSS
const style = document.createElement('style');
style.textContent = linkCSS;
document.head.appendChild(style);

// Initial call to make existing links clickable
setTimeout(makeLinksClickable, 500);
// ===== END CLICKABLE LINKS =====
