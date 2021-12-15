/*
 |   shader.js
 |----------------
 |  shader.js is copyright Patrick Rhodes Martin 2013,2017, used with permission.
 |
 |-
*/

/**
 * @fileoverview shader compiler.
 * @suppress {globalThis}
 */
const shaderlog = {};
const statetracker = {};

function isArrayish(a) {
    return (
        a instanceof Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Int8Array ||
        a instanceof Int16Array ||
        a instanceof Int32Array ||
        a instanceof Uint8Array ||
        a instanceof Uint16Array ||
        a instanceof Uint32Array
    );
}

const ShaderPrototype = Object.create(Object, {
    _shader: {
        value: null,
        writable: true
    },

    _keys: {
        value: null,
        writable: true
    },

    _textures: {
        value: null,
        writable: true
    },

    _attributes: {
        value: null,
        writable: true
    },

    _isUnchanged: {
        value: function (property, uniformid, context) {
            let val = property.val;
            let cval = statetracker[context][uniformid];
            let i;
            let unchanged = true;
            if (val === cval) return true;
            if (isArrayish(val) && isArrayish(cval)) {
                if (val.length !== cval.length) return false;
                else
                    for (i = 0; i < val.length; i++)
                        unchanged = unchanged && val[i] === cval[i];
                return unchanged;
            }
            return false;
        },
        writable: false
    },

    "load": {
        value: function (vertexUrl, fragmentUrl, expire) {
            this._keys = {};
            this._textures = {};
            this._attributes = {};
            let xmlhttp = null;
            if (
                typeof global.localStorage === "undefined" ||
                typeof expire === "undefined" ||
                expire <= 0
            ) {
                if (typeof shaderlog[vertexUrl] === "undefined") {
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", vertexUrl, false);
                    xmlhttp.overrideMimeType("text/plain");
                    xmlhttp.send();
                    if (xmlhttp.status === 200) {
                        shaderlog[vertexUrl] = xmlhttp.responseText;
                        this.vertSrc = xmlhttp.responseText;
                    }
                } else {
                    this.vertSrc = shaderlog[vertexUrl];
                }
                if (typeof shaderlog[fragmentUrl] === "undefined") {
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", fragmentUrl, false);
                    xmlhttp.overrideMimeType("text/plain");
                    xmlhttp.send();
                    if (xmlhttp.status === 200) {
                        shaderlog[fragmentUrl] = xmlhttp.responseText;
                        this.fragSrc = xmlhttp.responseText;
                    }
                } else {
                    this.fragSrc = shaderlog[fragmentUrl];
                }
                return;
            }
            let storageNameVertex = "shader.js|vrtx|" + vertexUrl;
            let storageNameFragment = "shader.js|frag|" + fragmentUrl;
            if (
                global.localStorage.getItem(storageNameVertex) === null ||
                parseInt(
                    global.localStorage
                        .getItem(storageNameVertex)
                        .split("\u0003")[1],
                    16
                ) < global.Date.now()
            ) {
                xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", vertexUrl, false);
                xmlhttp.overrideMimeType("text/plain");
                xmlhttp.send();
                if (xmlhttp.status === 200) {
                    global.localStorage.setItem(
                        storageNameVertex,
                        xmlhttp.responseText +
                            "\u0003" +
                            (expire * 86400000 + global.Date.now()).toString(16)
                    );
                    shaderlog[vertexUrl] = xmlhttp.responseText;
                    this.vertSrc = xmlhttp.responseText;
                }
            } else {
                this.vertSrc = global.localStorage
                    .getItem(storageNameVertex)
                    .split("\u0003")[0];
            }
            if (
                global.localStorage.getItem(storageNameFragment) === null ||
                parseInt(
                    global.localStorage
                        .getItem(storageNameFragment)
                        .split("\u0003")[1],
                    16
                ) < global.Date.now()
            ) {
                xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", fragmentUrl, false);
                xmlhttp.overrideMimeType("text/plain");
                xmlhttp.send();
                if (xmlhttp.status === 200) {
                    global.localStorage.setItem(
                        storageNameFragment,
                        xmlhttp.responseText +
                            "\u0003" +
                            (expire * 86400000 + global.Date.now()).toString(16)
                    );
                    shaderlog[fragmentUrl] = xmlhttp.responseText;
                    this.fragSrc = xmlhttp.responseText;
                }
            } else {
                this.fragSrc = global.localStorage
                    .getItem(storageNameFragment)
                    .split("\u0003")[0];
            }
        }
    },

    "updateOption": {
        value: function (key, value) {
            if (this._keys[key]) {
                this._keys[key].val = value;
                return true;
            }
            return false;
        },
        writable: false
    },

    "addOption": {
        value: function (key, value, type) {
            if (this._keys[key] === null) {
                this._keys[key] = { val: value, datatype: type };
                return true;
            }
            return false;
        },
        writable: false
    },

    /*'getTexture':{
		value: function(gl,name){
			var getTexture = function(ctx){
				return gl.createTexture();
			};
			if(!textures[name]){
				if (arguments.length > 2){
					if (typeof(arguments[2])==="function"){
						getTexture = arguments[2];
					}
				}
				this._textures[name] = getTexture(gl);
			}
			return this._textures[name];
		},
		writable: false
	},*/

    /*'setTexture':{
		value: function(gl,name,image){
			if(image instanceof HTMLImageElement){
				
			}
		}
	}*/

    "bindShader": {
        value: function (gl) {
            gl.useProgram(this._shader);
            let props = Object.keys(this._keys);
            let key = null;
            let uniform = null;
            let type = null;
            for (let i = 0; i < props.length; i++) {
                key = props[i];
                uniform = gl.getUniformLocation(this._shader, key);
                if (this._isUnchanged(this._keys[key], uniform, gl)) continue;
                if ((uniform || null) !== null) {
                    type = this._keys[key].datatype;
                    switch (type) {
                        case "1f":
                            gl.uniform1f(uniform, this._keys[key].val);
                            break;
                        case "2f":
                            gl.uniform2f(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1]
                            );
                            break;
                        case "3f":
                            gl.uniform3f(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1],
                                this._keys[key].val[2]
                            );
                            break;
                        case "4f":
                            gl.uniform4f(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1],
                                this._keys[key].val[2],
                                this._keys[key].val[3]
                            );
                            break;
                        case "1i":
                            gl.uniform1i(uniform, this._keys[key].val);
                            break;
                        case "2i":
                            gl.uniform2i(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1]
                            );
                            break;
                        case "3i":
                            gl.uniform3i(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1],
                                this._keys[key].val[2]
                            );
                            break;
                        case "4i":
                            gl.uniform4i(
                                uniform,
                                this._keys[key].val[0],
                                this._keys[key].val[1],
                                this._keys[key].val[2],
                                this._keys[key].val[3]
                            );
                            break;
                        case "1fv":
                            gl.uniform1fv(uniform, this._keys[key].val);
                            break;
                        case "2fv":
                            gl.uniform2fv(uniform, this._keys[key].val);
                            break;
                        case "3fv":
                            gl.uniform3fv(uniform, this._keys[key].val);
                            break;
                        case "4fv":
                            gl.uniform4fv(uniform, this._keys[key].val);
                            break;
                        case "1iv":
                            gl.uniform1iv(uniform, this._keys[key].val);
                            break;
                        case "2iv":
                            gl.uniform2iv(uniform, this._keys[key].val);
                            break;
                        case "3iv":
                            gl.uniform3iv(uniform, this._keys[key].val);
                            break;
                        case "4iv":
                            gl.uniform4iv(uniform, this._keys[key].val);
                            break;
                        case "Matrix2fv":
                            gl.uniformMatrix2fv(
                                uniform,
                                false,
                                this._keys[key].val
                            );
                            break;
                        case "Matrix3fv":
                            gl.uniformMatrix3fv(
                                uniform,
                                false,
                                this._keys[key].val
                            );
                            break;
                        case "Matrix4fv":
                            gl.uniformMatrix4fv(
                                uniform,
                                false,
                                this._keys[key].val
                            );
                            break;
                    }
                    statetracker[uniform] = this._keys[key].val;
                }
            }
        },

        writable: false
    },

    "getShader": {
        value: function () {
            return this._shader;
        },
        writable: false
    },

    "getAttribute": {
        value: function (gl, name) {
            if (typeof this._attributes[name] === "undefined") {
                let attrib = gl.getAttribLocation(this._shader, name);
                this._attributes[name] = attrib;
                return attrib;
            } else {
                return this._attributes[name];
            }
        }
    },

    "compile": {
        value: function (gl, defines, err, version) {
            statetracker[gl] = statetracker[gl] ?? {};
            if (typeof err === "undefined" || err === null) {
                err = defines;
                defines = null;
            }
            if (typeof version === "undefined" || version === null) {
                version = "100";
            }
            let shaderProgram;
            this._shader = shaderProgram = gl.createProgram();

            this._vert = this._compile(
                gl,
                this.vertSrc,
                defines,
                gl.VERTEX_SHADER,
                version
            );
            this._frag = this._compile(
                gl,
                this.fragSrc,
                defines,
                gl.FRAGMENT_SHADER,
                version
            );

            gl.attachShader(shaderProgram, this._vert);
            gl.attachShader(shaderProgram, this._frag);
            gl.linkProgram(shaderProgram);

            if (
                !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) ||
                gl.isContextLost()
            ) {
                gl.deleteProgram(shaderProgram);
                try {
                    gl.deleteShader(this._vert);
                } catch (e) {}
                try {
                    gl.deleteShader(this._frag);
                } catch (e) {}
                err();
                return;
            }
        },
        writable: false
    },

    _compile: {
        value: function (gl, source, defines, type, version) {
            let shaderHeader = "";
            if (version && version !== "100") {
                shaderHeader += "#version " + version + " es\n";
            }
            shaderHeader += "#ifndef WEB_GL\n";
            shaderHeader += "#define WEB_GL\n";
            shaderHeader += "#endif\n";
            shaderHeader += "#ifdef GL_ES\n";
            shaderHeader += "precision highp float;\n";
            shaderHeader += "precision highp int;\n";
            shaderHeader += "#endif\n";
            if (defines !== null) {
                let define_names = Object.keys(defines);
                for (let i = 0; i < define_names.length; i++) {
                    if (defines[define_names[i]] === true)
                        shaderHeader += "#define " + define_names[i] + "\n";
                    else if (defines[define_names[i]] !== null)
                        shaderHeader +=
                            "#define " +
                            define_names[i] +
                            " " +
                            defines[define_names[i]].toString() +
                            "\n";
                }
            }

            let shader = gl.createShader(type);

            gl.shaderSource(shader, shaderHeader + source);
            gl.compileShader(shader);

            if (
                !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ||
                gl.isContextLost()
            ) {
                console.log(gl.getShaderInfoLog(shader));
                try {
                    gl.deleteShader(shader);
                } catch (e) {}
                return null;
            }

            return shader;
        }
    }
});

sabre["Shader"] = function () {
    return Object.create(ShaderPrototype);
};
sabre["Shader"]["resetStateEngine"] = function () {
    let keys = Object.keys(statetracker);
    for (let i = 0; i < keys.length; i++) statetracker[keys[i]] = null;
};
