import { App, PluginSettingTab, Setting } from 'obsidian';
import { SimpleMarkerSettings } from './types';
import { MARKER_TYPES } from './constants';
import SimpleMarker from './main';

export class SimpleMarkerSettingTab extends PluginSettingTab {
    plugin: SimpleMarker;

    constructor(app: App, plugin: SimpleMarker) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Simple Marker Settings' });

        // Default marker setting
        new Setting(containerEl)
            .setName('Default Marker Style')
            .setDesc('Choose the default style for quick marking')
            .addDropdown(dropdown => {
                Object.entries(MARKER_TYPES).forEach(([value, config]) => {
                    dropdown.addOption(value, config.name);
                });
                dropdown
                    .setValue(this.plugin.settings.defaultMarker)
                    .onChange(async (value: string) => {
                        this.plugin.settings.defaultMarker = value;
                        await this.plugin.saveSettings();
                    });
            });

        // Custom tags section
        containerEl.createEl('h3', { text: 'Custom Tags' });

        // Add new custom tag
        new Setting(containerEl)
            .setName('Add Custom Tag')
            .setDesc('Add a new custom tag in format: prefix|postfix')
            .addText(text => text
                .setPlaceholder('prefix|postfix')
                .setValue('')
                .setClass('custom-tag-input')
                .onChange(() => {}))
            .addText(text => text
                .setPlaceholder('Category (optional)')
                .setValue('')
                .setClass('category-input')
                .onChange(() => {}))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    const tagInput = containerEl.querySelector('.custom-tag-input') as HTMLInputElement;
                    const categoryInput = containerEl.querySelector('.category-input') as HTMLInputElement;
                    
                    if (tagInput && categoryInput) {
                        const tag = tagInput.value.trim();
                        const category = categoryInput.value.trim();
                        
                        if (this.plugin.markerManager.isValidCustomTag(tag)) {
                            this.plugin.settings.customTags.push({
                                tag: tag,
                                category: category
                            });
                            await this.plugin.saveSettings();
                            this.display();
                        }
                    }
                }));

        // Display existing custom tags
        const tagsByCategory = this.plugin.markerManager.groupTagsByCategory(this.plugin.settings.customTags);
        
        tagsByCategory.forEach((tags, category) => {
            containerEl.createEl('h4', { text: category });
            
            tags.forEach((customTag, index) => {
                new Setting(containerEl)
                    .setName(`Tag ${index + 1}`)
                    .setDesc(customTag.tag)
                    .addButton(button => button
                        .setButtonText('Delete')
                        .onClick(async () => {
                            this.plugin.settings.customTags = this.plugin.settings.customTags
                                .filter(t => t !== customTag);
                            await this.plugin.saveSettings();
                            this.display();
                        }));
            });
        });
    }
}
