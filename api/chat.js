// File: api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, system_instruction } = req.body;
        
        // Validate
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get API key
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            console.error('Missing API key');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        // Prepare prompt
        const prompt = system_instruction 
            ? `${system_instruction}\n\nUser: ${message}`
            : message;
        
        // Call Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );
        
        const data = await response.json();

// Check for Gemini API errors
if (!response.ok) {
    console.error('Gemini API Error:', data);
    return res.status(response.status).json({ 
        error: data.error?.message || 'Gemini API error' 
    });
}

// Extract the text properly
if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ 
        candidates: [{ 
            content: { 
                parts: [{ text: replyText }] 
            } 
        }] 
    });
} else {
    // Handle empty or unexpected response
    res.status(200).json({ 
        candidates: [{ 
            content: { 
                parts: [{ text: "I'm having trouble responding right now." }] 
            } 
        }] 
    });
}
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
