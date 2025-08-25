/**
 * @class ChatGPTParser
 * @description Parser for ChatGPT to extract questions and chat history.
 */
class ChatGPTParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current ChatGPT conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    
    // ChatGPT user messages are typically in divs with specific classes
    // This selector targets user messages in the conversation
    const userMessages = document.querySelectorAll('[data-message-author-role="user"]');
    
    userMessages.forEach((message, index) => {
      const textElement = message.querySelector('.prose, [class*="markdown"], .whitespace-pre-wrap, .break-words');
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        
        // Generate unique ID for the message
        const messageId = message.id || `chatgpt-user-${index}`;
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
   * @description Extracts the list of previous chats from the ChatGPT sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    
    // Look for chat items in the sidebar
    const chatItems = document.querySelectorAll('nav a[href*="/c/"], .relative.grow.overflow-hidden.whitespace-nowrap');
    
    chatItems.forEach((item, index) => {
      // Try different selectors for chat titles
      let titleElement = item.querySelector('.truncate') || 
                        item.querySelector('[class*="truncate"]') || 
                        item.querySelector('.overflow-hidden') ||
                        item;
      
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href || item.closest('a')?.href;
        
        // Generate ID from href or index
        let chatId = 'chat-' + index;
        if (href) {
          const match = href.match(/\/c\/([^\/]+)/);
          if (match) {
            chatId = 'chat-' + match[1];
          }
        }
        
        chats.push({
          id: chatId,
          title: title,
          url: href
        });
      }
    });

    // If no sidebar chats found, try to find conversation title
    if (chats.length === 0) {
      const titleElement = document.querySelector('h1, .text-xl, .text-lg, [class*="conversation-title"]');
      if (titleElement && titleElement.textContent.trim()) {
        chats.push({
          id: 'current-chat',
          title: titleElement.textContent.trim(),
          url: window.location.href
        });
      }
    }

    return chats;
  }
}

/**
 * @function initChatGPTNavigator
 * @description Initializes the Chat Navigator for ChatGPT.
 */
function initChatGPTNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new ChatGPTParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('ChatGPT Navigator initialized');
}

// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatGPTNavigator);
} else {
  // Page already loaded
  setTimeout(initChatGPTNavigator, 1000);
}
