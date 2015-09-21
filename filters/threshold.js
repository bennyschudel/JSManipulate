/**
 * Divides the colors into black and white following the treshold value. Brightnesses above the threshold
 * sets the color to white while values below the threshold sets the color to black.
 */
function ThresholdFilter(){
	this.name = "Black & White";
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
	            var brightness = (inputData[pixel] + inputData[pixel+1] + inputData[pixel+2])/3
	            var colorVal = 0;
	            if(brightness > threshold){
	            	colorVal = 255;
	            }
	            inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = colorVal;
	        }   
	    }
	}
}
