/**
 * @class PerplexityParser
 * @description Parser for Perplexity AI to extract questions and chat history.
 */
class PerplexityParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Perplexity AI conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Perplexity user queries
    const userSelectors = [
      '[data-testid="user-query"]',
      '.user-query',
      '.query',
      '[class*="query"]',
      '.user-message',
      '[class*="user-input"]'
    ];
    
    let userMessages = [];
    userSelectors.forEach(selector => {
      userMessages = [...userMessages, ...document.querySelectorAll(selector)];
    });
    
    // Also look for input/query elements in threads
    const threadQueries = document.querySelectorAll('.thread .query, [class*="thread"] [class*="query"], .search-query, .question');
    threadQueries.forEach(query => {
      if (query && query.textContent.trim()) {
        userMessages.push(query);
      }
    });
    
    userMessages.forEach((message, index) => {
      let textElement = message.querySelector('.text, .content, .query-text') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        // Skip very short texts
        if (text.length < 10) {
          return;
        }
        
        const messageId = message.id || `perplexity-query-${index}`;
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
   * @description Extracts the list of previous chats from the Perplexity AI sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for thread/chat history in Perplexity
    const chatSelectors = [
      'a[href*="/search/"]',
      'a[href*="/thread/"]',
      '.thread-item',
      '.history-item',
      '[class*="history"] a',
      '[class*="thread-list"] a',
      '.search-history-item'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      let titleElement = item.querySelector('.title, .query, .search-title, [class*="title"]') || item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        let chatId = 'perplexity-thread-' + index;
        if (href) {
          const match = href.match(/\/(search|thread)\/([^\/\?]+)/);
          if (match) {
            chatId = 'perplexity-thread-' + match[2];
          }
        }
        
        chats.push({
          id: chatId,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          url: href
        });
      }
    });

    // If no threads found, check for current search
    if (chats.length === 0) {
      const currentQuery = document.querySelector('input[type="text"], .search-input, [placeholder*="search"], [placeholder*="Ask"]');
      if (currentQuery && currentQuery.value) {
        chats.push({
          id: 'perplexity-current-search',
          title: currentQuery.value,
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initPerplexityNavigator
 * @description Initializes the Chat Navigator for Perplexity AI.
 */
function initPerplexityNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new PerplexityParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Perplexity Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initPerplexityNavigator, 1500);
  });
} else {
  setTimeout(initPerplexityNavigator, 1500);
}
