varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_sigma;
uniform float u_resolution_x;


float normpdf(float n,float sigma)
{
	return 0.39894*exp(-0.5*n*n/(sigma*sigma))/sigma;
}

void main(){
    float pixel_x = 1.0/u_resolution_x;
    
    int mSize = int(((u_sigma/2.0)*(u_sigma/2.0)));
    float kSize = float((mSize-1)/2);

    vec4 accumulator = texture2D(u_texture,v_texcoord)*normpdf(0.0,u_sigma);
    for(float i = 1.0; i < 512.0; i++){
        if(i > kSize){
            break;
        }
        accumulator += texture2D(u_texture,clamp(v_texcoord+vec2(pixel_x*i,0),0.0,1.0)) * normpdf(i,u_sigma);
        accumulator += texture2D(u_texture,clamp(v_texcoord-vec2(pixel_x*i,0),0.0,1.0)) * normpdf(i,u_sigma);
    }
    gl_FragColor = accumulator.rgba;
}