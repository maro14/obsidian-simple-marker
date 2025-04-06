# Obsidian Simple Marker

A lightweight plugin for Obsidian that allows you to easily mark and highlight text in your notes.

## ✨ Features

- **Quick Formatting**: Apply different text styles with simple commands
- **Toggle Support**: Turn formatting on/off with the same command
- **Multiple Styles**: Highlight, bold, italic, strikethrough, and code
- **Flexible Selection**: Works with both selected text and current line
- **Default Style**: Quick mark command using your preferred style
- **Custom Tags**: Create your own formatting with custom tags
- **User-Friendly**: Simple settings interface for customization

## 🚀 How to Use

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

**Tip**: If text is already formatted with a specific style, using the same command will remove that formatting.

## 📥 Installation

### Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-simple-marker/`
3. Reload Obsidian
4. Enable the plugin in the Community Plugins settings

## ⚙️ Configuration

The plugin settings allow you to:

- **Set Default Style**: Choose which marker style to use with the quick mark command
- **Custom Tags**: Create and manage your own custom formatting tags
  - Format: `prefix|postfix` (e.g., `<mark>|</mark>`)
  - Each custom tag gets its own command in the command palette

## 🛠️ Development

This plugin is built using TypeScript and the Obsidian API.

### Building from Source

1. Clone this repository
2. Make sure you have Node.js installed (v16 or newer)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start compilation in watch mode

## 🤝 Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
