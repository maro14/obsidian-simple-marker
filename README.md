# Obsidian Simple Marker

A lightweight plugin for Obsidian that allows you to easily mark and highlight text in your notes.

## ✨ Features

- **Quick Formatting**: Apply different text styles with simple commands
- **Toggle Support**: Turn formatting on/off with the same command
- **Multiple Styles**: Highlight, bold, italic, strikethrough, and code
- **Flexible Selection**: Works with both selected text and current line
- **Default Style**: Quick mark command using your preferred style
- **Custom Tags**: Create your own formatting with custom tags
- **Categories**: Organize your custom tags into categories
- **User-Friendly**: Simple settings interface for customization
- **Smart Wrapping**: Automatically handles nested and existing formatting

## 🚀 How to Use

### Basic Usage
1. Select text you want to format or place your cursor on a line
2. Open the command palette (`Ctrl+P` or `Cmd+P`)
3. Choose one of the formatting commands:

| Command | Result | Example |
|---------|--------|---------|
| "Highlight text" | `==text==` | ==highlighted text== |
| "Bold text" | `**text**` | **bold text** |
| "Italic text" | `_text_` | _italic text_ |
| "Strikethrough text" | `~~text~~` | ~~strikethrough text~~ |
| "Inline code" | `` `text` `` | `code text` |
| "Quick mark with default style" | Uses your default setting | |

### Advanced Usage
- **Toggle Formatting**: Run the same command again to remove formatting
- **Empty Lines**: Places just the prefix when used on empty lines
- **Multiple Selections**: Works with Obsidian's multi-cursor feature

## 📥 Installation

### Manual Installation
1. Download the [latest release](https://github.com/your-repo/obsidian-simple-marker/releases)
2. Extract to your vault's plugins folder:  
   `c:\Users\user\Documents\obsidian\My Coding Vault\.obsidian\plugins\obsidian-simple-marker\`
3. Reload Obsidian
4. Enable the plugin in Community Plugins settings

## ⚙️ Configuration

### Default Marker
Choose your preferred default style for the quick mark command:
- Highlight (`==text==`)
- Bold (`**text**`)
- Italic (`_text_`)
- Strikethrough (`~~text~~`)
- Code (`` `text` ``)

### Custom Tags
Create your own formatting patterns:
- Format: `prefix|postfix` (e.g., `<mark>|</mark>` creates `<mark>text</mark>`)
- Assign categories for better organization
- Invalid formats show visual warnings

## 🛠️ Development

### Prerequisites
- Node.js v16+
- pnpm

### Setup
```bash
git clone https://github.com/maro14/obsidian-simple-marker.git
cd obsidian-simple-marker
pnpm install
```



          
Here's an updated version of your README with a new "Troubleshooting & FAQ" section added at the end. This section addresses common issues and provides guidance for users.

```markdown:c:\Users\tehes\Documents\obsidian\My Coding Vault\.obsidian\plugins\obsidian-simple-marker\README.md
// ... existing code ...

## 🛠️ Development

### Prerequisites
- Node.js v16+
- pnpm

### Setup
```bash
git clone https://github.com/maro14/obsidian-simple-marker.git
cd obsidian-simple-marker
pnpm install
```

## ❓ Troubleshooting & FAQ

### The plugin doesn't appear in Obsidian after installation
- Make sure you have extracted the plugin to the correct folder:  
  `c:\Users\user\Documents\obsidian\your Vault\.obsidian\plugins\obsidian-simple-marker\`
- Reload Obsidian or restart the app after copying the files.
- Check that the plugin is enabled in the Community Plugins settings.

### Formatting commands don't work or produce errors
- Ensure you are using the latest version of Obsidian and the plugin.
- Check the console (Ctrl+Shift+I → Console tab) for error messages and report them on the [GitHub Issues page](https://github.com/maro14/obsidian-simple-marker/issues).
- Try disabling other plugins to rule out conflicts.

### Custom tags are not working or show as invalid
- Make sure your custom tag format is `prefix|postfix` (e.g., `<mark>|</mark>`).
- Both prefix and postfix must be non-empty.
- If you see a warning, double-check your input for typos or missing parts.

### My formatting is not toggling off as expected
- The plugin looks for exact matches of the prefix and postfix. If your text contains similar patterns, toggling may not work as intended.
- Nested or overlapping formatting may cause unexpected results.

### I lost my custom tags or settings
- Settings are stored in your vault's `.obsidian/plugins/obsidian-simple-marker/data.json` file.
- If you accidentally delete or overwrite this file, your settings will be lost. Consider backing up your vault regularly.

### Where can I get help or report bugs?
- For help, feature requests, or bug reports, please visit the [GitHub repository](https://github.com/maro14/obsidian-simple-marker).
