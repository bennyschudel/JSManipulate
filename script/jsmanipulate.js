/* 
=========================================================================
   JSManipulate v1.0 (2011-08-01)

Javascript image filter & effect library

Developed by Joel Besada (http://www.joelb.me)
Demo page: http://www.joelb.me/jsmanipulate

MIT LICENSED (http://www.opensource.org/licenses/mit-license.php)
Copyright (c) 2011, Joel Besada
=========================================================================
*/


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
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			case 5: r = v; g = p; b = q; break;
			default: break;
		}
		return [r * 255, g * 255, b * 255];
	};
	this.RGBtoHSV = function (r, g, b){
		r = r/255; g = g/255; b = b/255;
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var h, s, v = max;
		var d = max - min;
		s = max === 0 ? 0 : d / max;
		if(max === min){
			h = 0;
		}else{
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
				default: break;
			}
			h /= 6;
		}
		return [h, s, v];
	};
	this.getPixel = function (pixels,x,y,width,height){
		var pix = (y*width + x)*4;
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return [pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4],
			pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 1],
			pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 2],
			pixels[((this.clampPixel(y, 0, height-1) * width) + this.clampPixel(x, 0, width-1))*4 + 3]];
		}
		return [pixels[pix],pixels[pix+1],pixels[pix+2],pixels[pix+3]];
	};
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
			} while (s >= 1 || s === 0);
			var mult = Math.sqrt(-2 * Math.log(s)/s);
			nextGaussian = v2 * mult;
			haveNextGaussian = true;
			return v1 * mult;
		}
	};
	this.clampPixel = function (x,a,b){
		return (x < a) ? a : (x > b) ? b : x;
	};
	this.triangle = function(x){
		var r = this.mod(x, 1);
		return 2*(r < 0.5 ? r : 1-r);
	};
	this.mod = function(a,b){
		var n = parseInt(a/b,10);
		a -= n*b;
		if(a < 0){
			return a + b;
		}
		return a;
	};
	this.mixColors = function(t, rgb1, rgb2){
		var r = this.linearInterpolate(t,rgb1[0],rgb2[0]);
		var g = this.linearInterpolate(t,rgb1[1],rgb2[1]);
		var b = this.linearInterpolate(t,rgb1[2],rgb2[2]);
		var a = this.linearInterpolate(t,rgb1[3],rgb2[3]);
		return [r,g,b,a];
	};

	this.linearInterpolate = function(t,a,b){
		return a + t * (b-a);
	};
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
	};
	this.tableFilter = function (inputData, table, width, height){
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = table[inputData[pixel+i]];
				}
			}
		}
	};
	this.convolveFilter = function(inputData, matrix, width, height){
		var outputData = [];
		var rows, cols;
		rows = cols = Math.sqrt(matrix.length);
		var rows2 = parseInt(rows/2,10);
		var cols2 = parseInt(cols/2,10);
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
						if (f !== 0) {
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
				outputData[pixel] = parseInt(r+0.5,10);
				outputData[pixel+1] = parseInt(g+0.5,10);
				outputData[pixel+2] = parseInt(b+0.5,10);
				outputData[pixel+3] = inputData[pixel+3];
			}
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
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
	};
}
/**
 * Blurs the image with Gaussian blur.
 */
function BlurFilter(){
	this.name = "Blur";
	this.isDirAnimatable = false;
	this.defaultValues = {
		amount : 3
	};
	this.valueRanges = {
		amount : {min:0, max:10}
	};
	this.filter = function(input,values){
		var width = input.width;
		var width4 = width << 2;
		var height = input.height;
		var inputData = input.data;
		var q;
		var amount = values.amount;
		if (amount < 0.0) {
			amount = 0.0;
		}
		if (amount >= 2.5) {
			q = 0.98711 * amount - 0.96330; 
		} else if (amount >= 0.5) {
			q = 3.97156 - 4.14554 * Math.sqrt(1.0 - 0.26891 * amount);
		} else {
			q = 2 * amount * (3.97156 - 4.14554 * Math.sqrt(1.0 - 0.26891 * 0.5));
		}
		var qq = q * q;
		var qqq = qq * q;
		var b0 = 1.57825 + (2.44413 * q) + (1.4281 * qq ) + (0.422205 * qqq);
		var b1 = ((2.44413 * q) + (2.85619 * qq) + (1.26661 * qqq)) / b0;
		var b2 = (-((1.4281 * qq) + (1.26661 * qqq))) / b0;
		var b3 = (0.422205 * qqq) / b0; 
		var bigB = 1.0 - (b1 + b2 + b3); 
		var c = 0;
		var index;
		var indexLast;
		var pixel;
		var ppixel;
		var pppixel;
		var ppppixel;
		for (c = 0; c < 3; c++) {
			for (var y = 0; y < height; y++) {
				index = y * width4 + c;
				indexLast = y * width4 + ((width - 1) << 2) + c;
				pixel = inputData[index];
				ppixel = pixel;
				pppixel = ppixel;
				ppppixel = pppixel;
				for (; index <= indexLast; index += 4) {
					pixel = bigB * inputData[index] + b1 * ppixel + b2 * pppixel + b3 * ppppixel;
					inputData[index] = pixel; 
					ppppixel = pppixel;
					pppixel = ppixel;
					ppixel = pixel;
				}
				index = y * width4 + ((width - 1) << 2) + c;
				indexLast = y * width4 + c;
				pixel = inputData[index];
				ppixel = pixel;
				pppixel = ppixel;
				ppppixel = pppixel;
				for (; index >= indexLast; index -= 4) {
					pixel = bigB * inputData[index] + b1 * ppixel + b2 * pppixel + b3 * ppppixel;
					inputData[index] = pixel;
					ppppixel = pppixel;
					pppixel = ppixel;
					ppixel = pixel;
				}
			}
		}
		for (c = 0; c < 3; c++) {
			for (var x = 0; x < width; x++) {
				index = (x << 2) + c;
				indexLast = (height - 1) * width4 + (x << 2) + c;
				pixel = inputData[index];
				ppixel = pixel;
				pppixel = ppixel;
				ppppixel = pppixel;
				for (; index <= indexLast; index += width4) {
					pixel = bigB * inputData[index] + b1 * ppixel + b2 * pppixel + b3 * ppppixel;
					inputData[index] = pixel;
					ppppixel = pppixel;
					pppixel = ppixel;
					ppixel = pixel;
				} 
				index = (height - 1) * width4 + (x << 2) + c;
				indexLast = (x << 2) + c;
				pixel = inputData[index];
				ppixel = pixel;
				pppixel = ppixel;
				ppppixel = pppixel;
				for (; index >= indexLast; index -= width4) {
					pixel = bigB * inputData[index] + b1 * ppixel + b2 * pppixel + b3 * ppppixel;
					inputData[index] = pixel;
					ppppixel = pppixel;
					pppixel = ppixel;
					ppixel = pixel;
				}
			}
		} 
	};
}
/**
 * Adjusts the brightness of the image by going over to HSV values.
 * Negative values decrease brightness while positive values increase brightness.
 */
