/**
 * Contains common filter functions.
 */
function FilterUtils(){
	this.HSVtoRGB = function (h, s, v){
	    var r, g, b;
	    var i = Math.floor(h * 6);
	    var f = h * 6 - i;
	    var p = v * (1 - s);
	    var q = v * (1 - f * s);
	    var t = v * (1 - (1 - f) * s);
	    switch(i % 6){
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }
	    return [r * 255, g * 255, b * 255];
	}
	this.RGBtoHSV = function (r, g, b){
	    r = r/255, g = g/255, b = b/255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, v = max;
	    var d = max - min;
	    s = max == 0 ? 0 : d / max;
	    if(max == min){
	        h = 0;
	    }else{
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }
	    return [h, s, v];
	}
	this.getPixel = function (pixels,x,y,width,height){
	  	var pix = (y*width + x)*4;
	  	if (x < 0 || x >= width || y < 0 || y >= height) {
	  		return [pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4],
	  		pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 1],
	  		pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 2],
	  		pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 3]];
	  	}
	  	return [pixels[pix],pixels[pix+1],pixels[pix+2],pixels[pix+3]]
   }
   var haveNextGaussian = false;
   var nextGaussian;
   this.gaussianRandom = function(){
   		if(haveNextGaussian){
   			haveNextGaussian = false;
   			return nextGaussian;
   		} else {
   			var v1, v2, s;
   			do {
   				v1 = 2 * Math.random() - 1;
   				v2 = 2 * Math.random() - 1;
   				s = v1 * v1 + v2 * v2;
   			} while (s >= 1 || s == 0);
   			var mult = Math.sqrt(-2 * Math.log(s)/s);
   			nextGaussian = v2 * mult;
   			haveNextGaussian = true;
   			return v1 * mult;
   		}
   }
   this.clampPixel = function (x,a,b){
  		return (x < a) ? a : (x > b) ? b : x;
   }
   this.triangle = function(x){
   		var r = this.mod(x, 1);
   		return 2*(r < 0.5 ? r : 1-r);
   }
   this.mod = function(a,b){
   		var n = parseInt(a/b);
   		a -= n*b;
   		if(a < 0){
   			return a + b;
   		}
   		return a;
   }
  this.mixColors = function(t, rgb1, rgb2){
  	var r = this.linearInterpolate(t,rgb1[0],rgb2[0]);
  	var g = this.linearInterpolate(t,rgb1[1],rgb2[1]);
  	var b = this.linearInterpolate(t,rgb1[2],rgb2[2]);
  	var a = this.linearInterpolate(t,rgb1[3],rgb2[3]);
  	return [r,g,b,a];
  } 
  
  this.linearInterpolate = function(t,a,b){
  	return a + t * (b-a);
  }
  this.bilinearInterpolate = function (x,y,nw,ne,sw,se){
	  	var m0, m1;
		var r0 = nw[0]; var g0 = nw[1]; var b0 = nw[2]; var a0 = nw[3];
		var r1 = ne[0]; var g1 = ne[1]; var b1 = ne[2]; var a1 = ne[3];
		var r2 = sw[0]; var g2 = sw[1]; var b2 = sw[2]; var a2 = sw[3];
		var r3 = se[0]; var g3 = se[1]; var b3 = se[2]; var a3 = se[3];
		var cx = 1.0 - x; var cy = 1.0 - y;
		
		m0 = cx * a0 + x * a1;
		m1 = cx * a2 + x * a3;
		var a = cy * m0 + y * m1;
	
		m0 = cx * r0 + x * r1;
		m1 = cx * r2 + x * r3;
		var r = cy * m0 + y * m1;
	
		m0 = cx * g0 + x * g1;
		m1 = cx * g2 + x * g3;
		var g = cy * m0 + y * m1;
	
		m0 = cx * b0 + x * b1;
		m1 = cx * b2 + x * b3;
		var b =cy * m0 + y * m1;
		return [r,g,b,a];
  }
  this.tableFilter = function (inputData, table, width, height){
  	for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var pixel = (y*width + x)*4;
            for(var i = 0; i < 3; i++){
            	inputData[pixel+i] = table[inputData[pixel+i]];
        	}
        }   
    }
  }
  this.convolveFilter = function(inputData, matrix, width, height){
	var outputData = [];
	var rows, cols;
	rows = cols = Math.sqrt(matrix.length);
	var rows2 = parseInt(rows/2);
	var cols2 = parseInt(cols/2);
	var trace = true;
	for(var y = 0; y < height; y++){
 		for (var x = 0; x < width; x++){
 			var pixel = (y*width + x)*4;
 			var r = 0, g = 0, b = 0;
 			for(var row = -rows2; row <= rows2; row++){
 				var iy = y+row;
				var ioffset;
				if (0 <= iy && iy < height) {
					ioffset = iy*width;
				} else {
					ioffset = y*width;
				}
				var moffset = cols*(row+rows2)+cols2;
				for (var col = -cols2; col <= cols2; col++) {
					var f = matrix[moffset+col];

					if (f != 0) {
						var ix = x+col;
						if (!(0 <= ix && ix < width)) {
								ix = x;
						}
						var iPixel = (ioffset+ix)*4;
						r += f * inputData[iPixel];
						g += f * inputData[iPixel+1];
						b += f * inputData[iPixel+2];
					}
				}
 			}
 			outputData[pixel] = parseInt(r+0.5);
 			outputData[pixel+1] = parseInt(g+0.5);
 			outputData[pixel+2] = parseInt(b+0.5);
 			outputData[pixel+3] = inputData[pixel+3];
 		}
 	}
	for(var k = 0; k < outputData.length; k++){
  		inputData[k] = outputData[k];
  	}
  }
  this.transformFilter = function(inputData, transformInverse, width, height){
  	var out = [];
  	var outputData = [];
  	for(var j = 0; j < inputData.length; j++){
  		outputData[j] = inputData[j];
  	}
  	for(var y = 0; y < height; y++){
 		for (var x = 0; x < width; x++){
 			var pixel = (y*width + x)*4;
			transformInverse.apply(this,[x,y,out]);
		  	var srcX = Math.floor(out[0]);
		  	var srcY = Math.floor(out[1]);
		  	var xWeight = out[0]-srcX;
		  	var yWeight = out[1]-srcY;
		  	var nw,ne,sw,se;
		  	if(srcX >= 0 && srcX < width-1 && srcY >= 0 && srcY < height-1){
		  		var i = (width*srcY + srcX)*4;
		  		nw = [inputData[i],inputData[i+1],inputData[i+2],inputData[i+3]];
		  		ne = [inputData[i+4],inputData[i+5],inputData[i+6],inputData[i+7]];
		  		sw = [inputData[i+width*4],inputData[i+width*4+1],inputData[i+width*4+2],inputData[i+width*4+3]];
		  		se = [inputData[i+(width + 1)*4],inputData[i+(width + 1)*4+1],inputData[i+(width + 1)*4+2],inputData[i+(width + 1)*4+3]];
		  		
		  	} else {
	  			nw = this.getPixel( inputData, srcX, srcY, width, height );
				ne = this.getPixel( inputData, srcX+1, srcY, width, height );
				sw = this.getPixel( inputData, srcX, srcY+1, width, height );
				se = this.getPixel( inputData, srcX+1, srcY+1, width, height );
		  	}
		  	var rgba = this.bilinearInterpolate(xWeight,yWeight,nw,ne,sw,se);
			outputData[pixel] = rgba[0];
			outputData[pixel + 1] = rgba[1];
			outputData[pixel + 2] = rgba[2];
			outputData[pixel + 3] = rgba[3];
 		}
 	}
 	for(var k = 0; k < outputData.length; k++){
  		inputData[k] = outputData[k];
  	}
  }
}
