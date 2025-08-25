/**
 * @class DeepSeekParser
 * @description Parser for DeepSeek to extract questions and chat history.
 */
class DeepSeekParser {
  /**
   * @method getQuestions
   * @description Extracts all user questions from the current DeepSeek conversation.
   * @returns {Array<{id: string, text: string}>} An array of question objects, each with a unique ID and the question text.
   */
  getQuestions() {
    const questions = [];
    const userMessages = document.querySelectorAll('.user-message, [data-author="user"]');
    
    userMessages.forEach((message, index) => {
      const textElement = message.querySelector('.content, .message-text');
      if (textElement && textElement.textContent.trim()) {
        const text = textElement.textContent.trim();
        const messageId = `deepseek-user-${index}`;
        message.id = messageId;
        
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
   * @description Extracts the list of previous chats from the DeepSeek sidebar.
   * @returns {Array<{id: string, title: string, url: string}>} An array of chat objects, each with a unique ID, title, and URL.
   */
  getChats() {
    const chats = [];
    const chatItems = document.querySelectorAll('.chat-history-item a, [data-testid="chat-history"] a');
    
    chatItems.forEach((item, index) => {
      const titleElement = item.querySelector('.title, .chat-title');
      if (titleElement && titleElement.textContent.trim()) {
        const title = titleElement.textContent.trim();
        const href = item.href;
        const chatId = `deepseek-chat-${index}`;
        
        chats.push({
          id: chatId,
          title: title,
          url: href
        });
      }
    });

    return chats;
  }
}

/**
 * @function initDeepSeekNavigator
 * @description Initializes the Chat Navigator for DeepSeek.
 */
function initDeepSeekNavigator() {
  if (window.chatNavigatorInitialized) return;
  
  const parser = new DeepSeekParser();
  const ui = new ChatNavigatorUI(parser);
  
  window.chatNavigatorInitialized = true;
  console.log('DeepSeek Navigator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDeepSeekNavigator, 2000);
  });
} else {
  setTimeout(initDeepSeekNavigator, 2000);
}