function BrightnessFilter(){
	this.name = "Brightness";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 0.0
	};
	this.valueRanges = {
		amount : {min:-1.0, max:1.0}
	};
	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var hsv = filterUtils.RGBtoHSV(inputData[pixel],inputData[pixel+1],inputData[pixel+2]);
				hsv[2] += amount;
				if(hsv[2] < 0){
					hsv[2] = 0;
				} else if (hsv[2] > 1){ 
					hsv[2] = 1;
				}
				var rgb = filterUtils.HSVtoRGB(hsv[0],hsv[1],hsv[2]);
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = rgb[i];
				}
			}
		}
	};
}
/**
 * Embosses the edges of the image.
 * This filter takes no parameters but can be applied several times for
 * further effect.
 */
function BumpFilter(){
	this.name = "Bump";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var matrix = [-1,-1, 0,
					  -1, 1, 1,
					   0, 1, 1];
		filterUtils.convolveFilter(inputData,matrix,width,height);
	};
}
/**
 * Smears out the image with circular shapes to create a painting style effect.
 * The mix values sets the intensity of the effect.
 * NOTE: This filter can be very slow, especially at higher densities/sizes. Use with caution.
 */
function CircleSmearFilter(){
	this.name = "Circle Smear";
	this.isDirAnimatable = false;
	this.defaultValues = {
		size : 4,
		density : 0.5,
		mix : 0.5
	};
	this.valueRanges = {
		size : {min:1, max:10},
		density : {min:0.0, max:1.0},
		mix : {min:0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		 for(var j = 0; j < inputData.length; j++){
			outputData[j] = inputData[j];
		}
		if(values === undefined){ values = this.defaultValues; }
		var size = (values.size === undefined) ? this.defaultValues.size : values.size;
		if(size < 1){ size = 1;}
		size = parseInt(size,10);
		var density = (values.density === undefined) ? this.defaultValues.density : values.density;
		var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
		var radius = size+1;
		var radius2 = radius*radius;
		var numShapes = parseInt(2*density/30*width*height / 2,10);
		for(var i = 0; i < numShapes; i++){
			var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
			var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
			var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
			for(var x = sx - radius; x < sx + radius + 1; x++){
				for(var y = sy - radius; y < sy + radius + 1; y++){
					var f = (x - sx) * (x - sx) + (y - sy) * (y - sy);
					if (x >= 0 && x < width && y >= 0 && y < height && f <= radius2) {
						var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
						for(var k = 0; k < 3; k++){
							outputData[(y*width+x)*4+k] = mixedRGB[k];
						}
					}
				}
			}
		}
		for(var l = 0; l < outputData.length; l++){
			inputData[l] = outputData[l];
		}
	};
}
/**
 * Adjusts the contrast of the image.
 */
function ContrastFilter(){
	this.name = "Contrast";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:2.0}
	};
	if(!FilterUtils){
			if(console){
				console.error("Unable to find filterutils.js, please include this file! (Required by " + this.name + " filter)");
			}
			return;
		}
	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		if(amount < 0){
			amount = 0.0;
		}
		var table = [];

		for(var i = 0; i < 256; i++){
			table[i] = parseInt(255 * (((i/255)-0.5)*amount+0.5),10);
		}
		filterUtils.tableFilter(inputData,table,width,height);
	};
}
/**
 * Smears out the image with cross shapes to create a painting style effect.
 * The mix values sets the intensity of the effect.
 */
