/**
 * @class GeminiParser
 * @description Parser for Google Gemini to extract questions and chat history.
 */
class GeminiParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Gemini conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Gemini user messages
    const userSelectors = [
      '[data-test-id="user-message"]',
      '.user-message',
      '[class*="user"]',
      '[data-role="user"]',
      '.human-message',
      '.prompt-input'
    ];
    
    let userMessages = [];
    userSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    // Also look in conversation containers
    const conversationMessages = document.querySelectorAll('.conversation [class*="message"], [class*="chat"] [class*="message"], .response-container [class*="user"]');
    conversationMessages.forEach(msg => {
      if (msg.textContent && 
          !msg.querySelector('[class*="model"]') && 
          !msg.querySelector('[class*="assistant"]') &&
          !msg.textContent.includes('Gemini:') &&
          !msg.textContent.includes('Bard:')) {
        userMessages.push(msg);
      }
    });
    
    userMessages.forEach((message, index) => {
      let textElement = message.querySelector('.markdown, .prose, .message-content, .text-content') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        if (text.length < 10 || text.match(/^(Gemini|Bard|AI):/i)) {
          return;
        }
        
        const messageId = message.id || `gemini-user-${index}`;
        if (!message.id) {
          message.id = messageId;
        }
        
        questions.push({
          id: messageId,
          text: text.length > 100 ? text.substring(0, 100) + '...' : text
        });
      }
    });

    return questions;
  }

  /**
   * @method getChats
   * @description Extracts the list of previous chats from the Gemini sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat history in Gemini
    const chatSelectors = [
      'a[href*="/chat/"]',
      'a[href*="/app/"]',
      '.chat-item',
      '.conversation-item',
      '[class*="history"] a',
      '[class*="recent"] a',
      '.thread-item'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      let titleElement = item.querySelector('.title, .chat-title, [class*="title"], .conversation-name') || item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        let chatId = 'gemini-chat-' + index;
        if (href) {
          const match = href.match(/\/(chat|app)\/([^\/\?]+)/);
          if (match) {
            chatId = 'gemini-chat-' + match[2];
          }
        }
        
        chats.push({
          id: chatId,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          url: href
        });
      }
    });

    // Check for current conversation title
    if (chats.length === 0) {
      const titleElement = document.querySelector('h1, .conversation-title, .chat-title, [class*="title"]');
      if (titleElement && titleElement.textContent.trim() && !titleElement.textContent.includes('Gemini')) {
        chats.push({
          id: 'gemini-current-chat',
          title: titleElement.textContent.trim(),
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initGeminiNavigator
 * @description Initializes the Chat Navigator for Google Gemini.
 */
function initGeminiNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new GeminiParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Gemini Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGeminiNavigator, 2000);
  });
} else {
  setTimeout(initGeminiNavigator, 2000);
}
