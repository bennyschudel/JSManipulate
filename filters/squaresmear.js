/**
 * Smears out the image with square shapes to create a painting style effect.
 * The mix values sets the intensity of the effect.
 * NOTE: This filter can be very slow, especially at higher densities/sizes. Use with caution.
 */
function SquareSmearFilter(){
	this.name = "Square Smear";
	this.defaultValues = {
		size : 4,
		density : 0.5,
		mix : 0.5,
	};
	this.valueRanges = {
		size : {min:1, max:10},
		density : {min:0.0, max:1.0},
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
	  	var size = (values.size === undefined) ? this.defaultValues.size : values.size;
	  	if(size < 1){ size = 1;}
	  	size = parseInt(size);
	  	var density = (values.density === undefined) ? this.defaultValues.density : values.density;
	  	var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
	  	var radius = size+1;
	  	var radius2 = radius*radius;
	  	var numShapes = parseInt(2*density/30*width*height / 2);
	  	for(var i = 0; i < numShapes; i++){
	  		var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
	  		var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
	  		var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
			for(var x = sx - radius; x < sx + radius + 1; x++){
				
				for(var y = sy - radius; y < sy + radius + 1; y++){
					if (x >= 0 && x < width && y >= 0 && y < height) {
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