function CrossSmearFilter(){
	this.name = "Cross Smear";
	this.isDirAnimatable = false;
	this.defaultValues = {
		distance : 8,
		density : 0.5,
		mix : 0.5
	};
	this.valueRanges = {
		distance : {min:0, max:30},
		density : {min:0.0, max:1.0},
		mix : {min:0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		 for(var j = 0; j < inputData.length; j++){
			outputData[j] = inputData[j];
		}
		if(values === undefined){ values = this.defaultValues; }
		var distance = (values.distance === undefined) ? this.defaultValues.distance : values.distance;
		if(distance < 0){ distance = 0;}
		distance = parseInt(distance,10);
		var density = (values.density === undefined) ? this.defaultValues.density : values.density;
		var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
		var numShapes = parseInt(2*density*width * height / (distance + 1),10);
		for(var i = 0; i < numShapes; i++){
			var x = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
			var y = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
			var length = (Math.random()*Math.pow(2,32)) % distance + 1;
			var rgb2 = [inputData[(y*width+x)*4],inputData[(y*width+x)*4+1],inputData[(y*width+x)*4+2],inputData[(y*width+x)*4+3]];
			var rgb1;
			var mixedRGB;
			var k;
			for (var x1 = x-length; x1 < x+length+1; x1++) {
				if(x1 >= 0 && x1 < width){
					rgb1 = [outputData[(y*width+x1)*4],outputData[(y*width+x1)*4+1],outputData[(y*width+x1)*4+2],outputData[(y*width+x1)*4+3]];
					mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
					for(k = 0; k < 3; k++){
						outputData[(y*width+x1)*4+k] = mixedRGB[k];
					}
				}

			} 
			for (var y1 = y-length; y1 < y+length+1; y1++) {
				if(y1 >= 0 && y1 < height){
					rgb1 = [outputData[(y1*width+x)*4],outputData[(y1*width+x)*4+1],outputData[(y1*width+x)*4+2],outputData[(y1*width+x)*4+3]];
					mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
					for(k = 0; k < 3; k++){
						outputData[(y1*width+x)*4+k] = mixedRGB[k];
					}
				}

			} 
		}
		for(var l = 0; l < outputData.length; l++){
			inputData[l] = outputData[l];
		}
	};
}
/**
 * Diffuses the image creating a frosted glass effect.
 */
function DiffusionFilter(){
	this.name = "Diffusion";
	this.isDirAnimatable = false;
	this.defaultValues = {
		scale: 4
	}; 
	this.valueRanges = {
		scale: {min: 1, max: 100}
	};

	var filterUtils = new FilterUtils();
	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var scale = (values.scale === undefined) ? this.defaultValues.scale : values.scale; 
		var out = [];
		var outputData = [];
		var sinTable = [];
		var cosTable = [];
		for(var i = 0; i < 256; i++){
			var angle = Math.PI*2*i/256;
			sinTable[i] = scale*Math.sin(angle);
			cosTable[i] = scale*Math.cos(angle);
		}
		transInverse = function (x,y,out){
			var angle = parseInt(Math.random() * 255,10);
			var distance = Math.random();
			out[0] = x + distance * sinTable[angle];
			out[1] = y + distance * cosTable[angle];
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
  };
}
/**
 * Dithers the image to the specified number of colors. Setting color to false
 * grayscales the image.
 */
function DitherFilter(){
	this.name = "Dither";
	this.isDirAnimatable = false;
	this.defaultValues = {
		levels : 3,
		color : true
	};
	this.valueRanges = {
		levels : {min:2, max:30},
		color : {min:false, max:true}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		var i, j;
		for (j=0; j < inputData.length; j++) {
			outputData[j] = 0;
		}
		if(values === undefined){ values = this.defaultValues; }
		var levels = (values.levels === undefined) ? this.defaultValues.levels : values.levels;
		var color = (values.color === undefined) ? this.defaultValues.color : values.color;
		if(levels <= 1){
			levels = 1;
		}
		var matrix = [0,0,0,
					  0,0,7,
					  3,5,1];
		var sum = 7+3+5+1;
		var index = 0;
		var map = [];
		
		for (i=0; i < levels; i++) {
			map[i] = parseInt(255* i / (levels-1),10);
		}
		var div = [];
		for (i=0; i < 256; i++) {
			div[i] = parseInt(levels*i / 256,10);
		}
	  	for (var y = 0; y < height; y++) {
			var reverse = ((y & 1) == 1);
			var direction;
			if(reverse){
				index = (y*width+width-1)*4;
				direction = -1;
			} else {
				index = y*width*4;
				direction = 1;
			}
			for (var x = 0; x < width; x++) {
				var r1 = inputData[index]; var g1 = inputData[index+1]; var b1 = inputData[index+2];
				if(!color){
					r1 = g1 = b1 = parseInt((r1+g1+b1) / 3,10);
				}
				var r2 = map[div[r1]];var g2 = map[div[g1]];var b2 = map[div[b1]];

				outputData[index] = r2; outputData[index + 1] = g2; outputData[index+2] = b2; outputData[index+3] = inputData[index+3];

				var er = r1-r2; var eg = g1-g2; var eb = b1-b2;

				for (i = -1; i <= 1; i++) {
					var iy = i+y;
					if (0 <= iy && iy < height) {
						for (j = -1; j <= 1; j++) {
							var jx = j+x;
							if (0 <= jx && jx < width) {
								var w;
								if (reverse){
									w = matrix[(i+1)*3-j+1];
								} else{
									w = matrix[(i+1)*3+j+1];
								}
								if (w !== 0) {
									var k = (reverse) ? index - j*4 : index + j*4;
									r1 = inputData[k]; g1 = inputData[k+1]; b1 = inputData[k+2];
									var factor = w/sum;
									r1 += er * factor; g1 += eg * factor; b1 += eb * factor;
									inputData[k] = r1; inputData[k+1] = g1 ;inputData[k+2] = b1;
								}
							}
						}
					}
				}
				index += direction*4;
			}
		}
		for(j = 0; j < outputData.length; j++){
			inputData[j] = outputData[j];
		}
	};
}
/** 
 * Highlights the edges of the image.
 */
function EdgeFilter(){
	this.name = "Edge Detection";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	var matrixH = [-1,-2,-1,
					0, 0, 0,
					1, 2, 1];
	var matrixV = [-1, 0, 1,
				   -2, 0, 2,
				   -1, 0, 1];
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var rh = 0; gh = 0; bh = 0;
				var rv = 0; gv = 0; bv = 0;
				for(var row = -1; row <= 1; row++){
					var iy = y+row;
					var ioffset;
					if(iy >= 0 && iy < height){
						ioffset = iy*width*4;
					} else {
						ioffset = y*width*4;
					}
					var moffset = 3*(row+1)+1;
					for(var col = -1; col <= 1; col++){
						var ix = x+col;
						if(!(ix >= 0 && ix < width)){
							ix = x;
						}
						ix *= 4;
						var r = inputData[ioffset+ix];
						var g = inputData[ioffset+ix+1];
						var b = inputData[ioffset+ix+2];
						var h = matrixH[moffset+col];
						var v = matrixV[moffset+col];
						rh += parseInt(h*r,10);
						bh += parseInt(h*g,10);
						gh += parseInt(h*b,10);
						rv += parseInt(v*r,10);
						gv += parseInt(v*g,10);
						bv += parseInt(v*b,10);
					}
				}
				r = parseInt(Math.sqrt(rh*rh + rv*rv) / 1.8,10);
				g = parseInt(Math.sqrt(gh*gh + gv*gv) / 1.8,10);
				b = parseInt(Math.sqrt(bh*bh + bv*bv) / 1.8,10);

				outputData[pixel] = r;
				outputData[pixel+1] = g;
				outputData[pixel+2] = b;
				outputData[pixel+3] = inputData[pixel+3];
			}   
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Embosses the image with a simulated light source. 
 * Angle and elevation sets the position of the light.
 */
function EmbossFilter(){
	this.name = "Emboss";
	this.isDirAnimatable = false;
	this.defaultValues = {
		height : 1,
		angle : 135,
		elevation : 30
	};
	this.valueRanges = {
		height : {min:1, max:10},
		angle : {min:0, max:360},
		elevation : {min:0, max:180}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var bumpHeight = (values.height === undefined) ? this.defaultValues.height : values.height;
		var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle;
		var elevation = (values.elevation === undefined) ? this.defaultValues.elevation : values.elevation; 
		angle = angle / 180 * Math.PI;
		elevation = elevation / 180 * Math.PI;
		var width45 = 3 * bumpHeight;
		var pixelScale = 255.9;

		var bumpPixels = [];
		var bumpMapWidth = width;
		var bumpMapHeight = height;
		for(var i = 0; i < inputData.length; i+=4){
			bumpPixels[i/4] = (inputData[i] + inputData[i+1] + inputData[i+2])/3;
		}
		var Nx, Ny, Nz, Lx, Ly, Lz, Nz2, NzLz, NdotL;
		var shade, background;

		Lx = parseInt(Math.cos(angle) * Math.cos(elevation) * pixelScale,10);
		Ly = parseInt(Math.sin(angle) * Math.cos(elevation) * pixelScale,10);
		Lz = parseInt(Math.sin(elevation) * pixelScale,10);

		Nz = parseInt(6 * 255 / width45,10);
		Nz2 = Nz * Nz;
		NzLz = Nz * Lz;
		background = Lz;

		var bumpIndex = 0;
		
		for (var y = 0; y < height; y++, bumpIndex += bumpMapWidth) {
			var s1 = bumpIndex;
			var s2 = s1 + bumpMapWidth;
			var s3 = s2 + bumpMapWidth;
			for (var x = 0; x < width; x++, s1++, s2++, s3++) {
				var pixel = (y*width + x)*4;
				if (y !== 0 && y < height-2 && x !== 0 && x < width-2) {
					Nx = bumpPixels[s1-1] + bumpPixels[s2-1] + bumpPixels[s3-1] - bumpPixels[s1+1] - bumpPixels[s2+1] - bumpPixels[s3+1];
					Ny = bumpPixels[s3-1] + bumpPixels[s3] + bumpPixels[s3+1] - bumpPixels[s1-1] - bumpPixels[s1] - bumpPixels[s1+1];
					if (Nx === 0 && Ny === 0){
						shade = background;
					} else if ((NdotL = Nx*Lx + Ny*Ly + NzLz) < 0){
						shade = 0;
					} else {
						shade = parseInt(NdotL / Math.sqrt(Nx*Nx + Ny*Ny + Nz2),10);
					}
				} else {
					shade = background;
				}
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = shade;
			}   
		}
	};
}
/**
 * Adjust simulated exposure values on the image.
 */
function ExposureFilter(){
	this.name = "Exposure";
	this.isDirAnimatable = true;
	this.defaultValues = {
		exposure : 1.0
	};
	this.valueRanges = {
		exposure : {min:0, max:5}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var exposure = (values.exposure === undefined) ? this.defaultValues.exposure : values.exposure;
		var table = [];
		for(var i = 0; i < 256; i++){
			table[i] = parseInt(255 *(1-Math.exp(-(i/255) * exposure)),10);
		}
		filterUtils.tableFilter(inputData, table, width, height);
	};
}
/**
 * Adjusts the gain and bias of the image. Gain alters the contrast while bias biases
 * colors towards lighter or darker.
 */
function GainFilter(){
	this.name = "Gain/Bias";
	this.isDirAnimatable = true;
	this.defaultValues = {
		gain: 0.5,
		bias: 0.5
	};
	this.valueRanges = {
		gain: {min:0.0, max:1.0},
		bias: {min:0.0, max:1.0}
	};
	var table = [];

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var gain = (values.gain === undefined) ? this.defaultValues.gain : values.gain;
		var bias = (values.bias === undefined) ? this.defaultValues.bias : values.bias;
		
		var table = [];
		
		for(var i = 0; i < 256; i++){
			var val = i/255;
			var k = (1/gain-2) * (1-2*val);
			val = (val < 0.5) ? val/(k+1) : (k-val)/(k-1);
			val /= (1/bias-2)*(1-val)+1; 
			table[i] = parseInt(255 * val,10);
		}
		filterUtils.tableFilter(inputData,table,width,height);
	};
}
/**
 * Adjusts the gamma values of the image. Values over 1 increase the gamma while values over 0 decrease gamma.
 */
