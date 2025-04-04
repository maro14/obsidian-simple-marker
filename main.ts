import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface SimpleMarkerSettings {
	mySetting: string;
	customTag: string[];
}

const DEFAULT_SETTINGS: SimpleMarkerSettings = {
	mySetting: 'default',
	customTag: []
}

export default class SimpleMarker extends Plugin {
	settings: SimpleMarkerSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SimpleMarkerSettingTab(this.app, this));

		// Add marker-specific commands
		this.addCommand({
			id: 'mark-highlight',
			name: 'Highlight text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWraperComand(editor, view, '==', '==');
			}
		});
		
		this.addCommand({
			id: 'mark-bold',
			name: 'Bold text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWraperComand(editor, view, '**', '**');
			}
		});
		
		this.addCommand({
			id: 'mark-italic',
			name: 'Italic text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.handleWraperComand(editor, view, '_', '_');
			}
		});
	}
	
	private handleWraperComand(editor: Editor, view: MarkdownView, wrapPrefix: string, wrapPostfix: string,wrapPrefixIndentifyingSubstring?: string) {
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
	
		const wrappedLine = this.toggleContentWrap(line, wrapPrefix, wrapPostfix, wrapPrefixIndentifyingSubstring);
	
		if (isSelection) {
			editor.replaceSelection(wrappedLine);
		} else {
			editor.setLine(cursorLineNumber, wrappedLine);
	
			const isNowWrapped = (wrappedLine.length - line.length) > 0;
			cursorIndex += (isNowWrapped ? 1: -1) * (wrapPrefix.length);
			editor.setCursor(cursorLineNumber, cursorIndex);
		}
	}
	
	private toggleContentWrap(content: string, wrapPrefix: string, wrapPostfix: string, wrapPrefixIndentifyingSubstring?: string) {
		const wrapPrefixIndex = content.indexOf(wrapPrefixIndentifyingSubstring || wrapPrefix);
		const wrapPostfixIndex = content.indexOf(wrapPostfix);
		const isWrapped = wrapPrefixIndex != -1 && wrapPostfixIndex != -1 && wrapPrefixIndex < wrapPostfixIndex;
	
		let resolvedContent = content;
	
		if (isWrapped) {
			const beforeWrap = content.slice(0, wrapPrefixIndex);
			const wrappeContent = content.slice(wrapPrefixIndex + wrapPrefix.length, wrapPostfixIndex);
			const afterPostfixContent = content.slice(wrapPostfixIndex + wrapPostfix.length);
			resolvedContent = beforeWrap + wrappeContent + afterPostfixContent;
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
