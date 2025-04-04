import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

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

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SimpleMakerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		
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
		} // Added missing closing brace here
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
			// Completed the else block
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SimpleMakerSettingTab extends PluginSettingTab {
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
