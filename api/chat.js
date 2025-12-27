// File: api/chat.js (Groq with Llama 3.3)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, system_instruction } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const API_KEY = process.env.GROQ_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
        }
        
        const messages = [
            {
                role: "system",
                content: system_instruction || "You are Syncro, AI assistant for RJSyncro tech blog. Help with web development, tech tools, and blog topics."
            },
            {
                role: "user",
                content: message
            }
        ];
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // ← CHANGED TO THIS
                messages: messages,
                max_tokens: 300,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Groq Error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'API error' 
            });
        }
        
        const replyText = data.choices?.[0]?.message?.content || "No response.";
        
        // Keep your frontend format
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: replyText }]
                }
            }]
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
}
