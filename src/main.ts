import { App, Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { SimpleMarkerSettings, CustomTag } from './types';
import { MARKER_TYPES, DEFAULT_SETTINGS } from './constants';
import { MarkerManager } from './MarkerManager';
import { SimpleMarkerSettingTab } from './SettingsTab';

export default class SimpleMarker extends Plugin {
    settings: SimpleMarkerSettings;
    markerManager: MarkerManager;

    async onload() {
        this.markerManager = new MarkerManager();
        await this.loadSettings();
        
        this.addSettingTab(new SimpleMarkerSettingTab(this.app, this));
        
        this.registerQuickMarkCommand();
        this.registerDefaultMarkerCommands();
        this.registerCustomTagCommands();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private registerQuickMarkCommand() {
        this.addCommand({
            id: 'quick-mark',
            name: 'Quick mark with default style',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const marker = MARKER_TYPES[this.settings.defaultMarker];
                this.markerManager.handleWrapperCommand(editor, view, marker.prefix, marker.postfix);
            }
        });
    }

    private registerDefaultMarkerCommands() {
        Object.entries(MARKER_TYPES).forEach(([id, config]) => {
            this.addCommand({
                id: `mark-${id}`,
                name: `${config.name} text`,
                editorCallback: (editor: Editor, view: MarkdownView) => {
                    this.markerManager.handleWrapperCommand(editor, view, config.prefix, config.postfix);
                }
            });
        });
    }
    
    private registerCustomTagCommands() {
        const tagsByCategory = this.markerManager.groupTagsByCategory(this.settings.customTags);
        
        tagsByCategory.forEach((tags, category) => {
            tags.forEach((customTag, index) => {
                const parsedTag = this.markerManager.parseCustomTag(customTag.tag);
                if (!parsedTag) {
                    console.warn(`Invalid custom tag: "${customTag.tag}"`);
                    return;
                }

                const [prefix, postfix] = parsedTag;
                this.addCommand({
                    id: `mark-custom-${category}-${index}`,
                    name: `${category}: ${prefix}...${postfix}`,
                    editorCallback: (editor: Editor, view: MarkdownView) => {
                        this.markerManager.handleWrapperCommand(editor, view, prefix, postfix);
                    }
                });
            });
        });
    }
}