function GammaFilter(){
	this.name = "Gamma";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:2.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		if(amount < 0){
			amount = 0.0;
		}
		if(!FilterUtils){
			if(console){
				console.error("Unable to find filterutils.js, please include this file! (Required by " + this.name + " filter)");
			}
			return;
		}
		var filterUtils = new FilterUtils();
		var table = [];
		for(var i = 0; i < 256; i++){
			table[i] = 255 * Math.pow(i/255, 1/amount) + 0.5;
		}
		filterUtils.tableFilter(inputData,table,width,height);
	};
}
/**
 * Sets the image to grayscale.
 */
function GrayscaleFilter(){
	this.name = "Grayscale";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var luma = inputData[pixel]*0.3 + inputData[pixel+1]*0.59 + inputData[pixel+2]*0.11;
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = luma;
			}   
		}
	};
}
/**
 * Adjusts the hue of the image by going over to HSV values.
 */
function HueFilter(){
	this.name = "Hue";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 0.0
	};
	this.valueRanges = {
		amount : {min:-1.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var hsv = filterUtils.RGBtoHSV(inputData[pixel],inputData[pixel+1],inputData[pixel+2]);
				hsv[0] += amount;
				while(hsv[0] < 0){
					hsv[0] += 360;
				}
				var rgb = filterUtils.HSVtoRGB(hsv[0],hsv[1],hsv[2]);
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = rgb[i];
				}
			}   
		}
	};
}
/**
 * Inverts the colors of the image.
 */
function InvertFilter(){
	this.name = "Invert";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = 255 - inputData[pixel+i];
				}
			}   
		}
	};
}
/**
 * Creates a kaleidoscope effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function KaleidoscopeFilter(){
	this.name = "Kaleidoscope";
	this.isDirAnimatable = false;
	this.defaultValues = {
		angle : 0,
		rotation : 0,
		sides : 3,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		angle : {min: 0, max: 360},
		rotation : {min: 0, max: 360},
		sides : {min: 1, max: 30},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle; 
		var rotation = (values.rotation === undefined) ? this.defaultValues.rotation : values.rotation; 
		var sides = (values.sides === undefined) ? this.defaultValues.sides : values.sides; 
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
		var iCenterX = width * centerX; var iCenterY = height * centerY;
		angle = angle/180 * Math.PI;
		rotation = rotation/180 * Math.PI;
		var transInverse = function(x,y,out){
			var dx = x - iCenterX;
			var dy = y - iCenterY;
			var r = Math.sqrt(dx*dx + dy*dy);
			var theta = Math.atan2(dy,dx) - angle - rotation;
			theta = filterUtils.triangle(theta/Math.PI*sides*0.5);
			theta += angle;
			out[0] = iCenterX + r*Math.cos(theta);
			out[1] = iCenterY + r*Math.sin(theta);
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Applies a fisheye lens distortion effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function LensDistortionFilter(){
	this.name = "Lens Distortion";
	this.isDirAnimatable = false;
	this.defaultValues = {
		refraction : 1.5,
		radius : 50,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		refraction : {min: 1, max: 10},
		radius : {min: 1, max: 200},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var refraction = (values.refraction === undefined) ? this.defaultValues.refraction : values.refraction; 
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
		var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
		var radius2 = radius*radius;
		var iCenterX = width * centerX; var iCenterY = height * centerY;
		var transInverse = function(x,y,out){
			var dx = x-iCenterX;
			var dy = y-iCenterY;
			var x2 = dx*dx;
			var y2 = dy*dy;
			if (y2 >= (radius2 - (radius2*x2)/radius2)) {
				out[0] = x;
				out[1] = y;
			} else {
				var rRefraction = 1.0 / refraction;

				var z = Math.sqrt((1.0 - x2/radius2 - y2/radius2) * radius2);
				var z2 = z*z;

				var xAngle = Math.acos(dx / Math.sqrt(x2+z2));
				var angle1 = Math.PI/2 - xAngle;
				var angle2 = Math.asin(Math.sin(angle1)*rRefraction);
				angle2 = Math.PI/2 - xAngle - angle2;
				out[0] = x - Math.tan(angle2)*z;

				var yAngle = Math.acos(dy / Math.sqrt(y2+z2));
				angle1 = Math.PI/2 - yAngle;
				angle2 = Math.asin(Math.sin(angle1)*rRefraction);
				angle2 = Math.PI/2 - yAngle - angle2;
				out[1] = y - Math.tan(angle2)*z;
			}
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Smears out the image with line shapes to create a painting style effect. Mix specifies
 * the intensity of the effect.
 */
