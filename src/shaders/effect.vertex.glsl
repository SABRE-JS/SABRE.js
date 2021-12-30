attribute vec3 a_position;

varying vec2 v_texcoord;

void main(){
    gl_Position = vec4(a_position, 1);
    v_texcoord = (a_position.xy+vec2(1,1))/2.0;
}