# Architecture

This document provides an overview of the Chat Navigator extension's architecture.

## Core Components

The extension is built with a modular architecture, separating the core UI logic from the platform-specific parsing logic.

### 1. UI Handler (`ui-handler.js`)

- **`ChatNavigatorUI` class**: This is the main class that manages the user interface of the extension.
- **Responsibilities**:
    - Creates the floating 'Q' (Questions) and 'C' (Chats) buttons.
    - Manages the display and behavior of the panels that show the lists of questions and chats.
    - Binds user events (clicks, key presses) to actions.
    - Handles the smooth scrolling to selected elements.
    - Uses a `MutationObserver` to detect changes in the page's DOM and trigger content updates.

### 2. Parsers (`content-scripts/*.js`)

- **Platform-Specific Parsers**: Each supported chat platform (ChatGPT, Claude, etc.) has its own parser file.
- **Parser Class**: Each parser file defines a class (e.g., `ChatGPTParser`, `ClaudeParser`) with two main methods:
    - `getQuestions()`: This method is responsible for finding and extracting all the user's questions or prompts from the current chat conversation. It uses DOM queries to identify the specific HTML elements that contain user messages.
    - `getChats()`: This method finds and extracts the list of previous chats from the platform's sidebar or navigation menu.
- **Initialization**: Each parser file also has an initialization function (e.g., `initChatGPTNavigator`) that creates an instance of the parser and the `ChatNavigatorUI`.

### 3. Manifest (`manifest.json`)

- **Configuration**: This file is the entry point of the extension and defines its properties.
- **Content Scripts**: It specifies which content scripts to inject into which websites. For example, it injects `chatgpt.js` and `ui-handler.js` into `chat.openai.com`.
- **Permissions**: It declares the necessary permissions for the extension to run (e.g., `activeTab`).

### 4. Styles (`styles/floating-ui.css`)

- **CSS**: This file contains all the styles for the floating UI components, including the buttons and panels.
- **Translucent UI**: It uses modern CSS properties like `backdrop-filter` to create the translucent, "glassmorphism" effect.

## Data Flow

1.  When a user navigates to a supported chat platform, the `manifest.json` configuration triggers the injection of the corresponding parser script and the `ui-handler.js` script.
2.  The `init...Navigator` function in the parser script is called.
3.  This function creates an instance of the platform's parser (e.g., `ChatGPTParser`).
4.  It then creates an instance of `ChatNavigatorUI`, passing the parser instance to it.
5.  The `ChatNavigatorUI` initializes, creating the UI elements and setting up event listeners.
6.  The `ChatNavigatorUI` calls the `getQuestions()` and `getChats()` methods of the provided parser to fetch the initial content.
7.  The UI is then rendered with the fetched questions and chats.
8.  The `MutationObserver` in `ui-handler.js` continuously monitors the page for changes. When changes are detected (e.g., a new message is added), it triggers a debounced update of the content by calling the parser methods again.

## Future Steps

- **Semantic Search**: Implement a local semantic search feature to allow users to search for questions and chats based on meaning rather than just keywords. This could involve using a lightweight, in-browser vector database and sentence transformer models.
- **Support for More Chat Applications**: Expand the extension to support other popular chat platforms like:
    - You.com
    - Cohere Coral
    - And others as they emerge.
- **Improved UI/UX**:
    - Add a search bar to the panels to filter the lists of questions and chats.
    - Implement more advanced filtering and sorting options.
    - Allow users to customize the appearance and position of the UI elements through a settings page.
- **Code Refactoring and Optimization**:
    - Refactor the code to use modern JavaScript features like modules.
    - Optimize the DOM parsing logic for better performance on very long conversations.
