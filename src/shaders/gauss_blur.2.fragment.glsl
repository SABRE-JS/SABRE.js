varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_sigma;
uniform float u_resolution_y;

float normpdf(float n,float sigma)
{
	return 0.39894*exp(-0.5*n*n/(sigma*sigma))/sigma;
}

void main(){
    float pixel_y = 1.0/u_resolution_y;
    vec4 accumulator = texture2D(u_texture,v_texcoord)*normpdf(0.0,u_sigma);
    for(float i = 1.0; i < 512.0; i++){
        float gaussian_value = normpdf(i,u_sigma);
        if(gaussian_value <= 0.00135){
            break;
        }
        accumulator += texture2D(u_texture,clamp(v_texcoord+vec2(0,pixel_y*i),0.0,1.0)) * gaussian_value;
        accumulator += texture2D(u_texture,clamp(v_texcoord-vec2(0,pixel_y*i),0.0,1.0)) * gaussian_value;
    }
    
    gl_FragColor = accumulator.rgba;
}