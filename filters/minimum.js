/**
 * Replaces every pixel with the minimum RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MinimumFilter(){
	this.name = "Minimum";
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
	}			
}
