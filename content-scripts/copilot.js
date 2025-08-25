/**
 * @class CopilotParser
 * @description Parser for Microsoft Copilot to extract questions and chat history.
 */
class CopilotParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Copilot conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Copilot/Bing Chat user messages
    const userSelectors = [
      '[data-author="user"]',
      '.user-message',
      '[class*="user"]',
      '.human-message',
      '[data-testid="user-message"]',
      '.msg-user'
    ];
    
    let userMessages = [];
    userSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    // Also check for Bing Chat specific selectors
    const bingSelectors = [
      '.ac-textBlock .ac-textRun',
      '.cib-serp-main [class*="user"]',
      '.b_sydConvCont [data-author="user"]',
      '.cib-chat-turn[data-author="user"]'
    ];
    
    bingSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    userMessages.forEach((message, index) => {
      let textElement = message.querySelector('.ac-textRun, .message-content, .text-content, p, div') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        if (text.length < 10 || text.match(/^(Copilot|Bing|AI):/i)) {
          return;
        }
        
        const messageId = message.id || `copilot-user-${index}`;
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
   * @description Extracts the list of previous chats from the Copilot sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat history in Copilot/Bing
    const chatSelectors = [
      'a[href*="/chat/"]',
      'a[href*="/conversations/"]',
      '.chat-item',
      '.conversation-item',
      '[class*="history"] a',
      '.cib-serp-main a',
      '.recent-chats a'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      let titleElement = item.querySelector('.title, .chat-title, [class*="title"], span, div') || item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        // Skip navigation items
        if (title.match(/^(Home|Settings|Help|About)/i)) {
          return;
        }
        
        let chatId = 'copilot-chat-' + index;
        if (href) {
          const match = href.match(/\/(chat|conversations?)\/([^\/\?]+)/);
          if (match) {
            chatId = 'copilot-chat-' + match[2];
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
      const titleElement = document.querySelector('h1, .conversation-title, [class*="title"]:not(.page-title)');
      if (titleElement && titleElement.textContent.trim() && 
          !titleElement.textContent.includes('Copilot') && 
          !titleElement.textContent.includes('Bing')) {
        chats.push({
          id: 'copilot-current-chat',
          title: titleElement.textContent.trim(),
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initCopilotNavigator
 * @description Initializes the Chat Navigator for Microsoft Copilot.
 */
function initCopilotNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new CopilotParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Copilot Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initCopilotNavigator, 2000);
  });
} else {
  setTimeout(initCopilotNavigator, 2000);
}