function LineSmearFilter(){
	this.name = "Line Smear";
	this.isDirAnimatable = false;
	this.defaultValues = {
		distance : 8,
		density : 0.5,
		angle : 0,
		mix : 0.5
	};
	this.valueRanges = {
		distance : {min:1, max:30},
		density : {min:0.0, max:1.0},
		angle : {min:0, max:360},
		mix : {min:0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		var k;
		for(k = 0; k < inputData.length; k++){
			outputData[k] = inputData[k];
		}
		if(values === undefined){ values = this.defaultValues; }
		var distance = (values.distance === undefined) ? this.defaultValues.distance : values.distance;
		if(distance < 1){ distance = 1;}
		distance = parseInt(distance,10);
		var density = (values.density === undefined) ? this.defaultValues.density : values.density;
		var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle;
		var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
		angle = angle/180*Math.PI;
		var sinAngle = Math.sin(angle);
		var cosAngle = Math.cos(angle);
		var numShapes = parseInt(2*density*width*height / 2,10);
		for(var i = 0; i < numShapes; i++){
			var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
			var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
			var length = (Math.random()*Math.pow(2,32) & 0x7fffffff) % distance + 1;
			var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
			var dx = parseInt(length*cosAngle,10);
			var dy = parseInt(length*sinAngle,10);

			var x0 = sx-dx;
			var y0 = sy-dy;
			var x1 = sx+dx;
			var y1 = sy+dy;
			var x, y, d, incrE, incrNE, ddx, ddy;
			
			if (x1 < x0){ 
				ddx = -1;
			} else {
				ddx = 1;
			}
			if (y1 < y0){
				ddy = -1;
			} else {
				ddy = 1;
			}
			dx = x1-x0;
			dy = y1-y0;
			dx = Math.abs(dx);
			dy = Math.abs(dy);
			x = x0;
			y = y0;
			var rgb1;
			var mixedRGB;
			if (x < width && x >= 0 && y < height && y >= 0) {
				rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
				mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
				for(k = 0; k < 3; k++){
					outputData[(y*width+x)*4+k] = mixedRGB[k];
				}
			}
			if (Math.abs(dx) > Math.abs(dy)) {
				d = 2*dy-dx;
				incrE = 2*dy;
				incrNE = 2*(dy-dx);

				while (x != x1) {
					if (d <= 0){
						d += incrE;
					} else {
						d += incrNE;
						y += ddy;
					}
					x += ddx;
					if (x < width && x >= 0 && y < height && y >= 0) {
						rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
						for(k = 0; k < 3; k++){
							outputData[(y*width+x)*4+k] = mixedRGB[k];
						}
					}
				}
			} else {
				d = 2*dx-dy;
				incrE = 2*dx;
				incrNE = 2*(dx-dy);

				while (y != y1) {
					if (d <= 0) {
						d += incrE;
					}else {
						d += incrNE;
						x += ddx;
					}
					y += ddy;
					if (x < width && x >= 0 && y < height && y >= 0) {
						rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
						for(k = 0; k < 3; k++){
							outputData[(y*width+x)*4+k] = mixedRGB[k];
						}
					}
				}
			}
		}
		for(k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Replaces every pixel with the maximum RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MaximumFilter(){
	this.name = "Maximum";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var maxR = 0;
				var maxG = 0;
				var maxB = 0;
				for (var dy = -1; dy <= 1; dy++){
					var iy = y+dy;
					if(iy >= 0 && iy < height){
						for (var dx = -1; dx <= 1; dx++){
							var ix = x+dx;
							if(ix >= 0 && ix < width){
								var iPixel = (iy*width + ix)*4;
								maxR = Math.max(maxR,inputData[iPixel]);
								maxG = Math.max(maxG,inputData[iPixel+1]);
								maxB = Math.max(maxB,inputData[iPixel+2]);
							}
						}
					}
				}
				outputData[pixel] = maxR;
				outputData[pixel+1] = maxG;
				outputData[pixel+2] = maxB;
				outputData[pixel+3] = inputData[pixel+3];
			}   
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Replaces every pixel with the median RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MedianFilter(){
	this.name = "Median";
	this.isDirAnimatable = false;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var rList = [];
				var gList = [];
				var bList = [];
				for (var dy = -1; dy <= 1; dy++){
					var iy = y+dy;
					if(iy >= 0 && iy < height){
						for (var dx = -1; dx <= 1; dx++){
							var ix = x+dx;
							if(ix >= 0 && ix < width){
								var iPixel = (iy*width + ix)*4;
								rList.push(inputData[iPixel]);
								gList.push(inputData[iPixel+1]);
								bList.push(inputData[iPixel+2]);

							}
						}
					}
				}
				var sortFunc = function(a,b){
					return a-b;
				};
				rList.sort(sortFunc);
				gList.sort(sortFunc);
				bList.sort(sortFunc);
				outputData[pixel] = rList[4];
				outputData[pixel+1] = gList[4];
				outputData[pixel+2] = bList[4];
				outputData[pixel+3] = inputData[pixel+3];
			}   
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Replaces every pixel with the minimum RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MinimumFilter(){
	this.name = "Minimum";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var minR = 255;
				var minG = 255;
				var minB = 255;
				for (var dy = -1; dy <= 1; dy++){
					var iy = y+dy;
					if(iy >= 0 && iy < height){
						for (var dx = -1; dx <= 1; dx++){
							var ix = x+dx;
							if(ix >= 0 && ix < width){
								var iPixel = (iy*width + ix)*4;
								minR = Math.min(minR,inputData[iPixel]);
								minG = Math.min(minG,inputData[iPixel+1]);
								minB = Math.min(minB,inputData[iPixel+2]);
							}
						}
					}
				}
				outputData[pixel] = minR;
				outputData[pixel+1] = minG;
				outputData[pixel+2] = minB;
				outputData[pixel+3] = inputData[pixel+3];
			}   
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Creates random noise on the image, with or without color.
 */
function NoiseFilter(){
	this.name = "Noise";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 25,
		density : 1,
		monochrome : true
	};
	this.valueRanges = {
		amount : {min:0, max:100},
		density : {min:0, max:1.0},
		monochrome : {min:false, max:true}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		var density = (values.density === undefined) ? this.defaultValues.density : values.density;
		var monochrome = (values.monochrome === undefined) ? this.defaultValues.monochrome : values.monochrome;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				if(Math.random() <= density){
					var n;
					if(monochrome){
						n = parseInt((2*Math.random()-1) * amount,10);
						inputData[pixel] += n;
						inputData[pixel+1] += n;
						inputData[pixel+2] += n;
					} else {
						for(var i = 0; i < 3; i++){
							n = parseInt((2*Math.random()-1) * amount,10);
							inputData[pixel+i] += n; 
						}
					}
				}
			}   
		}
	};
}
/**
 * Produces an oil painting effect on the image.
 * NOTE: This filter can be very slow, especially at higher ranges. Use with caution.
 */
function OilFilter(){
	this.name = "Oil Painting";
	this.isDirAnimatable = false;
	this.defaultValues = {
		range : 3
	};
	this.valueRanges = {
		range : {min:0, max:5}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		if(values === undefined){ values = this.defaultValues; }
		var range = (values.range === undefined) ? this.defaultValues.range : values.range;
		range = parseInt(range,10);
		var index = 0;
		var rHistogram = [];
		var gHistogram = [];
		var bHistogram = [];
		var rTotal = [];
		var gTotal = [];
		var bTotal = [];
		var levels = 256;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				for (var j = 0; j < levels; j++){
					rHistogram[j] = gHistogram[j] = bHistogram[j] = rTotal[j] = gTotal[j] = bTotal[j] = 0;
				}
				for (var row = -range; row <= range; row++) {
					var iy = y+row;
					var ioffset;
					if (0 <= iy && iy < height) {
						ioffset = iy*width;
						for (var col = -range; col <= range; col++) {
							var ix = x+col;
							if (0 <= ix && ix < width) {
								var ro = inputData[(ioffset+ix)*4];
								var go = inputData[(ioffset+ix)*4+1];
								var bo = inputData[(ioffset+ix)*4+2];
								var ri = ro*levels/256;
								var gi = go*levels/256;
								var bi = bo*levels/256;
								rTotal[ri] += ro;
								gTotal[gi] += go;
								bTotal[bi] += bo;
								rHistogram[ri]++;
								gHistogram[gi]++;
								bHistogram[bi]++;
							}
						}
					}
				}
				var r = 0, g = 0, b = 0;
				for (var i = 1; i < levels; i++) {
					if (rHistogram[i] > rHistogram[r]){
						r = i;
					}
					if (gHistogram[i] > gHistogram[g]){
						g = i;
					}
					if (bHistogram[i] > bHistogram[b]){
						b = i;
					}
				}
				r = rTotal[r] / rHistogram[r];
				g = gTotal[g] / gHistogram[g];
				b = bTotal[b] / bHistogram[b];
				outputData[pixel] = r;
				outputData[pixel+1] = g;
				outputData[pixel+2] = b;
				outputData[pixel+3] = inputData[pixel+3];
			}   
		}
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Changes the opacity of the image.
 */
function OpacityFilter(){
	this.name = "Opacity";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:1.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				inputData[pixel+3] = 255*amount;
			}   
		}
	};
}
/**
 * Pinches and whirls the image toward the center point. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function PinchFilter(){
	this.name = "Pinch/Whirl";
	this.isDirAnimatable = false;
	this.defaultValues = {
		amount : 0.5,
		radius : 100,
		angle : 0,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		amount : {min: -1.0, max: 1.0},
		radius : {min: 1, max: 200},
		angle : {min: 0, max: 360},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount; 
		var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle; 
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
		var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
		var radius2 = radius*radius;
		angle = angle/180 * Math.PI;
		var iCenterX = width * centerX; var iCenterY = height * centerY;
		var transInverse = function(x,y,out){
			var dx = x-iCenterX;
			var dy = y-iCenterY;
			var distance = dx*dx + dy*dy;
			if(distance > radius2 || distance === 0){
				out[0] = x;
				out[1] = y;
			} else {
				var d = Math.sqrt( distance / radius2 );
				var t = Math.pow( Math.sin( Math.PI*0.5 * d ), -amount);
				dx *= t;
				dy *= t;
				var e = 1 - d;
				var a = angle * e * e;
				var s = Math.sin(a);
				var c = Math.cos(a);
				out[0] = iCenterX + c*dx - s*dy;
				out[1] = iCenterY + s*dx + c*dy;
			}
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Pixelates the image i.e. divides the image into blocks of color.
 */
