import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Interface defining the settings structure for the SimpleMarker plugin
/**
 * Interface for custom tag definition
 * @property {string} tag - The tag in format "prefix|postfix"
 * @property {string} category - Optional category for organizing tags
 */
interface CustomTag {
    tag: string;
    category: string;
}

/**
 * Plugin settings interface
 * @property {string} defaultMarker - The default marker style to use
 * @property {CustomTag[]} customTags - Array of user-defined custom tags
 */
interface SimpleMarkerSettings {
    defaultMarker: string;
    customTags: CustomTag[];
}

const DEFAULT_SETTINGS: SimpleMarkerSettings = {
    defaultMarker: 'highlight',
    customTags: []
}

// Main class for the SimpleMarker plugin
export default class SimpleMarker extends Plugin {
	settings: SimpleMarkerSettings;

	// Method called when the plugin is loaded
	async onload() {
		await this.loadSettings(); // Load settings from storage

		// Add a settings tab to the Obsidian interface
		this.addSettingTab(new SimpleMarkerSettingTab(this.app, this));

		// Add a command for quick marking using the default marker
		this.addCommand({
			id: 'quick-mark',
			name: 'Quick mark with default style',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const markerType = this.settings.defaultMarker;
				let prefix = '', postfix = '';
				
				// Determine prefix and postfix based on marker type
				switch(markerType) {
					case 'highlight': prefix = postfix = '=='; break;
					case 'bold': prefix = postfix = '**'; break;
					case 'italic': prefix = postfix = '_'; break;
					case 'strikethrough': prefix = postfix = '~~'; break;
					case 'code': prefix = postfix = '`'; break;
				}
				
				// Apply the marker to the selected text or cursor position
				this.handleWrapperCommand(editor, view, prefix, postfix);
			}
		});
		
		// Add commands for each custom tag defined by the user
		this.settings.customTags.forEach((customTag, index) => {
			if (customTag.tag.trim()) {
				const parts = customTag.tag.split('|');
				if (parts.length === 2 && parts[0] && parts[1]) {
					const [prefix, postfix] = parts;
					this.addCommand({
						id: `mark-custom-${index}`,
						name: `Mark with ${prefix}...${postfix}`,
						editorCallback: (editor: Editor, view: MarkdownView) => {
							this.handleWrapperCommand(editor, view, prefix, postfix);
						}
					});
				} else {
					console.warn(`Simple Marker: Invalid custom tag format at index ${index}: "${customTag.tag}". Expected format: "prefix|postfix"`);
				}
			}
		});

