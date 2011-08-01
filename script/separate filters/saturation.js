/**
 * Adjusts the saturation value of the image. Values over 1 increase saturation while values below decrease saturation.
 * For a true grayscale effect, use the grayscale filter instead.
 */
function SaturationFilter(){
	this.name = "Saturation";
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:2.0}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	if(values === undefined){ values = this.defaultValues; }
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
		var RW = 0.3086;
		var RG = 0.6084;
		var RB = 0.0820;
	  	var a = (1 - amount) * RW + amount;
		var b = (1 - amount) * RW;
	  	var c = (1 - amount) * RW;
	  	var d = (1 - amount) * RG;
	  	var e = (1 - amount) * RG + amount;
	  	var f = (1 - amount) * RG;
	  	var g = (1 - amount) * RB;
	  	var h = (1 - amount) * RB;
	  	var i = (1 - amount) * RB + amount;
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
		        inputData[pixel]   = a*inputData[pixel] + d*inputData[pixel+1] + g*inputData[pixel+2];
				inputData[pixel+1] = b*inputData[pixel] + e*inputData[pixel+1] + h*inputData[pixel+2];
				inputData[pixel+2]  = c*inputData[pixel] + f*inputData[pixel+1] + i*inputData[pixel+2];
	        }   
	    }
	}
}
