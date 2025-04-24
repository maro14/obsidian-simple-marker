import { Editor, MarkdownView } from 'obsidian';
import { CustomTag } from './types';

export class MarkerManager {
    /**
     * Validates if a custom tag string follows the correct format (prefix|postfix)
     */
    isValidCustomTag(tag: string): boolean {
        const parts = tag.split('|');
        return parts.length === 2 && parts.every(part => part.length > 0);
    }

    /**
     * Parses a custom tag string into [prefix, postfix] tuple
     */
    parseCustomTag(tag: string): [string, string] | null {
        if (!this.isValidCustomTag(tag)) return null;
        const [prefix, postfix] = tag.split('|');
        return [prefix, postfix];
    }

    /**
     * Groups custom tags by their categories
     */
    groupTagsByCategory(tags: CustomTag[]): Map<string, CustomTag[]> {
        const groupedTags = new Map<string, CustomTag[]>();
        
        tags.forEach(tag => {
            const category = tag.category || 'Uncategorized';
            if (!groupedTags.has(category)) {
                groupedTags.set(category, []);
            }
            groupedTags.get(category)?.push(tag);
        });

        return groupedTags;
    }

    /**
     * Handles the wrapping of selected text with prefix and postfix
     */
    handleWrapperCommand(editor: Editor, view: MarkdownView, prefix: string, postfix: string): void {
        const selection = editor.getSelection();
        if (selection) {
            editor.replaceSelection(`${prefix}${selection}${postfix}`);
        } else {
            // If no text is selected, insert the markers and place cursor between them
            const cursor = editor.getCursor();
            editor.replaceRange(`${prefix}${postfix}`, cursor);
            editor.setCursor({
                line: cursor.line,
                ch: cursor.ch + prefix.length
            });
        }
    }
}