function PixelationFilter(){
	this.name = "Pixelation";
	this.isDirAnimatable = false;
	this.defaultValues = {
		size : 5
	};
	this.valueRanges = {
		size : {min:1, max:50}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var size = (values.size === undefined) ? this.defaultValues.size : values.size;
		size = parseInt(size,10);
		var pixels = [];
		var by, bx, bPixel;
		for (var y = 0; y < height; y+=size) {
			for (var x = 0; x < width; x+=size) {
				var pixel = (y*width + x)*4;
				var w = Math.min(size, width-x);
				var h = Math.min(size, height-y);
				var t = w*h;
				var r = 0, g = 0, b = 0;
				for(by = y; by < y+h; by++){
					for(bx = x; bx < x+w; bx++){
						bPixel = (by*width + bx)*4;
						r += inputData[bPixel];
						g +=  inputData[bPixel+1];
						b += inputData[bPixel+2];
					}
				}
				for(by = y; by < y+h; by++){
					for(bx = x; bx < x+w; bx++){
						bPixel = (by*width + bx)*4;
						inputData[bPixel] = r/t;
						inputData[bPixel+1] = g/t;
						inputData[bPixel+2] = b/t;
					}
				}
			}   
		}
	};
}
/**
 * Posterizes the image, i.e. restricts the color values to a set amount of levels.
 */
function PosterizeFilter(){
	this.name = "Posterize";
	this.isDirAnimatable = false;
	this.defaultValues = {
		levels : 6
	};
	this.valueRanges = {
		levels : {min:2, max:30 }
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var levels = (values.levels === undefined) ? this.defaultValues.levels : parseInt(values.levels,10);
		if(levels <= 1){
			return;
		}
		var table = [];
		for(var i = 0; i < 256; i++){
			table[i] = parseInt(255 * parseInt(i*levels/256,10) / (levels-1),10);
		}
		filterUtils.tableFilter(inputData,table,width,height);
	};
}
/**
 * Adjust the factor of each RGB color value in the image.
 */
function RGBAdjustFilter(){
	this.name = "RGBAdjust";
	this.isDirAnimatable = true;
	this.defaultValues = {
		red: 1.0,
		green: 1.0,
		blue: 1.0
	};
	this.valueRanges = {
		red: {min: 0.0, max: 2.0},
		green: {min: 0.0, max: 2.0},
		blue: {min: 0.0, max: 2.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var red = (values.red === undefined) ? this.defaultValues.red : values.red;
		var green = (values.green === undefined) ? this.defaultValues.green : values.green;
		var blue = (values.blue === undefined) ? this.defaultValues.blue : values.blue;
		if(red < 0){ red = 0; }
		if(green < 0){ green = 0; }
		if(blue < 0){ blue = 0; }
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				inputData[pixel] *= red;
				inputData[pixel+1] *= green;
				inputData[pixel+2] *= blue;
			}   
		}
	};
}
/**
 * Adjusts the saturation value of the image. Values over 1 increase saturation while values below decrease saturation.
 * For a true grayscale effect, use the grayscale filter instead.
 */
function SaturationFilter(){
	this.name = "Saturation";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:2.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		var RW = 0.3;
		var RG = 0.59;
		var RB = 0.11;
		var a = (1 - amount) * RW + amount;
		var b = (1 - amount) * RW;
		var c = (1 - amount) * RW;
		var d = (1 - amount) * RG;
		var e = (1 - amount) * RG + amount;
		var f = (1 - amount) * RG;
		var g = (1 - amount) * RB;
		var h = (1 - amount) * RB;
		var i = (1 - amount) * RB + amount;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var pR = inputData[pixel];
				var pG = inputData[pixel+1];
				var pB = inputData[pixel+2];
				inputData[pixel]   = a*pR + d*pG + g*pB;
				inputData[pixel+1] = b*pR + e*pG + h*pB;
				inputData[pixel+2]  = c*pR + f*pG + i*pB;
			}   
		}
	};
}
/**
 * Creates ripples on the image horizontally/vertically in a sawtooth pattern.
 */
