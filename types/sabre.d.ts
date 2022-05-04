type CanvasDrawable = HTMLCanvasElement | OffscreenCanvas;
declare namespace sabre {
    class SABRERenderer {
        constructor(loadFont: (name: string) => void);

        loadSubtitles(subsText: string): void;
        
        setViewport(width: number, height: number): void;

        checkReadyToRender(): boolean;

        getFrame(time: number): ImageBitmap;

        getFrameAsUri(time: number, callback: (objUri: string) => void): void;

        drawFrame(time: number, canvas: CanvasDrawable, contextType?: string): void;
    }
}