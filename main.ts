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
    defaultMarker: MarkerType; // Update this line to use MarkerType instead of string
    customTags: CustomTag[];
}

const DEFAULT_SETTINGS: SimpleMarkerSettings = {
    defaultMarker: 'highlight',
    customTags: []
}

// Move marker configurations to a dedicated constants file
const MARKER_TYPES = {
    highlight: { prefix: '==', postfix: '==', name: 'Highlight' },
    bold: { prefix: '**', postfix: '**', name: 'Bold' },
    italic: { prefix: '_', postfix: '_', name: 'Italic' },
    strikethrough: { prefix: '~~', postfix: '~~', name: 'Strikethrough' },
    code: { prefix: '`', postfix: '`', name: 'Inline Code' }
} as const;

export default class SimpleMarker extends Plugin {
    settings: SimpleMarkerSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SimpleMarkerSettingTab(this.app, this));
        
        this.registerQuickMarkCommand();
        this.registerDefaultMarkerCommands();
        this.registerCustomTagCommands();
    }

    private registerQuickMarkCommand() {
        this.addCommand({
            id: 'quick-mark',
            name: 'Quick mark with default style',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const marker = MARKER_TYPES[this.settings.defaultMarker];
                this.handleWrapperCommand(editor, view, marker.prefix, marker.postfix);
            }
        });
    }

    private registerDefaultMarkerCommands() {
        Object.entries(MARKER_TYPES).forEach(([id, config]) => {
            this.addCommand({
                id: `mark-${id}`,
                name: `${config.name} text`,
                editorCallback: (editor: Editor, view: MarkdownView) => {
                    this.handleWrapperCommand(editor, view, config.prefix, config.postfix);
                }
            });
        });
    }

    private registerCustomTagCommands() {
        const tagsByCategory = this.groupTagsByCategory();
        
        tagsByCategory.forEach((tags, category) => {
            tags.forEach((customTag, index) => {
                if (!this.isValidCustomTag(customTag.tag)) {
                    console.warn(`Invalid custom tag: "${customTag.tag}"`);
                    return;
                }

                const [prefix, postfix] = customTag.tag.split('|');
                this.addCommand({
                    id: `mark-custom-${category}-${index}`,
                    name: `${category}: ${prefix}...${postfix}`,
                    editorCallback: (editor: Editor, view: MarkdownView) => {
                        this.handleWrapperCommand(editor, view, prefix, postfix);
                    }
                });
            });
        });
    }

    private groupTagsByCategory(): Map<string, CustomTag[]> {
        const tagsByCategory = new Map<string, CustomTag[]>();
        
        this.settings.customTags.forEach(tag => {
            const category = tag.category || 'Uncategorized';
            if (!tagsByCategory.has(category)) {
                tagsByCategory.set(category, []);
            }
            tagsByCategory.get(category)?.push(tag);
        });
        
        return tagsByCategory;
    }

    private isValidCustomTag(tag: string): boolean {
        const parts = tag.split('|');
        return parts.length === 2 && 
               parts[0].trim() !== '' && 
               parts[1].trim() !== '';
    }

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
    
    onunload() {
        // Cleanup tasks can be performed here
    }

    async loadSettings() {
        try {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        } catch (error) {
            console.error('Simple Marker: Error loading settings', error);
            new Notice('Error loading settings. Check console for details.');
        }
    }

    async saveSettings() {
        try {
            await this.saveData(this.settings);
        } catch (error) {
            console.error('Simple Marker: Error saving settings', error);
            new Notice('Error saving settings. Check console for details.');
        }
    }
}

class SimpleMarkerSettingTab extends PluginSettingTab {
    plugin: SimpleMarker;

    constructor(app: App, plugin: SimpleMarker) {
        super(app, plugin);
        this.plugin = plugin;
    }

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

        this.addDefaultMarkerSetting(containerEl);
        this.addCustomTagsSection(containerEl);
    }

    private addDefaultMarkerSetting(containerEl: HTMLElement): void {
        const markerOptions = Object.entries(MARKER_TYPES).map(([id, config]) => ({
            value: id,
            display: config.name
        }));

        new Setting(containerEl)
            .setName('Default marker')
            .setDesc('Choose the default marker type when using the quick mark command')
            .addDropdown(dropdown => {
                markerOptions.forEach(option => 
                    dropdown.addOption(option.value, option.display)
                );
                
                return dropdown
                    .setValue(this.plugin.settings.defaultMarker)
                    .onChange(async (value: MarkerType) => {
                        this.plugin.settings.defaultMarker = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private addCustomTagsSection(containerEl: HTMLElement): void {
        containerEl.createEl('h3', {text: 'Custom Tags'});
        containerEl.createEl('p', {text: 'Format: prefix|postfix (e.g., <mark>|</mark>)'});
        
        this.plugin.settings.customTags.forEach((tag, index) => 
            this.createCustomTagSetting(containerEl, tag, index)
        );

        this.addNewCustomTagButton(containerEl);
    }

    createCustomTagSetting(containerEl: HTMLElement, tag: CustomTag, index: number): void {
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
                }))  // Remove the semicolon here
            .addButton(button => button
                .setButtonText('Remove')
                .onClick(async () => {
                    this.plugin.settings.customTags.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }

    addNewCustomTagButton(containerEl: HTMLElement): void {
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

// Add this type definition before the interfaces
type MarkerType = keyof typeof MARKER_TYPES;
