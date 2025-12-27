// File: api/chat.js (Business Version)
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
        
        // ===== BUSINESS PRODUCT DATABASE =====
        const PRODUCTS = {
            "web-templates": {
                name: "Premium Web Templates",
                description: "Responsive, modern website templates for businesses",
                price: "$49-$199",
                features: ["Fully responsive", "SEO optimized", "Easy customization", "Free updates"],
                bestFor: "Startups, small businesses, freelancers",
                link: "/products/templates"
            },
            "saas-boilerplate": {
                name: "SaaS Starter Kit",
                description: "Complete SaaS application boilerplate with auth, payments, dashboard",
                price: "$299 (one-time)",
                features: ["User authentication", "Stripe payments", "Admin dashboard", "API ready", "Documentation"],
                bestFor: "Developers launching SaaS products",
                link: "/products/saas-kit"
            },
            "ai-chat-system": {
                name: "AI Chat System",
                description: "Customizable AI assistant system (exactly what you're using now)",
                price: "$199 (one-time) or $29/month",
                features: ["Multiple AI providers", "Custom knowledge base", "Admin panel", "Analytics", "Easy setup"],
                bestFor: "Businesses wanting AI customer support",
                link: "/products/ai-chat"
            },
            "custom-development": {
                name: "Custom Development",
                description: "Tailored web applications and systems built to your specifications",
                price: "Custom quote (starts from $999)",
                features: ["Full customization", "Dedicated support", "Source code ownership", "3 months maintenance"],
                bestFor: "Businesses with specific, unique needs",
                link: "/contact"
            }
        };
        
        // Detect relevant products
        const detectProducts = (text) => {
            text = text.toLowerCase();
            const matches = [];
            
            if (text.includes('template') || text.includes('website') || text.includes('design')) {
                matches.push('web-templates');
            }
            if (text.includes('saas') || text.includes('software') || text.includes('app')) {
                matches.push('saas-boilerplate');
            }
            if (text.includes('chat') || text.includes('ai') || text.includes('assistant')) {
                matches.push('ai-chat-system');
            }
            if (text.includes('custom') || text.includes('build') || text.includes('develop')) {
                matches.push('custom-development');
            }
            if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
                return Object.keys(PRODUCTS);
            }
            if (text.includes('what do you sell') || text.includes('products') || text.includes('offer')) {
                return Object.keys(PRODUCTS);
            }
            
            return matches;
        };
        
        const relevantProducts = detectProducts(message);
        
        // Build enhanced prompt
        let enhancedPrompt = system_instruction || "You are Syncro, AI assistant for SyncroTech Solutions.";
        
        if (relevantProducts.length > 0) {
            enhancedPrompt += `\n\nRELEVANT PRODUCTS FOR THIS QUERY:`;
            relevantProducts.forEach(productKey => {
                const p = PRODUCTS[productKey];
                enhancedPrompt += `\n\nPRODUCT: ${p.name}`;
                enhancedPrompt += `\nDESCRIPTION: ${p.description}`;
                enhancedPrompt += `\nPRICE: ${p.price}`;
                enhancedPrompt += `\nFEATURES: ${p.features.join(', ')}`;
                enhancedPrompt += `\nBEST FOR: ${p.bestFor}`;
            });
            enhancedPrompt += `\n\nUse this product information in your response. If appropriate, suggest the most relevant product.`;
        }
        // ===== END BUSINESS LOGIC =====
        
        const messages = [
            {
                role: "system",
                content: enhancedPrompt
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
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 400,
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
        
        const replyText = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again or contact our support.";
        
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: replyText }]
                }
            }],
            metadata: {
                suggestedProducts: relevantProducts.map(key => PRODUCTS[key]),
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
}        
