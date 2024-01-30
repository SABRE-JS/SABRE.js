varying vec2 v_texcoord;
varying vec2 v_maskcoord;

uniform sampler2D u_texture;
uniform sampler2D u_mask;

uniform int u_hasmask;

uniform vec4 u_primary_color;
uniform vec4 u_secondary_color;
uniform vec4 u_tertiary_color;
uniform vec4 u_quaternary_color;

#define NON_CONSTANT_LUMA 0
#define CONSTANT_LUMA 1
#define PERCEPTUAL_QUANTIZATION 2
#define HYBRID_LOG_GAMMA 3

#define SRGB 0
#define DISPLAY_P3 1

uniform int u_header_colorspace_type;
uniform vec3 u_header_colorspace_offset;
uniform vec3 u_header_colorspace_scale;
uniform vec3 u_header_colorspace_coefficients;
uniform vec4 u_header_colorspace_gamut_bounds;
uniform mat3 u_header_colorspace_matrix;

uniform int u_video_colorspace_type;
uniform vec3 u_video_colorspace_offset;
uniform vec3 u_video_colorspace_scale;
uniform vec3 u_video_colorspace_coefficients;
uniform vec4 u_video_colorspace_gamut_bounds;
uniform mat3 u_video_inverse_colorspace_matrix;

void main(){
    vec4 colored = vec4(0.0,0.0,0.0,0.0);
    if(u_hasmask == 0){
        vec4 uncolored = texture2D(u_texture, v_texcoord);
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
        } else {
            discard;
        }
    } else {
        vec4 uncolored = texture2D(u_texture, v_texcoord);
        vec4 mask = texture2D(u_mask, v_maskcoord);
        if(mask.rgba != uncolored.rgba){
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
            } else {
                discard;
            }
        }else{
            colored.rgba = uncolored.rgba;
        }
    }

    if(colored.a == 0.0)
        discard;

    if(colored.r <= 0.04045){
        colored.r /= 12.92;
    }else{
        colored.r = pow((colored.r+0.055)/1.055,2.4);
    }
    if(colored.g <= 0.04045){
        colored.g /= 12.92;
    }else{
        colored.g = pow((colored.g+0.055)/1.055,2.4);
    }
    if(colored.b <= 0.04045){
        colored.b /= 12.92;
    }else{
        colored.b = pow((colored.b+0.055)/1.055,2.4);
    }
    vec3 transformed_colors = vec3(0.0,0.0,0.0);
    if(u_header_colorspace_type == NON_CONSTANT_LUMA){
        transformed_colors = (u_header_colorspace_matrix * colored.rgb)+u_header_colorspace_offset;
    }else if(u_header_colorspace_type == CONSTANT_LUMA){
        transformed_colors.x = u_header_colorspace_coefficients.r*colored.r+u_header_colorspace_coefficients.g*colored.g+u_header_colorspace_coefficients.b*colored.b;
        if(colored.b <= transformed_colors.x){
            transformed_colors.y = (colored.b-transformed_colors.x)/(-2.0*u_header_colorspace_gamut_bounds.y);
        }else{
            transformed_colors.y = (colored.b-transformed_colors.x)/(2.0*u_header_colorspace_gamut_bounds.w);
        }
        if(colored.r <= transformed_colors.x){
            transformed_colors.z = (colored.r-transformed_colors.x)/(-2.0*u_header_colorspace_gamut_bounds.x);
        }else{
            transformed_colors.z = (colored.r-transformed_colors.x)/(2.0*u_header_colorspace_gamut_bounds.z);
        }
        transformed_colors *= u_header_colorspace_scale;
        transformed_colors += u_header_colorspace_offset;
    }

    if(u_video_colorspace_type == CONSTANT_LUMA){
        transformed_colors -= u_video_colorspace_offset;
        transformed_colors /= u_video_colorspace_scale;
        if(transformed_colors.y <= 0.0){
            colored.b = transformed_colors.x - (2.0*transformed_colors.y*u_video_colorspace_gamut_bounds.y);
        }else{
            colored.b = transformed_colors.x + (2.0*transformed_colors.y*u_video_colorspace_gamut_bounds.w);
        }
        if(transformed_colors.z <= 0.0){
            colored.r = transformed_colors.x - (2.0*transformed_colors.z*u_video_colorspace_gamut_bounds.x);
        }else{
            colored.r = transformed_colors.x + (2.0*transformed_colors.z*u_video_colorspace_gamut_bounds.z);
        }
        colored.g = transformed_colors.x-(u_video_colorspace_coefficients.r*colored.r+u_video_colorspace_coefficients.b*colored.b)/u_video_colorspace_coefficients.g;
    }

    colored.rgb = u_video_inverse_colorspace_matrix * (transformed_colors-u_video_colorspace_offset);

    if(colored.r <= 0.0031308){
        colored.r *= 12.92;
    }else{
        colored.r = 1.055*pow(colored.r,1.0/2.4)-0.055;
    }
    if(colored.g <= 0.0031308){
        colored.g *= 12.92;
    }else{
        colored.g = 1.055*pow(colored.g,1.0/2.4)-0.055;
    }
    if(colored.b <= 0.0031308){
        colored.b *= 12.92;
    }else{
        colored.b = 1.055*pow(colored.b,1.0/2.4)-0.055;
    }

    gl_FragColor = colored;
}