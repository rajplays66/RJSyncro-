// File: api/chat.js - Secure backend for Syncro AI
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Get message from request
        const { message, system_instruction } = req.body;
        
        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Valid message is required' });
        }
        
        // Get API key from environment (secure!)
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            console.error('API key missing in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        // Prepare the prompt for Gemini
        let prompt = message;
        if (system_instruction) {
            prompt = `${system_instruction}\n\nUser: ${message}`;
        }
        
        // Call Google Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );
        
        // Parse response
        const data = await response.json();
        
        // Check for API errors
        if (!response.ok) {
            console.error('Gemini API error:', data);
            return res.status(response.status).json({
                error: data.error?.message || 'AI service error'
            });
        }
        
        // Return successful response
        return res.status(200).json(data);
        
    } catch (error) {
        // Handle unexpected errors
        console.error('Chat API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
