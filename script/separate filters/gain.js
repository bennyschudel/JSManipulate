/**
 * Adjusts the gain and bias of the image. Gain alters the contrast while bias biases
 * colors towards lighter or darker.
 */
function GainFilter(){
	this.name = "Gain/Bias";
	this.defaultValues = {
		gain: 0.5,
		bias: 0.5
	};
	this.valueRanges = {
		gain: {min:0.0, max:1.0},
		bias: {min:0.0, max:1.0}
	};
	var table = [];
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
	  	var gain = (values.gain === undefined) ? this.defaultValues.gain : values.gain;
	  	var bias = (values.bias === undefined) ? this.defaultValues.bias : values.bias;
		
		var table = [];
		
		for(var i = 0; i < 256; i++){
			var val = i/255;
			var k = (1/gain-2) * (1-2*val);
			val = (val < 0.5) ? val/(k+1) : (k-val)/(k-1);
			val /= (1/bias-2)*(1-val)+1; 
			table[i] = parseInt(255 * val);
		}
	    filterUtils.tableFilter(inputData,table,width,height);
	}
}
