/**
 * Adjust the factor of each RGB color value in the image.
 */
function RGBAdjustFilter(){
	this.name = "RGBAdjust";
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
	}
}