		// Add specific commands for common markers
		this.addCommand({
			id: 'mark-highlight',
			name: 'Highlight text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWrapperCommand(editor, view, '==', '==');
			}
		});
		
		this.addCommand({
			id: 'mark-bold',
			name: 'Bold text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWrapperCommand(editor, view, '**', '**');
			}
		});
		
		this.addCommand({
			id: 'mark-italic',
			name: 'Italic text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWrapperCommand(editor, view, '_', '_');
			}
		});
		
		this.addCommand({
			id: 'mark-strikethrough',
			name: 'Strikethrough text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWrapperCommand(editor, view, '~~', '~~');
			}
		});
		
		this.addCommand({
			id: 'mark-code',
			name: 'Inline code',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWrapperCommand(editor, view, '`', '`');
			}
		});

		// Group tags by category
		const tagsByCategory = new Map<string, CustomTag[]>();
		this.settings.customTags.forEach(tag => {
			const category = tag.category || 'Uncategorized';
			if (!tagsByCategory.has(category)) {
				tagsByCategory.set(category, []);
			}
			tagsByCategory.get(category)?.push(tag);
		});
		
		// Add commands for each custom tag, grouped by category
		tagsByCategory.forEach((tags, category) => {
			tags.forEach((customTag, index) => {
				if (customTag.tag.trim()) {
					const parts = customTag.tag.split('|');
					if (parts.length === 2 && parts[0] && parts[1]) {
						const [prefix, postfix] = parts;
						this.addCommand({
							id: `mark-custom-${category}-${index}`,
							name: `${category}: ${prefix}...${postfix}`,
							editorCallback: (editor: Editor, view: MarkdownView) => {
								this.handleWrapperCommand(editor, view, prefix, postfix);
							}
						});
					}
				}
			});
		});
	}
	
	// Handles the wrapping of selected text or cursor position with specified markers
	/**
	 * Handles wrapping selected text or current line with specified markers
	 * @param editor - The active editor instance
	 * @param view - The current markdown view
	 * @param wrapPrefix - The prefix marker to apply
	 * @param wrapPostfix - The postfix marker to apply
	 * @param wrapPrefixIdentifyingSubstring - Optional substring to identify existing markers
	 */
	private handleWrapperCommand(editor: Editor, view: MarkdownView, wrapPrefix: string, wrapPostfix: string, wrapPrefixIdentifyingSubstring?: string) {
		try {
			const cursor = editor.getCursor();
			const cursorLineNumber = cursor.line;
			let cursorIndex = cursor.ch;
			let line = editor.getLine(cursorLineNumber);
			
			const selection = editor.getSelection();
			let isSelection = false;
			
			if (selection.trim() != '') {
				isSelection = true;
				line = selection;
			}

			if (line.trim() === '') {
				editor.transaction({
					changes: [{
						from: cursor,
						to: cursor,
						text: wrapPrefix
					}]
				});
				return;
			}

			const wrappedLine = this.toggleContentWrap(line, wrapPrefix, wrapPostfix, wrapPrefixIdentifyingSubstring);

			if (isSelection) {
				editor.transaction({
					changes: [{
						from: editor.getCursor('from'),
						to: editor.getCursor('to'),
						text: wrappedLine
					}]
				});
			} else {
				const lineStart = { line: cursorLineNumber, ch: 0 };
				const lineEnd = { line: cursorLineNumber, ch: line.length };
				editor.transaction({
					changes: [{
						from: lineStart,
						to: lineEnd,
						text: wrappedLine
					}]
				});
			
				const isNowWrapped = (wrappedLine.length - line.length) > 0;
				cursorIndex += (isNowWrapped ? 1: -1) * (wrapPrefix.length);
				editor.setCursor(cursorLineNumber, cursorIndex);
			}
		} catch (error) {
			console.error('Simple Marker: Error in handleWrapperCommand', error);
			new Notice('Error applying marker. Check console for details.');
		}
	}
	
	/**
	 * Toggles the wrapping of content with specified markers
	 * If content is already wrapped, it removes the wrapping
	 * If content is not wrapped, it adds the wrapping
	 * 
	 * @param content - The text content to process
	 * @param wrapPrefix - The prefix marker
	 * @param wrapPostfix - The postfix marker
	 * @param wrapPrefixIdentifyingSubstring - Optional substring to identify existing markers
	 * @returns The processed content with toggled wrapping
	 */
	private toggleContentWrap(content: string, wrapPrefix: string, wrapPostfix: string, wrapPrefixIdentifyingSubstring?: string) {
		try {
			if (!wrapPrefix || !wrapPostfix) {
				throw new Error('Invalid marker: prefix or postfix is empty');
			}
			
			const wrapPrefixIndex = content.indexOf(wrapPrefixIdentifyingSubstring || wrapPrefix);
			const wrapPostfixIndex = content.lastIndexOf(wrapPostfix);
			const isWrapped = wrapPrefixIndex != -1 && wrapPostfixIndex != -1 && wrapPrefixIndex < wrapPostfixIndex;
		
			let resolvedContent = content;
		
			if (isWrapped) {
				const beforeWrap = content.slice(0, wrapPrefixIndex);
				const wrappedContent = content.slice(wrapPrefixIndex + wrapPrefix.length, wrapPostfixIndex);
				const afterPostfixContent = content.slice(wrapPostfixIndex + wrapPostfix.length);
				resolvedContent = beforeWrap + wrappedContent + afterPostfixContent;
			} else {
				resolvedContent = wrapPrefix + content + wrapPostfix;
			}
			
			return resolvedContent;
		} catch (error) {
			console.error('Simple Marker: Error in toggleContentWrap', error);
			throw error; // Re-throw to be handled by the caller
		}
	}
	
	// Method called when the plugin is unloaded
	onunload() {
		// Cleanup tasks can be performed here
	}

	// Loads settings from storage
	async loadSettings() {
		try {
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		} catch (error) {
			console.error('Simple Marker: Error loading settings', error);
			new Notice('Error loading settings. Check console for details.');
		}
	}

	// Saves settings to storage
	async saveSettings() {
		try {
			await this.saveData(this.settings);
		} catch (error) {
			console.error('Simple Marker: Error saving settings', error);
			new Notice('Error saving settings. Check console for details.');
		}
	}
}

