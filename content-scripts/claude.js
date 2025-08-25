/**
 * @class ClaudeParser
 * @description Parser for Claude.ai to extract questions and chat history.
 */
class ClaudeParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current Claude.ai conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // Claude user messages are typically in specific containers
    // Look for user messages in the conversation
    const userMessages = document.querySelectorAll('[data-is-streaming="false"] .font-user-message, .human-message, [class*="user"], [data-testid*="user"]');
    
    // Also try more general selectors for user content
    const alternativeSelectors = [
      '.prose.break-words:not(.font-claude-message)',
      '.whitespace-pre-wrap:not([class*="assistant"])',
      '.message-content[data-author="human"]'
    ];
    
    let allUserMessages = [...userMessages];
    
    // Try alternative selectors if no messages found
    if (allUserMessages.length === 0) {
      alternativeSelectors.forEach(selector => {
        const messages = document.querySelectorAll(selector);
        allUserMessages = [...allUserMessages, ...messages];
      });
    }
    
    // Also look for messages in conversation divs
    const conversationMessages = document.querySelectorAll('.conversation .message, [class*="conversation"] [class*="message"]');
    conversationMessages.forEach(msg => {
      // Check if this looks like a user message (not assistant)
      if (!msg.textContent.includes('Claude:') && 
          !msg.querySelector('[class*="assistant"]') &&
          !msg.querySelector('.font-claude-message')) {
        allUserMessages.push(msg);
      }
    });
    
    allUserMessages.forEach((message, index) => {
      let textElement = message.querySelector('.prose, [class*="markdown"], .whitespace-pre-wrap') || message;
      
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        // Skip very short texts or obvious non-questions
        if (text.length < 10 || text.match(/^(Claude|Assistant|AI):/i)) {
          return;
        }
        
        // Generate unique ID for the message
        const messageId = message.id || `claude-user-${index}`;
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
   * @description Extracts the list of previous chats from the Claude.ai sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat items in Claude's sidebar
    const chatSelectors = [
      'a[href*="/chat/"]',
      '.conversation-item',
      '[class*="conversation-list"] a',
      '[class*="sidebar"] a[href*="/chat"]',
      '.chat-history-item'
    ];
    
    let chatItems = [];
    chatSelectors.forEach(selector => {
      chatItems = [...chatItems, ...document.querySelectorAll(selector)];
    });
    
    chatItems.forEach((item, index) => {
      // Try different selectors for chat titles
      let titleElement = item.querySelector('.truncate') || 
                        item.querySelector('[class*="truncate"]') || 
                        item.querySelector('.overflow-hidden') ||
                        item.querySelector('.conversation-title') ||
                        item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        
        // Generate ID from href or index
        let chatId = 'claude-chat-' + index;
        if (href) {
          const match = href.match(/\/chat\/([^\/\?]+)/);
          if (match) {
            chatId = 'claude-chat-' + match[1];
          }
        }
        
        chats.push({
          id: chatId,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          url: href
        });
      }
    });

    // If no sidebar chats found, try to get current conversation info
    if (chats.length === 0) {
      // Look for conversation title in various places
      const titleSelectors = [
        'h1',
        '.conversation-title', 
        '[class*="title"]',
        '.text-xl',
        '.text-lg'
      ];
      
      for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
          const title = titleElement.textContent.trim();
          if (title && title !== 'Claude' && !title.match(/^(New|Untitled)/i)) {
            chats.push({
              id: 'claude-current-chat',
              title: title.length > 50 ? title.substring(0, 50) + '...' : title,
              url: window.location.href
            });
            break;
          }
        }
      }
    }

    return chats;
  }
}

/**
 * @function initClaudeNavigator
 * @description Initializes the Chat Navigator for Claude.ai.
 */
function initClaudeNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new ClaudeParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('Claude Navigator initialized');
}

// Wait for page to load and Claude app to initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initClaudeNavigator, 1500);
  });
} else {
  // Page already loaded, wait a bit for Claude to initialize
  setTimeout(initClaudeNavigator, 1500);
}