function SawtoothRippleFilter(){
	this.name = "Sawtooth Ripples";
	this.isDirAnimatable = false;
	this.defaultValues = {
		xAmplitude : 5,
		yAmplitude : 5,
		xWavelength : 16,
		yWavelength : 16 
	};
	this.valueRanges = {
		xAmplitude : {min:0, max:30},
		yAmplitude : {min:0, max:30},
		xWavelength : {min:1, max:50},
		yWavelength : {min:1, max:50} 
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var xAmplitude = (values.xAmplitude === undefined) ? this.defaultValues.xAmplitude : values.xAmplitude; 
		var yAmplitude = (values.yAmplitude === undefined) ? this.defaultValues.yAmplitude : values.yAmplitude; 
		var xWavelength = (values.xWavelength === undefined) ? this.defaultValues.xWavelength : values.xWavelength; 
		var yWavelength = (values.yWavelength === undefined) ? this.defaultValues.yWavelength : values.yWavelength; 
		var transInverse = function(x,y,out){
			var nx = y/xWavelength;
			var ny = x/yWavelength;
			var fx = filterUtils.mod(nx,1);
			var fy = filterUtils.mod(ny,1);
			out[0] = x + xAmplitude * fx;
			out[1] = y + yAmplitude * fy;
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Creates a sepia effect on the image i.e. gives the image a yellow-brownish tone.
 */
function SepiaFilter(){
	this.name = "Sepia";
	this.isDirAnimatable = true;
	this.defaultValues = {
		amount : 10
	};
	this.valueRanges = {
		amount : {min:0, max:30}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		amount *= 255/100;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var luma = inputData[pixel]*0.3 + inputData[pixel+1]*0.59 + inputData[pixel+2]*0.11;
				var r,g,b;
				r = g = b = luma;
				r += 40;
				g += 20;
				b -= amount;
				
				inputData[pixel] = r;
				inputData[pixel+1] = g;
				inputData[pixel+2] = b;
			}   
		}
	};
}
/**
 * Sharpens the image slightly. For increased effect, apply the filter multiple times.
 */
function SharpenFilter(){
	this.name = "Sharpen";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var matrix = [ 0.0,-0.2, 0.0,
					  -0.2, 1.8,-0.2,
					   0.0, -0.2, 0.0];
		filterUtils.convolveFilter(inputData,matrix,width,height);
	};
}
/**
 * Creates ripples on the image horizontally/vertically in a sine pattern.
 */
