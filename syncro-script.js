// ========== SYNCRO AI CHATBOT SCRIPT ==========
// Replace 'YOUR_GEMINI_API_KEY' with your actual API key from Google AI Studio.
const API_URL = '/api/chat';  // Call YOUR backend, not Gemini directly
// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// System Instruction to train Syncro about your website
// This is the most important part! Customize this text.
const SYSTEM_INSTRUCTION = `
You are Syncro, the friendly and helpful AI assistant for the tech blog website "RJSyncro".

About RJSyncro:
- It is a tech blog created by RJ.
- The website focuses on technology, web development, coding tutorials, design, and digital lifestyle.
- The website has a dark theme with cyan accent colors.
- The blog covers topics like: Web Development, UI/UX Design, Productivity, Technology Trends, Minimalism, and Tech Tools.
- The website's tagline is "Welcome to the best tech web".
- The creator, RJ, is passionate about exploring the intersection of technology and creativity.

Your Personality:
- Be enthusiastic about technology and helping users.
- If someone asks about the website, its topics, or the creator, use the information above.
- You can also answer general questions about technology, coding, and related fields.
- Keep your responses clear, concise, and engaging.
- If you don't know something, admit it politely.

Start every conversation with a warm greeting as outlined in the initial message.
`;

// Function to add a message to the chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';

    // Handle line breaks in the text
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    paragraphs.forEach(p => {
        const pElem = document.createElement('p');
        pElem.textContent = p;
        content.appendChild(pElem);
    });

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);

    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show/hide the typing indicator
function showTyping() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTyping() {
    typingIndicator.style.display = 'none';
}

// Function to send message to Gemini API
async function sendToAI(userMessage) {
    showTyping();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
  message: userMessage,  // You need to pass the actual message
  system_instruction: SYSTEM_INSTRUCTION
})
                contents: [{
                    parts: [{
                        // Combine system instruction with the user's question
                        text: SYSTEM_INSTRUCTION + `\n\nUser: ${userMessage}\nSyncro:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let aiResponse = "I apologize, I couldn't process that at the moment.";

        // Extract the AI's response text from the API response
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            aiResponse = data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected API response structure:', data);
        }

        hideTyping();
        addMessage(aiResponse, 'bot');

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        hideTyping();
        addMessage(`Sorry, I'm experiencing a technical issue. (Error: ${error.message}) Please try again in a moment.`, 'bot');
    }
}

// Function to handle sending a message
function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();

    // Send to AI
    sendToAI(message);
}

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// Focus the input field when page loads
window.onload = function() {
    userInput.focus();
};
