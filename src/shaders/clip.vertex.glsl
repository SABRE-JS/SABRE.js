attribute vec2 a_position;

uniform vec2 u_aspectscale;

varying vec2 v_texcoord;

void main(){
    vec4 position = vec4(a_position, 0, 1);
    position.x *= u_aspectscale.x;
    position.y *= u_aspectscale.y;
    position.x -= 1.0;
    position.y -= 1.0;
    gl_Position = position;
    v_texcoord = (position.xy+vec2(1.0,1.0))/2.0;
}