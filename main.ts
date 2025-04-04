import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface SimpleMarkerSettings {
	defaultMarker: string;
	customTags: string[];
}

const DEFAULT_SETTINGS: SimpleMarkerSettings = {
	defaultMarker: 'highlight',
	customTags: []
}

export default class SimpleMarker extends Plugin {
	settings: SimpleMarkerSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SimpleMarkerSettingTab(this.app, this));

		// Add a quick mark command that uses the default marker
		this.addCommand({
			id: 'quick-mark',
			name: 'Quick mark with default style',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const markerType = this.settings.defaultMarker;
				let prefix = '', postfix = '';
				
				switch(markerType) {
					case 'highlight': prefix = postfix = '=='; break;
					case 'bold': prefix = postfix = '**'; break;
					case 'italic': prefix = postfix = '_'; break;
					case 'strikethrough': prefix = postfix = '~~'; break;
					case 'code': prefix = postfix = '`'; break;
				}
				
				this.handleWrapperCommand(editor, view, prefix, postfix);
			}
		});
		
		// Add commands for custom tags
		this.settings.customTags.forEach((tag, index) => {
			if (tag.trim()) {
				const [prefix, postfix] = tag.split('|');
				if (prefix && postfix) {
					this.addCommand({
						id: `mark-custom-${index}`,
						name: `Mark with ${prefix}...${postfix}`,
						editorCallback: (editor: Editor, view: MarkdownView) => {
							this.handleWrapperCommand(editor, view, prefix, postfix);
						}
					});
				}
			}
		});

		// Add marker-specific commands
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
		
		// Add more useful markers
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
	}
	
	private handleWrapperCommand(editor: Editor, view: MarkdownView, wrapPrefix: string, wrapPostfix: string, wrapPrefixIdentifyingSubstring?: string) {
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
			editor.replaceSelection(wrapPrefix);
			return;
			
		}
	
		const wrappedLine = this.toggleContentWrap(line, wrapPrefix, wrapPostfix, wrapPrefixIdentifyingSubstring);
	
		if (isSelection) {
			editor.replaceSelection(wrappedLine);
		} else {
			editor.setLine(cursorLineNumber, wrappedLine);
	
			const isNowWrapped = (wrappedLine.length - line.length) > 0;
			cursorIndex += (isNowWrapped ? 1: -1) * (wrapPrefix.length);
			editor.setCursor(cursorLineNumber, cursorIndex);
		}
	}
	
	private toggleContentWrap(content: string, wrapPrefix: string, wrapPostfix: string, wrapPrefixIdentifyingSubstring?: string) {
		const wrapPrefixIndex = content.indexOf(wrapPrefixIdentifyingSubstring || wrapPrefix);
		const wrapPostfixIndex = content.indexOf(wrapPostfix);
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
	}
	
	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SimpleMarkerSettingTab extends PluginSettingTab {
	plugin: SimpleMarker;

	constructor(app: App, plugin: SimpleMarker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

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
				
		// Add a section for custom tags
		containerEl.createEl('h3', {text: 'Custom Tags'});
		containerEl.createEl('p', {text: 'Format: prefix|postfix (e.g., <mark>|</mark>)'});
		
		// Display existing custom tags
		this.plugin.settings.customTags.forEach((tag, index) => {
			new Setting(containerEl)
				.setName(`Custom tag ${index + 1}`)
				.addText(text => text
					.setValue(tag)
					.onChange(async (value) => {
						this.plugin.settings.customTags[index] = value;
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
		
		// Add button to add new custom tag
		new Setting(containerEl)
			.setName('Add custom tag')
			.setDesc('Add a new custom tag for marking text')
			.addButton(button => button
				.setButtonText('Add')
				.onClick(async () => {
					this.plugin.settings.customTags.push('');
					await this.plugin.saveSettings();
					this.display();
				}));
	}
}
