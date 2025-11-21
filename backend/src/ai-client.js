const axios = require('axios');

class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  shouldEscalateToHuman(userMessage, conversationHistory = []) {
    const escalationKeywords = [
      'talk to human', 'speak to agent', 'real person', 'human agent',
      'live agent', 'customer service', 'support agent', 'talk to person',
      'not a bot', 'get human', 'human help', 'agent please',
      'representative', 'operator', 'customer care', 'human being',
      'actual person', 'real human', 'person please', 'agent now',
      'connect to agent', 'transfer to human', 'human support'
    ];

    const frustrationKeywords = [ // 🆕 ADD FRUSTRATION KEYWORDS
      'frustrated', 'angry', 'upset', 'not helping', 'useless',
      'waste of time', 'stupid', 'dumb', 'idiot', 'can\'t help',
      'again', 'repeat', 'same question', 'not working'
    ];

    const message = userMessage.toLowerCase();
    
    // Check for direct escalation requests
    const hasEscalationKeyword = escalationKeywords.some(keyword => 
      message.includes(keyword)
    );

    // 🆕 CHECK FOR FRUSTRATION
    const isFrustrated = frustrationKeywords.some(keyword =>
      message.includes(keyword)
    );

    // Check if user is frustrated (multiple similar questions)
    const isRepeating = this.detectRepetition(conversationHistory);
    
    // Check if question is too complex for AI
    const isComplexQuestion = this.isComplexQuestion(userMessage);

    return hasEscalationKeyword || isFrustrated || isRepeating || isComplexQuestion;
  }

  detectRepetition(conversationHistory) { // 🆕 RENAME METHOD FOR CLARITY
    if (conversationHistory.length < 3) return false;
    
    const recentUserMessages = conversationHistory
      .filter(msg => msg.sender === 'user')
      .slice(-3)
      .map(msg => msg.text.toLowerCase());
    
    if (recentUserMessages.length < 2) return false;
    
    // Check if last two user messages are very similar
    const lastMessage = recentUserMessages[recentUserMessages.length - 1];
    const previousMessage = recentUserMessages[recentUserMessages.length - 2];
    
    const similarity = this.getSimilarityScore(lastMessage, previousMessage);
    return similarity > 0.6; // 60% similar
  }

  detectFrustration(conversationHistory) { // 🆕 KEEP BOTH METHODS FOR NOW
    if (conversationHistory.length < 3) return false;
    
    const recentMessages = conversationHistory.slice(-3);
    const similarQuestions = recentMessages.filter(msg => 
      msg.sender === 'user' && 
      msg.text.length > 10 &&
      this.getSimilarityScore(msg.text, recentMessages[0].text) > 0.7
    );
    
    return similarQuestions.length >= 2;
  }

  isComplexQuestion(message) {
    const complexIndicators = [
      'refund', 'complaint', 'billing issue', 'technical problem',
      'escalate', 'manager', 'supervisor', 'cancel service',
      'legal', 'payment issue', 'account problem', 'credit card',
      'billing dispute', 'service cancellation', 'contract',
      'lawsuit', 'attorney', 'lawyer', 'police'
    ];
    
    return complexIndicators.some(indicator => 
      message.toLowerCase().includes(indicator)
    );
  }

  getSimilarityScore(text1, text2) {
    // Simple word-based similarity check
    const words1 = text1.split(/\s+/).filter(word => word.length > 3);
    const words2 = text2.split(/\s+/).filter(word => word.length > 3);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  async generateResponse(userMessage, conversationHistory = [], sessionId = null) {
    // 🆕 FIRST: Check if we should escalate to human
    if (this.shouldEscalateToHuman(userMessage, conversationHistory)) {
      console.log(`🚨 AI detected escalation request: "${userMessage}"`);
      return {
        shouldEscalate: true,
        response: "I understand you'd like to speak with a human agent. Let me connect you with one of our support specialists who can provide more detailed assistance!"
      };
    }

    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `You are a helpful customer support assistant for a business. 
                   Be concise, friendly, and helpful. Keep responses under 3 sentences.
                   If you don't know something, suggest escalating to a human agent.
                   IMPORTANT: If the user asks to speak with a human, agent, or real person,
                   politely acknowledge and say you'll connect them.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'mistralai/mistral-7b-instruct:free', // Free model
          messages: messages,
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Chat Widget Generator'
          },
          timeout: 10000
        }
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      
      // 🆕 SECOND: Double-check the AI response for escalation keywords
      // Sometimes the AI might mention escalation in its response
      const escalationCheck = this.shouldEscalateToHuman(aiResponse, conversationHistory);
      if (escalationCheck) {
        console.log(`🚨 AI response triggered escalation: "${aiResponse}"`);
        return {
          shouldEscalate: true,
          response: "I understand you'd like to speak with a human agent. Let me connect you with one of our support specialists right away!"
        };
      }

      return aiResponse;

    } catch (error) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      
      // 🆕 THIRD: Check fallback response for escalation
      const fallbackResponse = this.getFallbackResponse(userMessage);
      const fallbackEscalation = this.shouldEscalateToHuman(fallbackResponse, conversationHistory);
      
      if (fallbackEscalation) {
        return {
          shouldEscalate: true,
          response: "I understand you'd like to speak with a human agent. Let me connect you with one of our support specialists who can provide more detailed assistance!"
        };
      }
      
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  // Fallback responses if OpenRouter fails
  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
  
    // 🆕 Check for escalation in fallback too
    if (this.shouldEscalateToHuman(userMessage, [])) {
      return "I understand you'd like to speak with a human agent. Let me connect you with one of our support specialists!";
    }
  
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help. What can I assist you with today?";
    } else if (message.includes('help')) {
      return "I'd be happy to help! Could you tell me more about what you need assistance with?";
    } else if (message.includes('price') || message.includes('cost')) {
      return "I can help with pricing information. Let me connect you with our sales team for detailed pricing.";
    } else if (message.includes('bye') || message.includes('thank')) {
      return "You're welcome! Feel free to reach out if you have any more questions.";
    } else {
      return "Thanks for your message! I understand you're looking for assistance. How can I help you today?";
    }
  }
}

module.exports = new OpenRouterClient();