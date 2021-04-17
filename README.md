![SABRE.js](sabre.svg)

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

#### Functions

<dl>
<dt><a href="#gassert">gassert(complaint, test)</a></dt>
<dd><p>Assert using grumbles.</p>
</dd>
<dt><a href="#loadSubtitles">loadSubtitles(subsText)</a></dt>
<dd><p>Delegate method; see load.</p>
</dd>
<dt><a href="#setViewport">setViewport(width, height)</a></dt>
<dd><p>Delegate method; see updateViewport.</p>
</dd>
<dt><a href="#getFrame">getFrame(time)</a> ⇒ <code>string</code></dt>
<dd><p>Delegate method; see frame.</p>
</dd>
</dl>

#### Typedefs

<dl>
<dt><a href="#TreeNode">TreeNode</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="gassert"></a>

#### gassert(complaint, test)

Assert using grumbles.

**Kind**: global function

| Param     | Type                         |
| --------- | ---------------------------- |
| complaint | <code>sabre.Complaint</code> |
| test      | <code>boolean</code>         |

<a name="loadSubtitles"></a>

#### loadSubtitles(subsText)

Delegate method; see load.

**Kind**: global function

| Param    | Type                |
| -------- | ------------------- |
| subsText | <code>string</code> |

<a name="setViewport"></a>

#### setViewport(width, height)

Delegate method; see updateViewport.

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| width  | <code>number</code> |
| height | <code>number</code> |

<a name="getFrame"></a>

#### getFrame(time) ⇒ <code>string</code>

Delegate method; see frame.

**Kind**: global function

| Param | Type                |
| ----- | ------------------- |
| time  | <code>number</code> |

<a name="TreeNode"></a>

#### TreeNode : <code>Object</code>

**Kind**: global typedef

&copy; 2012-2021 Patrick "ILOVEPIE" Rhodes Martin.
