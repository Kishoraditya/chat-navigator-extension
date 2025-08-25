/**
 * @class MetaParser
 * @description Parser for Meta AI to extract questions and chat history.
 */
class MetaParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Meta AI conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Meta AI user messages
    const userSelectors = [
      '[data-testid="user-message"]',
      '.user-message',
      '[class*="user"]',
      '[data-role="user"]',
      '.human-message',
      '.message-user'
    ];
    
    let userMessages = [];
    userSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    // Also look for messages in chat containers
    const chatMessages = document.querySelectorAll('.chat [class*="message"], [class*="conversation"] [class*="message"], .thread [class*="message"]');
    chatMessages.forEach(msg => {
      if (msg.textContent && 
          !msg.querySelector('[class*="bot"]') && 
          !msg.querySelector('[class*="assistant"]') &&
          !msg.textContent.includes('Meta AI:') &&
          !msg.classList.contains('ai-message')) {
        userMessages.push(msg);
      }
    });
    
    userMessages.forEach((message, index) => {
      let textElement = message.querySelector('.message-text, .content, .text, p, div') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        if (text.length < 10 || text.match(/^(Meta|AI|Bot):/i)) {
          return;
        }
        
        const messageId = message.id || `meta-user-${index}`;
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
   * @description Extracts the list of previous chats from the Meta AI sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat history in Meta AI
    const chatSelectors = [
      'a[href*="/chat/"]',
      'a[href*="/conversation/"]',
      '.chat-item',
      '.conversation-item',
      '[class*="history"] a',
      '[class*="thread-list"] a',
      '.recent-chat'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      let titleElement = item.querySelector('.title, .chat-title, [class*="title"], .conversation-name, span') || item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        let chatId = 'meta-chat-' + index;
        if (href) {
          const match = href.match(/\/(chat|conversation)\/([^\/\?]+)/);
          if (match) {
            chatId = 'meta-chat-' + match[2];
          }
        }
        
        chats.push({
          id: chatId,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          url: href
        });
      }
    });

    // Check for current conversation
    if (chats.length === 0) {
      const titleElement = document.querySelector('h1, .conversation-title, .page-title, [class*="title"]');
      if (titleElement && titleElement.textContent.trim() && !titleElement.textContent.includes('Meta AI')) {
        chats.push({
          id: 'meta-current-chat',
          title: titleElement.textContent.trim(),
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initMetaNavigator
 * @description Initializes the Chat Navigator for Meta AI.
 */
function initMetaNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new MetaParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Meta AI Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMetaNavigator, 2000);
  });
} else {
  setTimeout(initMetaNavigator, 2000);
}
