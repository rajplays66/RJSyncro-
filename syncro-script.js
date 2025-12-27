    // ULTRA SIMPLE WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('sendButton');
    const input = document.getElementById('userInput');
    const messages = document.getElementById('chatMessages');
    
    if (!button || !input || !messages) {
        console.error('Missing elements! Check HTML IDs');
        return;
    }
    
    button.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        
        // Show user message
        addMessage('You: ' + text);
        input.value = '';
        
        // Send to AI
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: text})
            });
            
            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
            addMessage('Syncro: ' + aiText);
            
        } catch (error) {
            addMessage('Error: ' + error.message);
        }
    }
    
    function addMessage(text) {
        const div = document.createElement('div');
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
});
