/**
 * Smears out the image with line shapes to create a painting style effect. Mix specifies
 * the intensity of the effect.
 */
function LineSmearFilter(){
	this.name = "Line Smear";
	this.defaultValues = {
		distance : 8,
		density : 0.5,
		angle : 0,
		mix : 0.5,
	};
	this.valueRanges = {
		distance : {min:1, max:30},
		density : {min:0.0, max:1.0},
		angle : {min:0, max:360},
		mix : {min:0.0, max:1.0},
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
	  	var outputData = [];
	  	 for(var k = 0; k < inputData.length; k++){
  			outputData[k] = inputData[k];
  		}
	  	if(values === undefined){ values = this.defaultValues; }
	  	var distance = (values.distance === undefined) ? this.defaultValues.distance : values.distance;
	  	if(distance < 1){ distance = 1;}
	  	distance = parseInt(distance);
	  	var density = (values.density === undefined) ? this.defaultValues.density : values.density;
	  	var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle;
	  	var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
	  	angle = angle/180*Math.PI;
	  	var sinAngle = Math.sin(angle);
	  	var cosAngle = Math.cos(angle);
	  	var numShapes = parseInt(2*density*width*height / 2);
	  	for(var i = 0; i < numShapes; i++){
	  		var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
	  		var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
	  		var length = (Math.random()*Math.pow(2,32) & 0x7fffffff) % distance + 1;
	  		var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
  			var dx = parseInt(length*cosAngle);
			var dy = parseInt(length*sinAngle);

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
			
			if (x < width && x >= 0 && y < height && y >= 0) {
				var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
				var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2)
            	for(var k = 0; k < 3; k++){
            		outputData[(y*width+x)*4+k] = mixedRGB[k];
            	}
			}
			if (Math.abs(dx) > Math.abs(dy)) {
				d = 2*dy-dx;
				incrE = 2*dy;
				incrNE = 2*(dy-dx);

				while (x != x1) {
					if (d <= 0)
						d += incrE;
					else {
						d += incrNE;
						y += ddy;
					}
					x += ddx;
					if (x < width && x >= 0 && y < height && y >= 0) {
						var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2)
		            	for(var k = 0; k < 3; k++){
		            		outputData[(y*width+x)*4+k] = mixedRGB[k];
		            	}
					}
				}
			} else {
				d = 2*dx-dy;
				incrE = 2*dx;
				incrNE = 2*(dx-dy);

				while (y != y1) {
					if (d <= 0)
						d += incrE;
					else {
						d += incrNE;
						x += ddx;
					}
					y += ddy;
					if (x < width && x >= 0 && y < height && y >= 0) {
						var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
						var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2)
		            	for(var k = 0; k < 3; k++){
		            		outputData[(y*width+x)*4+k] = mixedRGB[k];
		            	}
					}
				}
			}
	  	}
	    for(var k = 0; k < outputData.length; k++){
  			inputData[k] = outputData[k];
  		}
	}			
}