function SineRippleFilter(){
	this.name = "Sine Ripples";
	this.isDirAnimatable = false;
	this.defaultValues = {
		xAmplitude : 5,
		yAmplitude : 5,
		xWavelength : 16,
		yWavelength : 16 
	};
	this.valueRanges = {
		xAmplitude : {min:0, max:30},
		yAmplitude : {min:0, max:30},
		xWavelength : {min:1, max:50},
		yWavelength : {min:1, max:50} 
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var xAmplitude = (values.xAmplitude === undefined) ? this.defaultValues.xAmplitude : values.xAmplitude; 
		var yAmplitude = (values.yAmplitude === undefined) ? this.defaultValues.yAmplitude : values.yAmplitude; 
		var xWavelength = (values.xWavelength === undefined) ? this.defaultValues.xWavelength : values.xWavelength; 
		var yWavelength = (values.yWavelength === undefined) ? this.defaultValues.yWavelength : values.yWavelength; 
		var transInverse = function(x,y,out){
			var nx = y/xWavelength;
			var ny = x/yWavelength;
			var fx = Math.sin(nx);
			var fy = Math.sin(ny);
			out[0] = x + xAmplitude * fx;
			out[1] = y + yAmplitude * fy;
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Produces a solarization effect on the image.  
 */
function SolarizeFilter(){
	this.name = "Solarize";
	this.isDirAnimatable = true;
	this.defaultValues = {
	};
	this.valueRanges = {
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var table = [];
		for(var i = 0; i < 256; i++){
			var val = (i/255 > 0.5) ? 2*(i/255-0.5) : 2*(0.5-i/255);
			table[i] = parseInt(255 * val,10);
		}
		filterUtils.tableFilter(inputData, table, width, height);
	};
}
/**
 * Generates a sparkle/sunburst effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function SparkleFilter(){
	this.name = "Sparkle";
	this.isDirAnimatable = false;
	this.defaultValues = {
		rays : 50,
		size : 25,
		amount : 50,
		randomness : 25,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		rays : {min:1, max:100},
		size : {min:1, max:200},
		amount : {min:0, max:100},
		randomness : {min:0, max:50},
		centerX : {min:0, max:1.0},
		centerY : {min:0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var rays = (values.rays === undefined) ? this.defaultValues.rays : values.rays;
		rays = parseInt(rays, 10);
		var size = (values.size === undefined) ? this.defaultValues.size : values.size;
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		var randomness = (values.randomness === undefined) ? this.defaultValues.randomness : values.randomness;
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX;
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY;
		var iCenterX = centerX * width;
		var iCenterY = centerY * height;
		var rayLengths = [];
		for(var j = 0; j < rays; j++){
			rayLengths[j]= size + randomness / 100 * size * filterUtils.gaussianRandom();
		}
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var dx = x-iCenterX;
				var dy = y-iCenterY;
				var distance = dx*dx + dy*dy;
				var angle = Math.atan2(dy,dx);
				var d = (angle+Math.PI) / (Math.PI*2) * rays;
				var i = parseInt(d,10);
				var f = d - i;
				if(size !== 0){
					var length = filterUtils.linearInterpolate(f, rayLengths[i % rays], rayLengths[(i+1) % rays]);
					var g = length*length / (distance+0.0001);
					g = Math.pow(g, (100-amount) / 50);
					f -= 0.5;
					f = 1 - f*f;
					f *= g;
				}
				f = filterUtils.clampPixel(f,0,1);
				var mixedRGB = filterUtils.mixColors(f,[inputData[pixel],inputData[pixel+1],inputData[pixel+2],inputData[pixel+3]],[255,255,255,255]);
				for(var k = 0; k < 3; k++){
					inputData[pixel+k] = mixedRGB[k]; 
				}
			}   
		}
	};
}
/**
 * Smears out the image with square shapes to create a painting style effect.
 * The mix values sets the intensity of the effect.
 * NOTE: This filter can be very slow, especially at higher densities/sizes. Use with caution.
 */
function SquareSmearFilter(){
	this.name = "Square Smear";
	this.isDirAnimatable = false;
	this.defaultValues = {
		size : 4,
		density : 0.5,
		mix : 0.5
	};
	this.valueRanges = {
		size : {min:1, max:10},
		density : {min:0.0, max:1.0},
		mix : {min:0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		var k;
		for(k = 0; k < inputData.length; k++){
			outputData[k] = inputData[k];
		}
		if(values === undefined){ values = this.defaultValues; }
		var size = (values.size === undefined) ? this.defaultValues.size : values.size;
		if(size < 1){ size = 1;}
		size = parseInt(size,10);
		var density = (values.density === undefined) ? this.defaultValues.density : values.density;
		var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
		var radius = size+1;
		var radius2 = radius*radius;
		var numShapes = parseInt(2*density/30*width*height / 2,10);
		for(var i = 0; i < numShapes; i++){
			var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
			var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
			var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
			for(var x = sx - radius; x < sx + radius + 1; x++){
				
				for(var y = sy - radius; y < sy + radius + 1; y++){
					if (x >= 0 && x < width && y >= 0 && y < height) {
						var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2);
						for(k = 0; k < 3; k++){
							outputData[(y*width+x)*4+k] = mixedRGB[k];
						}
					}
				}
			}
		}
		for(k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Divides the colors into black and white following the treshold value. Brightnesses above the threshold
 * sets the color to white while values below the threshold sets the color to black.
 */
function ThresholdFilter(){
	this.name = "Black & White";
	this.isDirAnimatable = true;
	this.defaultValues = {
		threshold : 127
	};
	this.valueRanges = {
		threshold : {min:0, max:255}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var threshold = (values.threshold === undefined) ? this.defaultValues.threshold : values.threshold;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var pixel = (y*width + x)*4;
				var brightness = (inputData[pixel] + inputData[pixel+1] + inputData[pixel+2])/3;
				var colorVal = 0;
				if(brightness > threshold){
					colorVal = 255;
				}
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = colorVal;
			}   
		}
	};
}
/**
 * Creates ripples on the image horizontally/vertically in a sine pattern.
 */
function TriangleRippleFilter(){
	this.name = "Triangle Ripples";
	this.isDirAnimatable = false;
	this.defaultValues = {
		xAmplitude : 5,
		yAmplitude : 5,
		xWavelength : 16,
		yWavelength : 16 
	};
	this.valueRanges = {
		xAmplitude : {min:0, max:30},
		yAmplitude : {min:0, max:30},
		xWavelength : {min:1, max:50},
		yWavelength : {min:1, max:50} 
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var xAmplitude = (values.xAmplitude === undefined) ? this.defaultValues.xAmplitude : values.xAmplitude; 
		var yAmplitude = (values.yAmplitude === undefined) ? this.defaultValues.yAmplitude : values.yAmplitude; 
		var xWavelength = (values.xWavelength === undefined) ? this.defaultValues.xWavelength : values.xWavelength; 
		var yWavelength = (values.yWavelength === undefined) ? this.defaultValues.yWavelength : values.yWavelength; 
		var transInverse = function(x,y,out){
			var nx = y/xWavelength;
			var ny = x/yWavelength;
			var fx = filterUtils.triangle(nx,1);
			var fy = filterUtils.triangle(ny,1);
			out[0] = x + xAmplitude * fx;
			out[1] = y + yAmplitude * fy;
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Twists the image around a given center point. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function TwirlFilter(){
	this.name = "Twirl";
	this.isDirAnimatable = false;
	this.defaultValues = {
		radius : 100,
		angle : 180,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		radius : {min: 1, max: 200},
		angle : {min: 0, max: 360},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};

	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle; 
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
		var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
		var radius2 = radius*radius;
		angle = angle/180 * Math.PI;
		var iCenterX = width * centerX; var iCenterY = height * centerY;
		var transInverse = function(x,y,out){
			var dx = x-iCenterX;
			var dy = y-iCenterY;
			var distance = dx*dx + dy*dy;
			if(distance > radius2){
				out[0] = x;
				out[1] = y;
			} else {
				distance = Math.sqrt(distance);
				var a = Math.atan2(dy, dx) + angle * (radius-distance) / radius;
				out[0] = iCenterX + distance*Math.cos(a);
				out[1] = iCenterY + distance*Math.sin(a);
			}
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * Creates a classical vignette effect on the image i.e. darkens the corners.
 */
function VignetteFilter(){
	this.name = "Vignette";
	this.isDirAnimatable = false;
	this.defaultValues = {
		amount : 0.3
	};
	this.valueRanges = {
		amount : {min:0.0, max:1.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		var outputData = [];
		if(values === undefined){ values = this.defaultValues; }
		var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext("2d");
		var gradient;
		var radius = Math.sqrt( Math.pow(width/2, 2) + Math.pow(height/2, 2) );
		context.putImageData(input,0,0);
		context.globalCompositeOperation = 'source-over';
		
		gradient = context.createRadialGradient(width/2, height/2, 0, width/2, height/2, radius);
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, 'rgba(0,0,0,' + amount + ')');
		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);
		outputData = context.getImageData(0,0,width,height).data;
		for(var k = 0; k < outputData.length; k++){
			inputData[k] = outputData[k];
		}
	};
}
/**
 * Produces a water ripple/waves on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function WaterRippleFilter(){
	this.name = "Water Ripples";
	this.isDirAnimatable = false;
	this.defaultValues = {
		phase : 0,
		radius : 50,
		wavelength : 16,
		amplitude : 10,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		phase : {min: 0, max: 100},
		radius : {min: 1, max: 200},
		wavelength : {min: 1, max: 100},
		amplitude : {min: 1, max: 100},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};
	var filterUtils = new FilterUtils();

	this.filter = function (input, values){
		var width = input.width, height = input.height;
		var inputData = input.data;
		if(values === undefined){ values = this.defaultValues; }
		var wavelength = (values.wavelength === undefined) ? this.defaultValues.wavelength : values.wavelength; 
		var amplitude = (values.amplitude === undefined) ? this.defaultValues.amplitude : values.amplitude; 
		var phase = (values.phase === undefined) ? this.defaultValues.phase : values.phase; 
		var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
		var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
		var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
		var radius2 = radius*radius;
		var iCenterX = width * centerX; var iCenterY = height * centerY;
		var transInverse = function(x,y,out){
			var dx = x-iCenterX;
			var dy = y-iCenterY;
			var distance2 = dx*dx + dy*dy;
			if(distance2 > radius2){
				out[0] = x;
				out[1] = y;
			} else {
				var distance = Math.sqrt(distance2);
				var amount = amplitude * Math.sin(distance/wavelength * Math.PI * 2 - phase);
				amount *= (radius-distance)/radius;
				if(distance !== 0){
					amount *= wavelength/distance;
				}
				out[0] = x + dx*amount;
				out[1] = y + dy*amount;
			}
		};
		filterUtils.transformFilter(inputData,transInverse,width,height);
	};
}
/**
 * A collection of all the filters.
 */
var JSManipulate = {
	blur : new BlurFilter(),
	brightness : new BrightnessFilter(),
	bump : new BumpFilter(),
	circlesmear : new CircleSmearFilter(),
	contrast : new ContrastFilter(),
	crosssmear : new CrossSmearFilter(),
	diffusion : new DiffusionFilter(),
	dither : new DitherFilter(),
	edge : new EdgeFilter(),
	emboss : new EmbossFilter(),
	exposure : new ExposureFilter(),
	gain : new GainFilter(),
	gamma : new GammaFilter(),
	grayscale : new GrayscaleFilter(),
	hue : new HueFilter(),
	invert : new InvertFilter(),
	kaleidoscope : new KaleidoscopeFilter(),
	lensdistortion : new LensDistortionFilter(),
	linesmear : new LineSmearFilter(),
	maximum : new MaximumFilter(),
	median : new MedianFilter(),
	minimum : new MinimumFilter(),
	noise : new NoiseFilter(),
	oil : new OilFilter(),
	opacity : new OpacityFilter(),
	pinch : new PinchFilter(),
	pixelate : new PixelationFilter(),
	posterize : new PosterizeFilter(),
	rgbadjust : new RGBAdjustFilter(),
	saturation : new SaturationFilter(),
	sawtoothripple : new SawtoothRippleFilter(),
	sepia : new SepiaFilter(),
	sharpen : new SharpenFilter(),
	sineripple : new SineRippleFilter(),
	solarize : new SolarizeFilter(),
	sparkle : new SparkleFilter(),
	squaresmear : new SquareSmearFilter(),
	threshold : new ThresholdFilter(),
	triangleripple : new TriangleRippleFilter(),
	twirl : new TwirlFilter(),
	vignette : new VignetteFilter(),
	waterripple : new WaterRippleFilter() 
};