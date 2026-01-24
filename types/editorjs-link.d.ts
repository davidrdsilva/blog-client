declare module "@editorjs/link" {
    import type { BlockTool } from "@editorjs/editorjs";
    export default class LinkTool implements BlockTool {
        static get toolbox(): {
            title: string;
            icon: string;
        };
        render(): HTMLElement;
        save(blockContent: HTMLElement): unknown;
    }
}
