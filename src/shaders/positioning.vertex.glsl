attribute vec3 a_position;
attribute vec2 a_texcoord;
uniform mat3 u_matrix;

varying vec2 v_texcoord;

void main(){
    gl_Position = vec4(u_matrix * a_position, 1);
    v_texcoord = a_texcoord;
}