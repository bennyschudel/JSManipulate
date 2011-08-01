/**
 * Sets the image to grayscale.
 */
function GrayscaleFilter(){
	this.name = "Grayscale";
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
	}
}
