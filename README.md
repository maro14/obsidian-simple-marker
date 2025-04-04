# Obsidian Simple Marker

A lightweight plugin for Obsidian that allows you to easily mark and highlight text in your notes.

## Features

- Quickly apply different text formatting styles with simple commands
- Toggle formatting on/off with the same command
- Supports highlighting, bold, italic, and more text styles
- Works with both selected text and current line
- Customizable through settings

## How to Use

1. Select text you want to format or place your cursor on a line
2. Use one of the following commands from the command palette:
   - "Highlight text" - Wraps text with == markers
   - "Bold text" - Wraps text with ** markers
   - "Italic text" - Wraps text with _ markers

If text is already formatted with a specific style, using the same command will remove that formatting.

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode if necessary
3. Click Browse and search for "Simple Marker"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-simple-marker/`
3. Reload Obsidian
4. Enable the plugin in the Community Plugins settings

## Configuration

The plugin settings allow you to:
- Customize default behavior
- Add custom tags for marking text

## Development

This plugin is built using TypeScript and the Obsidian API.

### Building from Source

1. Clone this repository
2. Make sure you have Node.js installed (v16 or newer)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start compilation in watch mode

## Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.

## License

This project is licensed under the MIT License.
