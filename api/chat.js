// File: api/chat.js (Business Version)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // ===== FILE UPLOAD HANDLING =====
    if (req.body.fileData) {
        const fileText = await processFile(req.body.fileData);
        req.body.message = `${req.body.message}\n\nFile content: ${fileText}`;
    }
    // ===== END FILE UPLOAD =====
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
            
    // ===== IMPROVED WEB TEMPLATES DETECTION =====
    if (text.includes('template') || text.includes('website') || text.includes('web design') || 
        text.includes('landing page') || text.includes('portfolio site') || 
        text.includes('business website') || text.includes('ecommerce site') ||
        text.includes('wordpress') || text.includes('html template')) {
        matches.push('web-templates');
    }
    
    // ===== IMPROVED SAAS DETECTION =====
    if (text.includes('saas') || text.includes('software') || text.includes('app') || 
        text.includes('application') || text.includes('dashboard') || 
        text.includes('admin panel') || text.includes('user management') ||
        text.includes('subscription') || text.includes('monthly plan')) {
        matches.push('saas-boilerplate');
    }
    
    // ===== IMPROVED AI CHAT DETECTION =====
    if (text.includes('chat') || text.includes('ai') || text.includes('assistant') || 
        text.includes('bot') || text.includes('chatbot') || text.includes('chat gpt') ||
        text.includes('customer support') || text.includes('automated reply') ||
        text.includes('what you are using') || text.includes('like this')) {
        matches.push('ai-chat-system');
    }
    
    // ===== IMPROVED CUSTOM DEV DETECTION =====
    if (text.includes('custom') || text.includes('build') || text.includes('develop') || 
        text.includes('create') || text.includes('make me') || text.includes('hire') ||
        text.includes('contract') || text.includes('freelance') || 
        text.includes('from scratch') || text.includes('bespoke')) {
        matches.push('custom-development');
    }
    
    // ===== PRICING QUESTIONS =====
    if (text.includes('price') || text.includes('cost') || text.includes('how much') || 
        text.includes('pricing') || text.includes('$$') || text.includes('expensive') ||
        text.includes('affordable') || text.includes('budget')) {
        return Object.keys(PRODUCTS); // Show all products
    }
    
    // ===== GENERAL PRODUCT QUESTIONS =====
    if (text.includes('what do you sell') || text.includes('products') || 
        text.includes('offer') || text.includes('services') || 
        text.includes('what can you do') || text.includes('business offer')) {
        return Object.keys(PRODUCTS);
    }
    // ===== BUSINESS FAQ DATABASE =====
const BUSINESS_FAQ = {
    "how to buy": "You can purchase directly on our website with credit card or PayPal. Most products offer instant digital delivery.",
    "how to purchase": "Visit our website, select your product, add to cart, and checkout. You'll receive download links immediately.",
    "support": "Email us at support@synchrotech.com or use our contact form. We reply within 24 hours.",
    "contact": "Email: hello@synchrotech.com | Phone: +1 (555) 123-4567 (Mon-Fri 9AM-6PM)",
    "refund": "We offer 30-day money-back guarantee on digital products if you're not satisfied.",
    "license": "All products come with commercial license. You can use them for client projects.",
    "updates": "Products include 1 year of free updates. You'll get notifications when new versions are released.",
    "requirements": "Our products work on any modern browser. Some require basic HTML/CSS knowledge.",
    "customization": "Yes! All products are fully customizable. We provide documentation and examples.",
    "team": "We're a team of 5 developers and designers based in San Francisco, founded in 2023.",
    "discount": "We offer 20% student discount and bulk discounts for 3+ products. Contact sales.",
    "demo": "You can request a live demo by contacting our sales team. We'll schedule a Zoom call.",
    "integration": "Our products integrate with popular tools like Stripe, Mailchimp, Google Analytics.",
    "timeline": "Digital products: Instant delivery | Custom projects: 2-8 weeks depending on scope."
};

// Helper to check FAQ
const checkFAQ = (text) => {
    text = text.toLowerCase();
    for (const [keyword, answer] of Object.entries(BUSINESS_FAQ)) {
        if (text.includes(keyword)) {
            return answer;
        }
    }
    return null;
};
// ===== END FAQ =====
    return matches;
};
        const relevantProducts = detectProducts(message);
       // ===== REAL-TIME DATA =====
const realTimeData = await getRealTimeData(message);
if (realTimeData) {
    enhancedPrompt += `\n\nREAL-TIME DATA:\n${realTimeData}`;
}
// ===== END REAL-TIME DATA =====
        // ===== WEB SEARCH ENHANCEMENT =====
const shouldSearchWeb = message.includes('current') || 
                       message.includes('today') || 
                       message.includes('news') ||
                       message.includes('weather') ||
                       message.includes('latest');

let webResults = '';
if (shouldSearchWeb) {
    webResults = await searchWeb(message); // You need to create this function
    enhancedPrompt += `\n\nREAL-TIME INFORMATION:\n${webResults}`;
}
// ===== END WEB SEARCH =====
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
