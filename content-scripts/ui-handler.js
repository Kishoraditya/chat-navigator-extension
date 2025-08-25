/**
 * @class ChatNavigatorUI
 * @description Handles the user interface for the Chat Navigator extension.
 * @param {object} parser - An instance of a platform-specific parser.
 */
class ChatNavigatorUI {
  constructor(parser) {
    this.parser = parser;
    this.container = null;
    this.activePanel = null;
    this.questions = [];
    this.chats = [];
    this.init();
  }

  /**
   * @method init
   * @description Initializes the UI by creating elements, binding events, and starting the observer.
   */
  init() {
    this.createUI();
    this.bindEvents();
    this.startObserver();
    this.updateContent();
  }

  /**
   * @method createUI
   * @description Creates the floating buttons and panels for the extension.
   */
  createUI() {
    // Remove existing container if present
    const existing = document.querySelector('.chat-navigator-container');
    if (existing) {
      existing.remove();
    }

    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'chat-navigator-container';
    this.container.innerHTML = `
      <div class="chat-navigator-buttons">
        <div class="chat-nav-button" data-type="questions" title="Questions">
          Q
        </div>
        <div class="chat-nav-button" data-type="chats" title="Chats">
          C
        </div>
      </div>
      
      <div class="chat-navigator-panel" data-panel="questions">
        <div class="panel-header">
          <h3 class="panel-title">Questions</h3>
        </div>
        <div class="panel-content">
          <div class="empty-state">No questions found</div>
        </div>
      </div>
      
      <div class="chat-navigator-panel" data-panel="chats">
        <div class="panel-header">
          <h3 class="panel-title">Chats</h3>
        </div>
        <div class="panel-content">
          <div class="empty-state">No chats found</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  /**
   * @method bindEvents
   * @description Binds click and keydown events to the UI elements.
   */
  bindEvents() {
    // Button click handlers
    this.container.querySelectorAll('.chat-nav-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.togglePanel(type);
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.closeAllPanels();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPanels();
      }
    });
  }

  /**
   * @method togglePanel
   * @description Toggles the visibility of the questions and chats panels.
   * @param {string} type - The type of panel to toggle ('questions' or 'chats').
   */
  togglePanel(type) {
    const button = this.container.querySelector(`[data-type="${type}"]`);
    const panel = this.container.querySelector(`[data-panel="${type}"]`);

    if (this.activePanel === type) {
      // Close current panel
      this.closeAllPanels();
    } else {
      // Close other panels and open this one
      this.closeAllPanels();
      this.activePanel = type;
      button.classList.add('active');
      panel.classList.add('show');
    }
  }

  /**
   * @method closeAllPanels
   * @description Closes all open panels.
   */
  closeAllPanels() {
    this.activePanel = null;
    this.container.querySelectorAll('.chat-nav-button').forEach(btn => {
      btn.classList.remove('active');
    });
    this.container.querySelectorAll('.chat-navigator-panel').forEach(panel => {
      panel.classList.remove('show');
    });
  }

  /**
   * @method updateContent
   * @description Fetches the latest questions and chats from the parser and renders them.
   */
  updateContent() {
    this.questions = this.parser.getQuestions();
    this.chats = this.parser.getChats();
    
    this.renderQuestions();
    this.renderChats();
  }

  /**
   * @method renderQuestions
   * @description Renders the list of questions in the questions panel.
   */
  renderQuestions() {
    const panel = this.container.querySelector('[data-panel="questions"] .panel-content');
    
    if (this.questions.length === 0) {
      panel.innerHTML = '<div class="empty-state">No questions found</div>';
      return;
    }

    panel.innerHTML = this.questions.map(question => `
      <div class="nav-item" data-element-id="${question.id}">
        <div class="nav-item-text">${this.escapeHtml(question.text)}</div>
      </div>
    `).join('');

    // Add click handlers
    panel.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const elementId = item.dataset.elementId;
        this.scrollToElement(elementId);
        this.closeAllPanels();
      });
    });
  }

  /**
   * @method renderChats
   * @description Renders the list of chats in the chats panel.
   */
  renderChats() {
    const panel = this.container.querySelector('[data-panel="chats"] .panel-content');
    
    if (this.chats.length === 0) {
      panel.innerHTML = '<div class="empty-state">No chats found</div>';
      return;
    }

    panel.innerHTML = this.chats.map(chat => `
      <div class="nav-item" data-element-id="${chat.id}">
        <div class="nav-item-text">${this.escapeHtml(chat.title)}</div>
      </div>
    `).join('');

    // Add click handlers
    panel.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const elementId = item.dataset.elementId;
        this.scrollToElement(elementId);
        this.closeAllPanels();
      });
    });
  }

  /**
   * @method scrollToElement
   * @description Scrolls the page to the specified element.
   * @param {string} elementId - The ID of the element to scroll to.
   */
  scrollToElement(elementId) {
    const element = document.getElementById(elementId) || document.querySelector(`[data-id="${elementId}"]`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      element.style.transition = 'background-color 0.3s ease';
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
  }

  /**
   * @method startObserver
   * @description Starts a MutationObserver to watch for changes in the DOM.
   */
  startObserver() {
    // Watch for DOM changes to update content
    const observer = new MutationObserver(() => {
      // Debounce updates
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        this.updateContent();
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * @method escapeHtml
   * @description Escapes HTML special characters in a string.
   * @param {string} text - The string to escape.
   * @returns {string} The escaped string.
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in platform-specific scripts
window.ChatNavigatorUI = ChatNavigatorUI;
