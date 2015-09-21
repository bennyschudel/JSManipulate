/**
 * Replaces every pixel with the median RGB value of the neighboring pixels. Each color is 
 * considered separately.
 */
function MedianFilter(){
	this.name = "Median";
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
	            rList.sort(function(a,b){return a-b});
	            gList.sort(function(a,b){return a-b});
	            bList.sort(function(a,b){return a-b});
	            outputData[pixel] = rList[4];
	            outputData[pixel+1] = gList[4];
	            outputData[pixel+2] = bList[4];
	            outputData[pixel+3] = inputData[pixel+3];
	        }   
	    }
	    for(var k = 0; k < outputData.length; k++){
  			inputData[k] = outputData[k];
  		}
	}			
}
