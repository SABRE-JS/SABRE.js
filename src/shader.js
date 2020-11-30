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
sabre["ShaderPrototype"] = Object.create(Object, {
    _shader: {
        value: null,
        writable: true
    },
    _keys: {
        value: Object.create(Object),
        writable: true
    },
    _textures: {
        value: Object.create(Object),
        writable: true
    },

    _isUnchanged: {
        value: function (property) {
            var val = property.val;
            var cval = property.cval;
            var i;
            var unchanged = true;
            if (val === cval) return true;
            if (val instanceof Array && cval instanceof Array) {
                if (val.length != cval.length) return false;
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
            if (
                typeof global.localStorage === "undefined" ||
                typeof expire === "undefined" ||
                expire <= 0
            ) {
                if (typeof shaderlog[vertexUrl] === "undefined") {
                    var xmlhttp = new XMLHttpRequest();
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
                    var xmlhttp = new XMLHttpRequest();
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
            var storageNameVertex = "shader.js|vrtx|" + vertexUrl;
            var storageNameFragment = "shader.js|frag|" + fragmentUrl;
            if (
                window.localStorage.getItem(storageNameVertex) === null ||
                parseInt(
                    window.localStorage
                        .getItem(storageNameVertex)
                        .split("\u0003")[1],
                    16
                ) < window.Date.now()
            ) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", vertexUrl, false);
                xmlhttp.overrideMimeType("text/plain");
                xmlhttp.send();
                if (xmlhttp.status === 200) {
                    window.localStorage.setItem(
                        storageNameVertex,
                        xmlhttp.responseText +
                            "\u0003" +
                            (expire * 86400000 + window.Date.now()).toString(16)
                    );
                    shaderlog[vertexUrl] = xmlhttp.responseText;
                    this.vertSrc = xmlhttp.responseText;
                }
            } else {
                this.vertSrc = window.localStorage
                    .getItem(vertexUrl)
                    .split("\u0003")[0];
            }
            if (
                window.localStorage.getItem(storageNameFragment) === null ||
                parseInt(
                    window.localStorage
                        .getItem(storageNameFragment)
                        .split("\u0003")[1],
                    16
                ) < window.Date.now()
            ) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", fragmentUrl, false);
                xmlhttp.overrideMimeType("text/plain");
                xmlhttp.send();
                if (xmlhttp.status === 200) {
                    window.localStorage.setItem(
                        storageNameFragment,
                        xmlhttp.responseText +
                            "\u0003" +
                            (expire * 86400000 + window.Date.now()).toString(16)
                    );
                    shaderlog[fragmentUrl] = xmlhttp.responseText;
                    this.fragSrc = xmlhttp.responseText;
                }
            } else {
                this.fragSrc = window.localStorage
                    .getItem(fragmentUrl)
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
            if (this._keys[key] == null) {
                this._keys[key] = { val: value, datatype: type, cval: null };
                return true;
            }
            return false;
        },
        writable: false
    },

    /*'getTexture':{
		value: function(gl,name){
			var getTexture = function(ctx){
				return ctx.createTexture();
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
            var props = this._keys.keys(this._keys);
            var key = null;
            var uniform = null;
            var type = null;
            for (var i = 0; i < props.length; i++) {
                key = props[i];
                if (this._isUnchanged(this._keys[key])) continue;
                uniform = gl.getUniformLocation(this._shader, key);
                if ((uniform || null) != null) {
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
                    this._keys[key].cval = this._keys[key].val;
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

    "compile": {
        value: function (gl, defines, err, version) {
            if (typeof err == "undefined" || err == null) {
                err = defines;
                defines = null;
            }
            if (typeof version == "undefined" || version == null) {
                version = "100";
            }
            var shaderProgram;
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
                gl.deleteShader(this._vert);
                gl.deleteShader(this._frag);
                err();
                return;
            }
        },
        writable: false
    },

    _compile: {
        value: function (gl, source, defines, type, version) {
            var shaderHeader = "";
            if (version && version != "100") {
                shaderHeader += "#version " + version + " es\n";
            }
            shaderHeader += "#ifndef WEB_GL\n";
            shaderHeader += "#define WEB_GL\n";
            shaderHeader += "#endif\n";
            shaderHeader += "#ifdef GL_ES\n";
            shaderHeader += "precision highp float;\n";
            shaderHeader += "precision highp int;\n";
            shaderHeader += "#endif\n";
            if (defines != null) {
                var define_names = Object.keys(defines);
                for (var i = 0; i < define_names.length; i++) {
                    if (defines[define_names[i]] == true)
                        shaderHeader += "#define " + define_names[i] + "\n";
                    else if (defines[define_names[i]])
                        shaderHeader +=
                            "#define " +
                            define_names[i] +
                            " " +
                            defines[define_names[i]].toString() +
                            "\n";
                }
            }

            var shader = gl.createShader(type);

            gl.shaderSource(shader, shaderHeader + source);
            gl.compileShader(shader);

            if (
                !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ||
                gl.isContextLost()
            ) {
                console.log(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }
    }
});
