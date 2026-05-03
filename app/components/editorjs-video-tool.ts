import type { API } from "@editorjs/editorjs";

interface VideoData {
    file?: { url: string };
    caption?: string;
}

interface VideoConfig {
    endpoint: string;
    field?: string;
    types?: string;
    captionPlaceholder?: string;
}

interface BlockToolConstructorParams {
    data: VideoData;
    config: VideoConfig;
    api: API;
    readOnly: boolean;
}

export default class VideoTool {
    static get toolbox() {
        return {
            title: "Video",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    private data: VideoData;
    private readonly config: VideoConfig;
    private readonly readOnly: boolean;
    private wrapper: HTMLDivElement;

    constructor({ data, config, api: _api, readOnly }: BlockToolConstructorParams) {
        this.data = data ?? {};
        this.config = config ?? { endpoint: "" };
        this.readOnly = readOnly;
        this.wrapper = document.createElement("div");
    }

    render(): HTMLElement {
        if (this.data.file?.url) {
            this._renderVideo(this.data.file.url, this.data.caption ?? "");
        } else {
            this._renderUploader();
        }
        return this.wrapper;
    }

    save(): VideoData {
        const captionEl = this.wrapper.querySelector<HTMLElement>("[data-video-caption]");
        return {
            file: this.data.file,
            caption: captionEl?.innerText?.trim() ?? this.data.caption ?? "",
        };
    }

    private _renderUploader(): void {
        this.wrapper.innerHTML = "";

        const uid = Math.random().toString(36).slice(2);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = `video-tool-input-${uid}`;
        fileInput.accept = this.config.types ?? "video/mp4,video/webm,video/ogg,video/quicktime";
        fileInput.className = "hidden";
        fileInput.addEventListener("change", (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) this._uploadFile(file);
        });

        const label = document.createElement("label");
        label.htmlFor = fileInput.id;
        label.className =
            "flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors gap-2";
        label.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Click to upload video</span>
            <span class="text-xs text-zinc-400 dark:text-zinc-500">MP4, WebM, OGG, MOV</span>
        `;

        this.wrapper.appendChild(fileInput);
        this.wrapper.appendChild(label);
    }

    private _renderLoading(): void {
        this.wrapper.innerHTML = "";

        const container = document.createElement("div");
        container.className =
            "flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 gap-2";
        container.innerHTML = `
            <svg class="animate-spin w-8 h-8 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Uploading...</span>
        `;

        this.wrapper.appendChild(container);
    }

    private _renderError(message: string): void {
        this.wrapper.innerHTML = "";

        const container = document.createElement("div");
        container.className =
            "flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 gap-2 cursor-pointer";
        container.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span class="text-sm text-red-500 dark:text-red-400">${message}</span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400">Click to try again</span>
        `;
        container.addEventListener("click", () => this._renderUploader());

        this.wrapper.appendChild(container);
    }

    private _renderVideo(url: string, caption: string): void {
        this.wrapper.innerHTML = "";

        const figure = document.createElement("figure");
        figure.className = "mb-4";

        const videoEl = document.createElement("video");
        videoEl.src = url;
        videoEl.controls = true;
        videoEl.preload = "metadata";
        videoEl.className = "w-full rounded-lg max-h-[500px] bg-zinc-100 dark:bg-zinc-900";

        figure.appendChild(videoEl);

        if (!this.readOnly) {
            const changeBtn = document.createElement("button");
            changeBtn.type = "button";
            changeBtn.textContent = "Change video";
            changeBtn.className =
                "mt-2 text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 underline cursor-pointer transition-colors block";
            changeBtn.addEventListener("click", () => this._renderUploader());
            figure.appendChild(changeBtn);
        }

        const captionEl = document.createElement("div");
        captionEl.setAttribute("data-video-caption", "true");
        captionEl.setAttribute(
            "data-placeholder",
            this.config.captionPlaceholder ?? "Video caption"
        );
        captionEl.className =
            "video-caption mt-2 text-center text-sm text-zinc-500 dark:text-zinc-500 outline-none";
        captionEl.contentEditable = this.readOnly ? "false" : "true";
        if (caption) captionEl.innerText = caption;

        figure.appendChild(captionEl);
        this.wrapper.appendChild(figure);
    }

    private async _uploadFile(file: File): Promise<void> {
        this._renderLoading();

        try {
            const formData = new FormData();
            formData.append(this.config.field ?? "file", file);

            const response = await fetch(this.config.endpoint, {
                method: "POST",
                body: formData,
            });

            const result = (await response.json()) as {
                success: number;
                file?: { url: string };
                error?: { message: string };
            };

            if (result.success === 1 && result.file?.url) {
                this.data = { file: { url: result.file.url }, caption: "" };
                this._renderVideo(result.file.url, "");
            } else {
                this._renderError(result.error?.message ?? "Upload failed");
            }
        } catch {
            this._renderError("Upload failed. Please try again.");
        }
    }
}
