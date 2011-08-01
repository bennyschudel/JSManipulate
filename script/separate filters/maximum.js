/**
 * Replaces every pixel with the maximum RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MaximumFilter(){
	this.name = "Maximum";
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
	}			
}
