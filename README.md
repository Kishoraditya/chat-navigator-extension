# Chat Navigator Chrome Extension

A Chrome extension that adds floating Q (Questions) and C (Chats) buttons to ChatGPT and Claude.ai for easy navigation.

## Features

- **Translucent UI** - Semi-transparent design that doesn't obstruct content
- **Chat Search** - Quickly filter chat history from the panel
- **Q Button** - Lists all questions/prompts with clickable navigation  
- **C Button** - Shows available chats with quick access
- **Smooth Animations** - Elegant expand/collapse with backdrop blur
- **Platform Support** - Works on ChatGPT and Claude.ai

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download/Clone** the extension files
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"**
5. **Select the folder** containing the extension files
6. **Visit ChatGPT or Claude.ai** - you should see Q and C buttons on the right side

### Method 2: Pack as CRX (Optional)

1. In `chrome://extensions/`, click **"Pack extension"**
2. Select the extension folder
3. Install the generated `.crx` file

## File Structure

```bash
chat-navigator-extension/
├── manifest.json
├── content-scripts/
│   ├── ui-handler.js      # Main UI logic
│   ├── chatgpt.js         # ChatGPT parser
│   └── claude.js          # Claude.ai parser
├── styles/
│   └── floating-ui.css    # Translucent styling
└── README.md
```

## Usage

1. **Visit a supported site** (chat.openai.com, chatgpt.com, or claude.ai)
2. **See Q and C buttons** appear on the right side of the page
3. **Click Q** to see all questions/prompts in the conversation
4. **Click C** to see available chats (from sidebar)
5. **Click any item** to scroll smoothly to that location
6. **Click outside or press Escape** to close panels

## Supported Platforms

- ✅ **ChatGPT** (chat.openai.com, chatgpt.com)
- ✅ **Claude.ai** (claude.ai)
- ✅ **Grok** (x.ai, grok.x.ai, grok.com)
- ✅ **Perplexity** (perplexity.ai)
- ✅ **Gemini** (gemini.google.com, bard.google.com)
- ✅ **Copilot** (copilot.microsoft.com)
- ✅ **Meta** (meta.ai)
- 🔄 **Coming Soon**: Lmarena, Merlin, Jasper, Comet, etc.

## Technical Details

- **Manifest V3** compliant
- **Content Scripts** for DOM parsing
- **CSS Backdrop Filter** for translucent effects
- **MutationObserver** for dynamic content updates
- **Debounced Updates** for performance

## Customization

### Adjusting Transparency

Edit `styles/floating-ui.css`:

```css
/* Make more transparent */
background: rgba(30, 30, 30, 0.7);

/* Make more opaque */
background: rgba(30, 30, 30, 0.95);
```

### Button Position

Edit `.chat-navigator-container` in CSS:

```css
.chat-navigator-container {
  right: 20px;    /* Distance from right edge */
  top: 50%;       /* Vertical position */
}
```

## Troubleshooting

### Buttons Not Appearing

- Check if you're on a supported site
- Refresh the page after installing
- Check Chrome Developer Console for errors

### Content Not Loading

- Wait a moment for the page to fully load
- Some platforms load content dynamically
- Try refreshing if content appears but buttons don't update

### Performance Issues

- The extension uses debounced updates (500ms delay)
- Large conversations may take longer to parse
- Consider closing unused tabs to free memory

## Development

### Adding New Platforms

1. **Create parser file**: `content-scripts/newplatform.js`
2. **Implement parser class**:

   ```javascript
   class NewPlatformParser {
     getQuestions() { /* return questions array */ }
     getChats() { /* return chats array */ }
   }
   ```

3. **Add to manifest.json**:

   ```json
   {
     "matches": ["https://newplatform.com/*"],
     "js": ["content-scripts/newplatform.js", "content-scripts/ui-handler.js"]
   }
   ```

### Testing Selectors

Use browser console to test CSS selectors:

```javascript
// Test question parsing
document.querySelectorAll('[data-message-author-role="user"]')

// Test chat parsing  
document.querySelectorAll('nav a[href*="/c/"]')
```

## Privacy & Security

- **No data collection** - everything runs locally
- **No external requests** - only accesses page content
- **Limited permissions** - only `activeTab` access
- **Domain restricted** - only works on specified chat platforms

## License

MIT License - Feel free to modify and distribute. This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details. It is free to use, modify, and distribute.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Test on multiple platforms
4. Submit pull request with description

## Architecture

For a detailed explanation of the project's architecture, please see the [ARCHITECTURE.md](ARCHITECTURE.md) file.

## Future Steps

- **Semantic Search**: Implement a local semantic search feature to find questions and chats based on meaning.
- **Support for More Chat Applications**: Add support for other chat platforms.
- **Improved UI/UX**: Add a search bar, filtering options, and a settings page for customization.
- **Code Refactoring**: Modernize the codebase with modules and optimize performance.
- **Browsers Support**: Test on multiple browsers to ensure cross-browser compatibility.  {Comet, Brave, Edge, Safari,  Firefox, Opera, Vivaldi, etc.}

## Changelog

### v1.0 

- Initial release
- ChatGPT and Claude.ai support
- Translucent UI with backdrop blur
- Smooth animations and interactions

### v2.0 (Current)

- Grok, Perplexity, Copilot, Deepkseek, Meta, Gemini AI support
