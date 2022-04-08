![SABRE.js](sabre.svg)
# SABRE.js: Substation Alpha suBtitles REnderer
A Gpu Accelerated Javascript Advanced Substation Alpha Subtitles Renderer. 

<span style="text-align:center; width:100%; display: inline-block;">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![CodeFactor](https://www.codefactor.io/repository/github/sabre-js/sabre.js/badge)](https://www.codefactor.io/repository/github/sabre-js/sabre.js)</span>

## What is the SABRE.js?

SABRE.js is a full renderer for Substation Alpha Subtitles and Advanced Substation Alpha Subtitles.
It allows you to draw styled/stylized subtitles over web video with multiple fonts, colors, animations and effects.

#### Other Similar software.

- Javascript-Subtitles-Octopus
- Libass
- XY-VSFilter

### Gallery
A gallery of major milestones in the development process.

To view the gallery click [here](/gallery/gallery.md) if you're using a decent browser or [here](/gallery/but_i_use_safari.md) if you like safari or internet explorer.

### Documentation

How to include the library (from the unpkg CDN):
```html
<script src="https://unpkg.com/@sabre-js/sabre/dist/sabre.min.js"></script>
```

You can retrieve an instance of the library by calling `sabre.SABRERenderer` like so from a `load` event handler:
```js
window.addEventListener("load",() => {
    // pass the function to the renderer
    let renderer = sabre.SABRERenderer(loadFont);
    //more code here
});
```
and passing it a function that loads fonts using the CSS Font loading API:
```js
function loadFont(name) {
    // check if font is already loaded
    if (!document.fonts.check("12px '" + name + "'")){
        // if the name has an extension, load from local fonts
        if (name.indexOf(".") !== -1) {
            const newFont = new FontFace(name, `url(./fonts/${name})`);
            newFont.load().then((font) => document.fonts.add(font));
        }else{
            // otherwise, load from google fonts and add stylesheet to document
            let link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("media", "print");
            link.setAttribute("type", "text/css");
            link.setAttribute("onload", "this.media='all';");
            link.setAttribute(
                "href",
                `https://fonts.googleapis.com/css?family=${name}:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i`
            );
            document.head.appendChild(link);
        }        
    }
    //Force the font to load.
    let force_load = document.createElement("span");
    force_load.setAttribute(
        "style",
        `font-family: '${name}';position:absolute;top:-999999px;left:0px;`
    );
    force_load.appendChild(document.createTextNode("Force Load"));
    document.body.appendChild(force_load);
}
```

You may then call `loadSubtitles` passing in a string containing the contents of the subtitle file.


Anytime the video or player is resized you should call `setViewport` with the current dimensions of the player.

You should also call `setViewport` once with the dimensions of the video just after you load the subtitle file.

Each frame before you call any of the rendering functions first call `checkReadyToRender` to see if the library is ready
to render a frame of subtitles.

### API

#### Functions

<dl>
<dt><a href="#loadSubtitles">loadSubtitles(subsText)</a> ⇒ <code>void</code></dt>
<dd><p>Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.</p>
</dd>
<dt><a href="#setViewport">setViewport(width, height)</a> ⇒ <code>void</code></dt>
<dd><p>Updates the resolution at which the subtitles are rendered (if the player is resized, for example).</p>
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

#### loadSubtitles(subsText) ⇒ <code>void</code>
Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.

**Kind**: global function  

| Param | Type |
| --- | --- |
| subsText | <code>string</code> | 

<a name="setViewport"></a>

#### setViewport(width, height) ⇒ <code>void</code>
Updates the resolution at which the subtitles are rendered (if the player is resized, for example).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | the desired width of the resolution. |
| height | <code>number</code> | the desired height of the resolution. |

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
