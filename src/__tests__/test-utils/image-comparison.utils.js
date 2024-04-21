const ssim = require('ssim.js');

function multiplyMatrixByVector(matrix, vector) {
    let result = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result[i] += matrix[i * 3 + j] * vector[j];
        }
    }
    return result;
}

function sRGBtoRGB(sR,sG,sB){
    const color = [sR,sG,sB];
    for(let i = 0; i < 3; i++){
        if(color[i] <= 0.04045){
            color[i] /= 12.92;
        }else{
            color[i] = Math.pow((color[i]+0.055)/1.055,2.4);
        }
    }
    return color;
}

const DP3toLinearDP3 = sRGBtoRGB;

function sRGBtoXYZ(sR,sG,sB){
    const RGBtoXYZMatrix = [0.4360413,0.3851129,0.1430458,0.2224845,0.7169051,0.0606104,0.0139202,0.0970672,0.7139126];
    const RGB = sRGBtoRGB(sR,sG,sB);
    return multiplyMatrixByVector(RGBtoXYZMatrix,RGB);
}

function DP3toXYZ(wR,wG,wB){
    const LinearDP3toXYZMatrix = [0.5151187,0.2919778,0.1571035,0.2411892,0.6922441,0.0665668,-0.0010505,0.0418791,0.7840713];
    const LinearDP3 = DP3toLinearDP3(wR,wG,wB)
    return multiplyMatrixByVector(LinearDP3toXYZMatrix,LinearDP3)
}

function imageDataToXYZ(d){
    const data = d.data;
    const colorSpace = d.colorSpace || "srgb";
    const length = d.width*d.height*3;
    const output = new Array(length);
    let j = 0;
    for(let i = 0; i < d.width*d.height*4; i+=4){
        let XYZ;
        switch(colorSpace){
            default:
                console.warn("Unrecognized color space '"+colorSpace+"' assuming srgb, colors may be wrong.");
            case "srgb":
                XYZ = sRGBtoXYZ(data[i]/255,data[i+1]/255,data[i+2]/255);
                break;
            case "display-p3":
                XYZ = DP3toXYZ(data[i]/255,data[i+1]/255,data[i+2]/255);
                break;
        }
        output[j] = XYZ[0];
        output[j+1] = XYZ[1];
        output[j+2] = XYZ[2];
        j+=3;
    }
    return output;
}

function diffArray(a,b){
    const maxLength = Math.min(a.length, b.length);
    const output = new Array(maxLength);
    for(let i = 0; i < maxLength; i++){
        output[i] = (a[i]??0)-(b[i]??0);
    }
    return output;
}

function selectArrayFromArray(a,n,x){
    const offset = typeof(x) === "number" ? x : 0;
    const length = Math.trunc(a.length/n);
    const output = new Array(length);
    for(let i = 0; i < length; i++){
        output[i] = a[(i*n)+offset];
    }
    return output;
}

function psnr(image1,image2) {
    const image1xyz = imageDataToXYZ(image1);
    const image2xyz = imageDataToXYZ(image2);

    let mse;
    {
        const xyzDiffSquared = diffArray(image1xyz,image2xyz).map((value) => Math.pow(value,2));
        const mseComponentLength = Math.trunc(xyzDiffSquared.length/3);
        // Calculate the mean squared error for each channel
        const mseX = selectArrayFromArray(xyzDiffSquared,3).reduce((sum,value) => sum+value,0)/mseComponentLength;
        const mseY = selectArrayFromArray(xyzDiffSquared,3,1).reduce((sum,value) => sum+value,0)/mseComponentLength;
        const mseZ = selectArrayFromArray(xyzDiffSquared,3,2).reduce((sum,value) => sum+value,0)/mseComponentLength;
        // Calculate the mean squared error across all channels
        mse = (mseX + mseY + mseZ) / 3;
    }

    // Maximum possible pixel value (we are using floating point values)
    const maxPixelValue = 1.0;

    // Return PSNR value.
    return 20 * Math.log10(maxPixelValue / Math.sqrt(mse));
}

function xyzssim (image1, image2) {
    const image1xyz = imageDataToXYZ(image1);
    const image2xyz = imageDataToXYZ(image2);
    const image1_x_channel = selectArrayFromArray(image1xyz,3);
    const image1_y_channel = selectArrayFromArray(image1xyz,3,1);
    const image1_z_channel = selectArrayFromArray(image1xyz,3,2);
    const image2_x_channel = selectArrayFromArray(image2xyz,3);
    const image2_y_channel = selectArrayFromArray(image2xyz,3,1);
    const image2_z_channel = selectArrayFromArray(image2xyz,3,2);
    const ssim_x = ssim.ssim({width:image1.width,height:image1.height,data:image1_x_channel}, {width:image2.width,height:image2.height,data:image2_x_channel}).mssim;
    const ssim_y = ssim.ssim({width:image1.width,height:image1.height,data:image1_y_channel}, {width:image2.width,height:image2.height,data:image2_y_channel}).mssim;
    const ssim_z = ssim.ssim({width:image1.width,height:image1.height,data:image1_z_channel}, {width:image2.width,height:image2.height,data:image2_z_channel}).mssim;
    return (ssim_x + ssim_y + ssim_z) / 3;
}

function compare(a,b){
    if(a && b){
        return {psnr: psnr(a,b), ssim: xyzssim(a,b)};
    }
    throw new Error("No images to compare.");
}

module.exports = compare;