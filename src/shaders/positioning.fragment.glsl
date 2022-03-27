
varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform vec4 u_primary_color;
uniform vec4 u_secondary_color;
uniform vec4 u_tertiary_color;
uniform vec4 u_quaternary_color;

void main(){
    vec4 uncolored = texture2D(u_texture, v_texcoord);
    vec4 colored = vec4(0.0,0.0,0.0,0.0);
    if(uncolored.r == 0.0 && uncolored.g == 0.0 && uncolored.b == 0.0 && uncolored.a > 0.0){
        colored.rgb = u_quaternary_color.rgb;
        colored.a = uncolored.a*u_quaternary_color.a;
    }else if(uncolored.r > 0.0 && uncolored.a > 0.0){
        colored.rgb = u_primary_color.rgb;
        colored.a = uncolored.a*u_primary_color.a;
    }else if(uncolored.g > 0.0 && uncolored.a > 0.0){
        colored.rgb = u_secondary_color.rgb;
        colored.a = uncolored.a*u_secondary_color.a;
    }else if (uncolored.b > 0.0 && uncolored.a > 0.0){
        colored.rgb = u_tertiary_color.rgb;
        colored.a = uncolored.a*u_tertiary_color.a;
    }
    gl_FragColor = colored;
}