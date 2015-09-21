/**
 * Inverts the colors of the image.
 */
function InvertFilter(){
	this.name = "Invert";
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
	}
}
