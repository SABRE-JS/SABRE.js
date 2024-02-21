attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec2 a_maskcoord;

varying vec2 v_texcoord;
varying vec2 v_maskcoord;

void main(){
    vec4 position = vec4(a_position, 1.0);
    gl_Position = position;
    v_texcoord = a_texcoord;
    v_maskcoord = a_maskcoord;
}