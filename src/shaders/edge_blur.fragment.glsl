varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform float u_resolution_x;
uniform float u_resolution_y;

void main(){
    float pixel_x = 1.0/u_resolution_x;
    float pixel_y = 1.0/u_resolution_y;
    vec4 accumulator = texture2D(u_texture, clamp(v_texcoord+vec2(-pixel_x,-pixel_y),0.0,1.0));
    accumulator += 2.0*texture2D(u_texture, clamp(v_texcoord+vec2(0,-pixel_y),0.0,1.0));
    accumulator += texture2D(u_texture, clamp(v_texcoord+vec2(pixel_x,-pixel_y),0.0,1.0));
    accumulator += 2.0*texture2D(u_texture, clamp(v_texcoord+vec2(-pixel_x,0),0.0,1.0));
    accumulator += 4.0*texture2D(u_texture, v_texcoord);
    accumulator += 2.0*texture2D(u_texture, clamp(v_texcoord+vec2(pixel_x,0),0.0,1.0));
    accumulator += texture2D(u_texture, clamp(v_texcoord+vec2(-pixel_x,pixel_y),0.0,1.0));
    accumulator += 2.0*texture2D(u_texture, clamp(v_texcoord+vec2(0,pixel_y),0.0,1.0));
    accumulator += texture2D(u_texture, clamp(v_texcoord+vec2(pixel_x,pixel_y),0.0,1.0));

    gl_FragColor = accumulator/16.0;
}