// Class for managing the settings tab in the Obsidian interface
class SimpleMarkerSettingTab extends PluginSettingTab {
	plugin: SimpleMarker;

	constructor(app: App, plugin: SimpleMarker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// Displays the settings UI
	private validateCategory(category: string): string {
		const sanitized = category.trim();
		if (sanitized.length > 50) {
			new Notice('Category name too long. Maximum 50 characters allowed.');
			return sanitized.substring(0, 50);
		}
		return sanitized;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// Dropdown for selecting the default marker type
		new Setting(containerEl)
			.setName('Default marker')
			.setDesc('Choose the default marker type when using the quick mark command')
			.addDropdown(dropdown => dropdown
				.addOption('highlight', 'Highlight')
				.addOption('bold', 'Bold')
				.addOption('italic', 'Italic')
				.addOption('strikethrough', 'Strikethrough')
				.addOption('code', 'Code')
				.setValue(this.plugin.settings.defaultMarker)
				.onChange(async (value) => {
					this.plugin.settings.defaultMarker = value;
					await this.plugin.saveSettings();
				}));
				
		// Section for managing custom tags
		containerEl.createEl('h3', {text: 'Custom Tags'});
		containerEl.createEl('p', {text: 'Format: prefix|postfix (e.g., <mark>|</mark>)'});
		
		// Display existing custom tags with validation
		this.plugin.settings.customTags.forEach((tag, index) => {
			const setting = new Setting(containerEl)
				.setName(`Custom tag ${index + 1}`);
				
			const isValidFormat = tag.tag.includes('|') && tag.tag.split('|').length === 2 &&
									tag.tag.split('|')[0].trim() !== '' && tag.tag.split('|')[1].trim() !== '';
			
			if (tag && !isValidFormat) {
				setting.setDesc('⚠️ Invalid format. Please use prefix|postfix format.');
				setting.settingEl.addClass('simple-marker-invalid-tag');
			}
			
			setting.addText(text => text
				.setValue(tag.tag)
				.setPlaceholder('prefix|postfix')
				.onChange(async (value) => {
					tag.tag = value;
					await this.plugin.saveSettings();
					this.display();
				}))
			.addText(text => text
				.setPlaceholder('Category')
				.setValue(tag.category)
				.onChange(async (value) => {
					tag.category = this.validateCategory(value);
					await this.plugin.saveSettings();
				}))
			.addButton(button => button
				.setButtonText('Remove')
				.onClick(async () => {
					this.plugin.settings.customTags.splice(index, 1);
					await this.plugin.saveSettings();
					this.display();
				}));
		});
		
		// Button to add new custom tags
		new Setting(containerEl)
			.setName('Add custom tag')
			.setDesc('Add a new custom tag for marking text')
			.addButton(button => button
				.setButtonText('Add')
				.onClick(async () => {
					this.plugin.settings.customTags.push({ tag: '', category: '' });
					await this.plugin.saveSettings();
					this.display();
				}));
	}
}
