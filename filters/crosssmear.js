/**
 * Smears out the image with cross shapes to create a painting style effect.
 * The mix values sets the intensity of the effect.
 */
function CrossSmearFilter(){
	this.name = "Cross Smear";
	this.defaultValues = {
		distance : 8,
		density : 0.5,
		mix : 0.5,
	};
	this.valueRanges = {
		distance : {min:0, max:30},
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
	  	var distance = (values.distance === undefined) ? this.defaultValues.distance : values.distance;
	  	if(distance < 0){ distance = 0;}
	  	distance = parseInt(distance);
	  	var density = (values.density === undefined) ? this.defaultValues.density : values.density;
	  	var mix = (values.mix === undefined) ? this.defaultValues.mix : values.mix;
	  	var numShapes = parseInt(2*density*width * height / (distance + 1));
	  	for(var i = 0; i < numShapes; i++){
	  		var x = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
	  		var y = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
	  		var length = (Math.random()*Math.pow(2,32)) % distance + 1;
	  		var rgb2 = [inputData[(y*width+x)*4],inputData[(y*width+x)*4+1],inputData[(y*width+x)*4+2],inputData[(y*width+x)*4+3]];
	  		for (var x1 = x-length; x1 < x+length+1; x1++) {
	            if(x1 >= 0 && x1 < width){
	            	var rgb1 = [outputData[(y*width+x1)*4],outputData[(y*width+x1)*4+1],outputData[(y*width+x1)*4+2],outputData[(y*width+x1)*4+3]];
	            	var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2)
	            	for(var k = 0; k < 3; k++){
	            		outputData[(y*width+x1)*4+k] = mixedRGB[k];
	            	}
	            }
		            
	        } 
	  		for (var y1 = y-length; y1 < y+length+1; y1++) {
	            if(y1 >= 0 && y1 < height){
	            	var rgb1 = [outputData[(y1*width+x)*4],outputData[(y1*width+x)*4+1],outputData[(y1*width+x)*4+2],outputData[(y1*width+x)*4+3]];
	            	var mixedRGB = filterUtils.mixColors(mix,rgb1,rgb2)
	            	for(var k = 0; k < 3; k++){
	            		outputData[(y1*width+x)*4+k] = mixedRGB[k];
	            	}
	            }
		            
	        } 
	  	}
	    for(var k = 0; k < outputData.length; k++){
  			inputData[k] = outputData[k];
  		}
	}			
}
