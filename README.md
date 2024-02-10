<span style="text-align:center; width:100%; display: inline-block;">![SABRE.js](sabre.svg)</span>
# SABRE.js: Substation Alpha suBtitles REnderer
A Gpu Accelerated Javascript Advanced Substation Alpha Subtitles Renderer. 

<span style="text-align:center; width:100%; display: inline-block;">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![CodeFactor](https://www.codefactor.io/repository/github/sabre-js/sabre.js/badge)](https://www.codefactor.io/repository/github/sabre-js/sabre.js) [![](https://data.jsdelivr.com/v1/package/npm/@sabre-js/sabre/badge)](https://www.jsdelivr.com/package/npm/@sabre-js/sabre) [![Featured on Openbase](https://badges.openbase.com/js/featured/@sabre-js/sabre.svg?token=X7lxF2mBNtaAGL5OtiKQkLjR8uUzMVOJtDX45rCSq1g=)](https://openbase.com/js/@sabre-js/sabre?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)</span>

## What is SABRE.js?

SABRE.js is a full renderer for Substation Alpha Subtitles and Advanced Substation Alpha Subtitles.
It allows you to draw styled/stylized subtitles over web video with multiple fonts, colors, animations and effects.

<span style="text-align:center; width:100%; display: inline-block;"></span>[![karaoke demo loop](gallery/images/demo_loop.gif)](gallery/video/demo_loop.mp4)</video></span>

#### Other Similar software.

- Javascript-Subtitles-Octopus
- Libass
- XY-VSFilter

### Gallery
A gallery of major milestones in the development process.

To view the gallery click [here](/gallery/gallery.md) if you're using a decent browser or [here](/gallery/but_i_use_safari.md) if you like safari or internet explorer.

### Folder Structure

* src/ -- Main sourcecode for the project (excluding src/\_\_tests\_\_)
* src/\_\_tests\_\_/ -- Test code for test driven development.
* include/ -- Browser API definitions and internal API definitions for the Closure Compiler (Files in this folder aren't compiled).
* bin/ -- Output directory for production code.
* debugbin/ -- Output directory for debug code.
* scripts/ -- Contains scripts that are run by the makefile.
* tbin/ -- Contains the Closure Compiler and other build tools.
* temp_files/ -- Temporary files.
* test/ -- Directory used when running the debug server. 

### Documentation

Note: Version 2.0.0 of opentype.js is not yet released, in order to use this library currently you must build opentype.js from source.

How to include the library (from the jsdelivr CDN, this cdn is recommended as they publish usage statistics for each package):
```html
<script src="https://cdn.jsdelivr.net/npm/opentype.js@^2.0.0/dist/opentype.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@sabre-js/sabre@latest/dist/sabre.min.js"></script>
```
How to include the library (from the unpkg CDN, for the more privacy minded):
```html
<script src="https://unpkg.com/opentype.js@^2.0.0/dist/opentype.min.js"></script>
<script src="https://unpkg.com/@sabre-js/sabre@latest/dist/sabre.min.js"></script>
```

You can retrieve an instance of the library by calling `sabre.SABRERenderer()` inside an event handler.

Example:
```js
let renderer;
let fonts = [];
// Load the contents of the subtitle file.
fetch("subtitles.ass").then((response) => response.text()).then((subs) => {
    // Load the fonts using opentype.js and put them in the fonts array. (this function also returns a promise)
    opentype.load("arial.ttf", (font) => {
        fonts.push(font);
        // Initialize the renderer
        renderer = sabre.SABRERenderer(parseFont, {
            fonts:fonts,
            subtitles:subs,
            colorSpace:sabre.VideoColorSpaces.AUTOMATIC,
            resolution:[1280,720], // Display resolution of the video in CSS pixels.
            nativeResolution:[1280,720] // Resolution of the video file in real pixels (only used if the color space is AUTOMATIC or AUTOMATIC_PC).
        });
        // Schedule your frame callback using either requestAnimationFrame or requestVideoFrameCallback
    });
});

```
or you can initialize using the return value's functions as shown below:
```js
let renderer;
let fonts = [];
// Load the contents of the subtitle file.
fetch("subtitles.ass").then((response) => response.text()).then((subs) => {
    // Load the fonts using opentype.js and put them in the fonts array. (this function also returns a promise)
    opentype.load("arial.ttf", (font) => {
        fonts.push(font);
        // Initialize the renderer
        renderer = new sabre.SABRERenderer(parseFont);
        renderer.loadSubtitles(subs,fonts);
        renderer.setColorSpace(sabre.VideoColorSpaces.AUTOMATIC,1280,720); // Second and third parameters are the native resolution of the video file in real pixels (only used if the color space is AUTOMATIC or AUTOMATIC_PC).
        renderer.setViewport(1280,720); // Display resolution of the video in CSS pixels.
    });
});
```

You must pass the constructor a function that loads fonts using opentype.js similar to the one below:
```js
function parseFont(data) {
    return opentype.parse(data);
}
```

You may then call `loadSubtitles` passing in a string containing the contents of the subtitle file and set the
viewport with `setViewport` as shown in the example above. Anytime the video or player is resized you should call
`setViewport` with the new dimensions of the player.

Each frame, before you call any of the rendering functions, first call `checkReadyToRender` to see if the library is ready
to render a frame of subtitles.

### API

The documentation generator is a little buggy, anytime it says something is global, that means it's a property of the `sabre.SABRERenderer()` function's returned object.

#### Functions

<dl>
<dt><a href="#loadSubtitles">loadSubtitles(subtitles, fonts)</a> ⇒ <code>void</code></dt>
<dd><p>Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.</p>
</dd>
<dt><a href="#setColorSpace">setColorSpace(colorSpace, [width], [height])</a> ⇒ <code>void</code></dt>
<dd><p>Configures the output colorspace to the set value (or guesses when automatic is specified based on resolution).
Note: AUTOMATIC always assumes studio-swing (color values between 16-240), if you need full-swing (color values between 0-255)
that must be set by selecting AUTOMATIC_PC. AUTOMATIC and AUTOMATIC_PC are also incapable of determining if the
video is HDR, so you need to manually set either BT.2100_PQ or BT.2100_HLG if it is.
Note: HDR support is stubbed and unimplemented currently.</p>
</dd>
<dt><a href="#setViewport">setViewport(width, height)</a> ⇒ <code>void</code></dt>
<dd><p>Updates the resolution (in CSS pixels) at which the subtitles are rendered (if the player is resized, for example).</p>
</dd>
<dt><a href="#checkReadyToRender">checkReadyToRender()</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if the renderer is ready to render a frame.</p>
</dd>
<dt><a href="#getFrame">getFrame(time)</a> ⇒ <code>ImageBitmap</code></dt>
<dd><p>Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.</p>
</dd>
<dt><a href="#getFrameAsUri">getFrameAsUri(time, callback)</a> ⇒ <code>void</code></dt>
<dd><p>Fetches a rendered frame of subtitles as an object uri.</p>
</dd>
<dt><a href="#drawFrame">drawFrame(time, canvas, [contextType])</a> ⇒ <code>void</code></dt>
<dd><p>Fetches a rendered frame of subtitles to a canvas.</p>
</dd>
</dl>

<a name="loadSubtitles"></a>

#### loadSubtitles(subtitles, fonts) ⇒ <code>void</code>
Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| subtitles | <code>string</code> | the subtitle file's contents. |
| fonts | <code>Array.&lt;Font&gt;</code> | preloaded fonts necessary for this subtitle file (one of these MUST be Arial). |

<a name="setColorSpace"></a>

#### setColorSpace(colorSpace, [width], [height]) ⇒ <code>void</code>
Configures the output colorspace to the set value (or guesses when automatic is specified based on resolution).
Note: AUTOMATIC always assumes studio-swing (color values between 16-240), if you need full-swing (color values between 0-255)
that must be set by selecting AUTOMATIC_PC. AUTOMATIC and AUTOMATIC_PC are also incapable of determining if the
video is HDR, so you need to manually set either BT.2100_PQ or BT.2100_HLG if it is.
Note: HDR support is stubbed and unimplemented currently.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| colorSpace | <code>number</code> | the colorspace to use for output. |
| [width] | <code>number</code> | the x component of the video's resolution in regular pixels (only required when colorSpace is AUTOMATIC). |
| [height] | <code>number</code> | the y component of the video's resolution in regular pixels (only required when colorSpace is AUTOMATIC). |

<a name="setViewport"></a>

#### setViewport(width, height) ⇒ <code>void</code>
Updates the resolution (in CSS pixels) at which the subtitles are rendered (if the player is resized, for example).

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | the desired width of the resolution (in CSS pixels). |
| height | <code>number</code> | the desired height of the resolution (in CSS pixels). |

<a name="checkReadyToRender"></a>

#### checkReadyToRender() ⇒ <code>boolean</code>
Checks if the renderer is ready to render a frame.

**Kind**: global function  
**Returns**: <code>boolean</code> - is the renderer ready?  
**Access**: public  
<a name="getFrame"></a>

#### getFrame(time) ⇒ <code>ImageBitmap</code>
Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |

<a name="getFrameAsUri"></a>

#### getFrameAsUri(time, callback) ⇒ <code>void</code>
Fetches a rendered frame of subtitles as an object uri.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |
| callback | <code>function</code> | a callback that provides the URI for the image generated. |

<a name="drawFrame"></a>

#### drawFrame(time, canvas, [contextType]) ⇒ <code>void</code>
Fetches a rendered frame of subtitles to a canvas.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |
| canvas | <code>HTMLCanvasElement</code> \| <code>OffscreenCanvas</code> | the target canvas |
| [contextType] | <code>string</code> | the context type to use (must be one of "bitmap" or "2d"), defaults to "bitmap" unless unsupported by the browser, in which case "2d" is the default. |


&copy; 2012-2024 Patrick "ILOVEPIE" Rhodes Martin.
