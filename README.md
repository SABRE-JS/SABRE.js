![SABRE.js](sabre.svg)
# SABRE.js: Substation Alpha suBtitles REnderer
A Gpu Accelerated Javascript Advanced Substation Alpha Subtitles Renderer. 

<span style="text-align:center; width:100%; display: inline-block;">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![CodeFactor](https://www.codefactor.io/repository/github/sabre-js/sabre.js/badge)](https://www.codefactor.io/repository/github/sabre-js/sabre.js) [![](https://data.jsdelivr.com/v1/package/npm/@sabre-js/sabre/badge)](https://www.jsdelivr.com/package/npm/@sabre-js/sabre) [![Featured on Openbase](https://badges.openbase.com/js/featured/@sabre-js/sabre.svg?token=X7lxF2mBNtaAGL5OtiKQkLjR8uUzMVOJtDX45rCSq1g=)](https://openbase.com/js/@sabre-js/sabre?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)</span>

## What is SABRE.js?

SABRE.js is a full renderer for Substation Alpha Subtitles and Advanced Substation Alpha Subtitles.
It allows you to draw styled/stylized subtitles over web video with multiple fonts, colors, animations and effects.

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
How to include the library (from the jsdelivr CDN, this cdn is recommended as they publish usage statistics for each package):
```html
<script src="https://cdn.jsdelivr.net/npm/opentype.js@latest/dist/opentype.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@sabre-js/sabre@latest/dist/sabre.min.js"></script>
```
How to include the library (from the unpkg CDN, for the more privacy minded):
```html
<script src="https://unpkg.com/opentype.js@latest/dist/opentype.min.js"></script>
<script src="https://unpkg.com/@sabre-js/sabre@latest/dist/sabre.min.js"></script>
```

You can retrieve an instance of the library by calling `sabre.SABRERenderer` like so from a `load` event handler:
```js
let renderer;
window.addEventListener("load",() => {
    let subs = "";
    let fonts = [];
    // load the contents of the subtitle file into subs.
    // YOUR CODE HERE
    // load the fonts using opentype.js and put them in
    // the fonts array.
    // YOUR CODE HERE
    // pass the font parsing function to the renderer
    renderer = sabre.SABRERenderer(parseFont);
    renderer.loadSubtitles(subs,fonts);
    renderer.setViewport(1280,720); // use the video player's dimensions.
    // schedule your frame callback using either requestAnimationFrame or requestVideoFrameCallback
});
```
and passing it a function that loads fonts using opentype.js as shown below:
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

#### Functions

<dl>
<dt><a href="#loadSubtitles">loadSubtitles(subsText, fonts)</a> ⇒ <code>void</code></dt>
<dd><p>Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.</p>
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

#### loadSubtitles(subsText, fonts) ⇒ <code>void</code>
Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| subsText | <code>string</code> | the subtitle file's contents. |
| fonts | <code>Array.&lt;Font&gt;</code> | preloaded fonts necessary for this subtitle file (one of these MUST be Arial). |

<a name="setViewport"></a>

#### setViewport(width, height) ⇒ <code>void</code>
Updates the resolution (in CSS pixels) at which the subtitles are rendered (if the player is resized, for example).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | the desired width of the resolution (in CSS pixels). |
| height | <code>number</code> | the desired height of the resolution (in CSS pixels). |

<a name="checkReadyToRender"></a>

#### checkReadyToRender() ⇒ <code>boolean</code>
Checks if the renderer is ready to render a frame.

**Kind**: global function  
**Returns**: <code>boolean</code> - is the renderer ready?  
<a name="getFrame"></a>

#### getFrame(time) ⇒ <code>ImageBitmap</code>
Fetches a rendered frame of subtitles as an ImageBitmap, returns null if ImageBitmap is unsupported.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |

<a name="getFrameAsUri"></a>

#### getFrameAsUri(time, callback) ⇒ <code>void</code>
Fetches a rendered frame of subtitles as an object uri.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |
| callback | <code>function</code> | a callback that provides the URI for the image generated. |

<a name="drawFrame"></a>

#### drawFrame(time, canvas, [contextType]) ⇒ <code>void</code>
Fetches a rendered frame of subtitles to a canvas.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the time at which to draw subtitles. |
| canvas | <code>HTMLCanvasElement</code> \| <code>OffscreenCanvas</code> | the target canvas |
| [contextType] | <code>string</code> | the context type to use (must be one of "bitmap" or "2d"), defaults to "bitmap" unless unsupported by the browser, in which case "2d" is the default. |


&copy; 2012-2022 Patrick "ILOVEPIE" Rhodes Martin.