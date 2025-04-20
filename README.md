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
