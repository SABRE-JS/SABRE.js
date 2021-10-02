![SABRE.js](sabre.svg)

# SABRE.js: Substation Alpha suBtitles REnderer

A Gpu Accelerated Javascript Advanced Substation Alpha Subtitles Renderer.

<span style="text-align:center; width:100vw;display:inline-block;">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![CodeFactor](https://www.codefactor.io/repository/github/sabre-js/sabre.js/badge)](https://www.codefactor.io/repository/github/sabre-js/sabre.js)</span>

## What is the SABRE.js?

SABRE.js is a full renderer for Substation Alpha Subtitles and Advanced Substation Alpha Subtitles.

#### Other Similar software.

-   Subtitles-Octopus
-   Libass
-   XY-VSFilter

### Documentation

You can retrieve a instance of the library by calling `sabre.SABRERenderer(fontLoadingFunction)` and passing
it a function that loads fonts using the CSS Font loading API.

#### Functions

<dl>
<dt><a href="#loadSubtitles">loadSubtitles(subsText)</a></dt>
<dd><p>Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.</p>
</dd>
<dt><a href="#setViewport">setViewport(width, height)</a></dt>
<dd><p>Updates the resolution/scale at which the subtitles are rendered (if the player is resized, for example).</p>
</dd>
<dt><a href="#getFrame">getFrame(time)</a> ⇒ <code>string</code></dt>
<dd><p>Fetches a rendered frame of subtitles as an object url.</p>
</dd>
</dl>

<a name="loadSubtitles"></a>

#### loadSubtitles(subsText)

Begins the process of parsing the passed subtitles in SSA/ASS format into subtitle events.

**Kind**: global function

| Param    | Type                |
| -------- | ------------------- |
| subsText | <code>string</code> |

<a name="setViewport"></a>

#### setViewport(width, height)

Updates the resolution/scale at which the subtitles are rendered (if the player is resized, for example).

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| width  | <code>number</code> |
| height | <code>number</code> |

<a name="getFrame"></a>

#### getFrame(time) ⇒ <code>string</code>

Fetches a rendered frame of subtitles as an object url.

**Kind**: global function

| Param | Type                |
| ----- | ------------------- |
| time  | <code>number</code> |

&copy; 2012-2021 Patrick "ILOVEPIE" Rhodes Martin.
