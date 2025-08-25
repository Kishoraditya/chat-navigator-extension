/**
 * @class GrokParser
 * @description Parser for Grok to extract questions and chat history.
 */
class GrokParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Grok conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Grok user messages - try multiple selectors
    const userSelectors = [
      '[data-testid="user-message"]',
      '.user-message',
      '[class*="user"]',
      '.message-user',
      '[data-role="user"]',
      '.human-message'
    ];
    
    let userMessages = [];
    userSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    // Also try to find messages in conversation containers
    const conversationMessages = document.querySelectorAll('.conversation .message, [class*="conversation"] [class*="message"], [class*="chat"] [class*="message"]');
    conversationMessages.forEach(msg => {
      // Check if this looks like a user message
      if (msg.textContent && 
          !msg.querySelector('[class*="bot"]') && 
          !msg.querySelector('[class*="assistant"]') &&
          !msg.textContent.includes('Grok:')) {
        userMessages.push(msg);
      }
    });
    
    userMessages.forEach((message, index) => {
      let textElement = message.querySelector('.prose, [class*="markdown"], .whitespace-pre-wrap, .message-content') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        // Skip very short texts or obvious non-questions
        if (text.length < 10 || text.match(/^(Grok|Bot|AI):/i)) {
          return;
        }
        
        const messageId = message.id || `grok-user-${index}`;
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
   * @description Extracts the list of previous chats from the Grok sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat items in Grok's interface
    const chatSelectors = [
      'a[href*="/chat/"]',
      'a[href*="/conversation/"]',
      '.chat-item',
      '.conversation-item',
      '[class*="chat-list"] a',
      '[class*="sidebar"] a',
      '.history-item'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      let titleElement = item.querySelector('.title, .name, .chat-title, [class*="title"]') || item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        let chatId = 'grok-chat-' + index;
        if (href) {
          const match = href.match(/\/(chat|conversation)\/([^\/\?]+)/);
          if (match) {
            chatId = 'grok-chat-' + match[2];
          }
        }
        
        chats.push({
          id: chatId,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          url: href
        });
      }
    });

    // If no chats found, try to get current conversation
    if (chats.length === 0) {
      const titleElement = document.querySelector('h1, .page-title, .conversation-title');
      if (titleElement && titleElement.textContent.trim()) {
        chats.push({
          id: 'grok-current-chat',
          title: titleElement.textContent.trim(),
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initGrokNavigator
 * @description Initializes the Chat Navigator for Grok.
 */
function initGrokNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new GrokParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Grok Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGrokNavigator, 2000);
  });
} else {
  setTimeout(initGrokNavigator, 2000);
}
