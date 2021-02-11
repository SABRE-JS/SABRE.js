# SABRE.js: Substation Alpha suBtitles REnderer

A Gpu Accelerated Javascript Advanced Substation Alpha Subtitles Renderer.

<span style="text-align:center; width:100vw;display:inline-block;">[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)</span>

## What is the SABRE.js?

SABRE.js is a full renderer for Substation Alpha Subtitles and Advanced Substation Alpha Subtitles.

#### Other Similar software.

-   Subtitles-Octopus
-   Libass
-   XY-VSFilter

### Documentation

## Functions

<dl>
<dt><a href="#gassert">gassert(complaint, test)</a></dt>
<dd><p>Assert using grumbles.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Sets the alignment of the event using the old style.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Sets the alignment of the event using the new style.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Sets the alpha component of the specified color.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles boldface for text.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles edge blur for text and shapes.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles gaussian edge blur for text and shapes.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles outline widths.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles color settings.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles shearing.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles encoding.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles switching fonts.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles rotation.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Increases or decreases font size, or sets font size.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles font scaling.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles font spacing.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles italicization.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles karaoke.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles motion animation.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles setting draw mode.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles Baseline offset.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles setting the position.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles wrapping style.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles changing or resetting styling.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles drop shadow.</p>
</dd>
<dt><a href="#function">function(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles transitions.</p>
</dd>
<dt><a href="#tag_handler">tag_handler(timeInfo, setStyle, overrides, parameters)</a></dt>
<dd><p>Handles underline.</p>
</dd>
<dt><a href="#loadSubtitles">loadSubtitles(subsText)</a></dt>
<dd><p>Delegate method; see main_prototype.load above.</p>
</dd>
<dt><a href="#setViewport">setViewport(width, height)</a></dt>
<dd><p>Delegate method; see main_prototype.updateViewport above.</p>
</dd>
<dt><a href="#getFrame">getFrame(time)</a> ⇒ <code>string</code></dt>
<dd><p>Delegate method; see main_prototype.frame above.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TextRenderingProperties">TextRenderingProperties</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#TreeNode">TreeNode</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="gassert"></a>

## gassert(complaint, test)

Assert using grumbles.

**Kind**: global function

| Param     | Type                         |
| --------- | ---------------------------- |
| complaint | <code>sabre.Complaint</code> |
| test      | <code>boolean</code>         |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Sets the alignment of the event using the old style.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Sets the alignment of the event using the new style.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Sets the alpha component of the specified color.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles boldface for text.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles edge blur for text and shapes.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles gaussian edge blur for text and shapes.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles outline widths.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles color settings.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles shearing.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles encoding.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles switching fonts.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles rotation.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Increases or decreases font size, or sets font size.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles font scaling.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles font spacing.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles italicization.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles karaoke.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles motion animation.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles setting draw mode.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles Baseline offset.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles setting the position.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles wrapping style.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles changing or resetting styling.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles drop shadow.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="function"></a>

## function(timeInfo, setStyle, overrides, parameters)

Handles transitions.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="tag_handler"></a>

## tag_handler(timeInfo, setStyle, overrides, parameters)

Handles underline.

**Kind**: global function

| Param      | Type                               |
| ---------- | ---------------------------------- |
| timeInfo   | <code>Object</code>                |
| setStyle   | [<code>function</code>](#function) |
| overrides  | <code>SSAStyleOverride</code>      |
| parameters | <code>Array.&lt;?string&gt;</code> |

<a name="loadSubtitles"></a>

## loadSubtitles(subsText)

Delegate method; see main_prototype.load above.

**Kind**: global function

| Param    | Type                |
| -------- | ------------------- |
| subsText | <code>string</code> |

<a name="setViewport"></a>

## setViewport(width, height)

Delegate method; see main_prototype.updateViewport above.

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| width  | <code>number</code> |
| height | <code>number</code> |

<a name="getFrame"></a>

## getFrame(time) ⇒ <code>string</code>

Delegate method; see main_prototype.frame above.

**Kind**: global function

| Param | Type                |
| ----- | ------------------- |
| time  | <code>number</code> |

<a name="TextRenderingProperties"></a>

## TextRenderingProperties : <code>Object</code>

**Kind**: global typedef  
<a name="TreeNode"></a>

## TreeNode : <code>Object</code>

**Kind**: global typedef

&copy; 2012-2021 Patrick "ILOVEPIE" Rhodes Martin.
