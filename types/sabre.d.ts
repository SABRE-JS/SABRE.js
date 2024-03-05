type CanvasDrawable = HTMLCanvasElement | OffscreenCanvas;
type SABREOptions = {
    fonts?: Array<Font>,
    subtitles?: ArrayBuffer,
    colorSpace?:number,
    resolution?:number[],
    nativeResolution?:number[]
}
type ContextType = "2d" | "bitmap";
declare namespace sabre {
    namespace VideoColorSpace {
        const AUTOMATIC: number;
        const AUTOMATIC_PC: number;
        const RGB: number;
        const BT601_TV: number;
        const BT601_PC: number;
        const BT709_TV: number;
        const BT709_PC: number;
        const BT2020_TV: number;
        const BT2020_PC: number;
        const BT2020_CL_TV: number;
        const BT2020_CL_PC: number;
        const BT2100_PQ: number;
        const BT2100_HLG: number;
        const SMPTE240M_TV: number;
        const SMPTE240M_PC: number;
        const FCC_TV: number;
        const FCC_PC: number;
    }
    class SABRERenderer {
        constructor(options?: SABREOptions);

        loadSubtitles(subs: ArrayBuffer, fonts: Array<Font>): void;
        
        setColorSpace(colorSpace: number, width?: number, height?: number): void;

        setViewport(width: number, height: number): void;

        checkReadyToRender(): boolean;

        getFrame(time: number): ImageBitmap;

        getFrameAsUri(time: number, callback: (objUri: string) => void): void;

        drawFrame(time: number, canvas: CanvasDrawable, contextType?: ContextType): void;
    }
}