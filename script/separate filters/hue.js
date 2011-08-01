/**
 * Adjusts the hue of the image by going over to HSV values.
 */
function HueFilter(){
	this.name = "Hue";
	this.defaultValues = {
		amount : 0.0
	};
	this.valueRanges = {
		amount : {min:-1.0, max:1.0}
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
	  	if(values === undefined){ values = this.defaultValues; }
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            var hsv = filterUtils.RGBtoHSV(inputData[pixel],inputData[pixel+1],inputData[pixel+2]);
	            hsv[0] += amount;
	            while(hsv[0] < 0){
					hsv[0] += 360;
				}
				var rgb = filterUtils.HSVtoRGB(hsv[0],hsv[1],hsv[2]);
				for(var i = 0; i < 3; i++){
					inputData[pixel+i] = rgb[i];
				}
	        }   
	    }
	}			
}
