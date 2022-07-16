attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec2 a_maskcoord;

uniform vec2 u_aspectscale;
uniform mat4 u_pre_rotation_matrix;
uniform mat4 u_rotation_matrix_x;
uniform mat4 u_rotation_matrix_y;
uniform mat4 u_rotation_matrix_z;
uniform mat4 u_post_rotation_matrix;

varying vec2 v_texcoord;
varying vec2 v_maskcoord;

void main(){
    vec4 position = u_pre_rotation_matrix * vec4(a_position, 1);
    position = u_rotation_matrix_x * position;
    position = u_rotation_matrix_y * position;
    position = u_rotation_matrix_z * position;
    position = u_post_rotation_matrix * position;
    position.x *= u_aspectscale.x;
    position.y *= u_aspectscale.y;
    position.z *= min(u_aspectscale.x,u_aspectscale.y);
    position.x -= 1.0;
    position.y -= 1.0;
    gl_Position = position;
    v_texcoord = a_texcoord;
    v_maskcoord = a_maskcoord;
}