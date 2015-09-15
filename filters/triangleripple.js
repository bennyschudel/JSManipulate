/**
 * Creates ripples on the image horizontally/vertically in a sine pattern.
 */
function TriangleRippleFilter(){
	this.name = "Triangle Ripples";
	this.defaultValues = {
		xAmplitude : 5,
		yAmplitude : 5,
		xWavelength : 16,
		yWavelength : 16 
	};
	this.valueRanges = {
		xAmplitude : {min:0, max:30},
		yAmplitude : {min:0, max:30},
		xWavelength : {min:1, max:50},
		yWavelength : {min:1, max:50} 
	};
	if(!FilterUtils){
		if(console){
			console.error("Unable to find filterutils.js, please include this file! (Required by " + this.name + " filter)");
		}
		return;
	}
	var filterUtils = new FilterUtils();
	
	this.filter = function (input, values){
	  	var width = input.width, height = input.height;
	 	var inputData = input.data;
	 	if(values === undefined){ values = this.defaultValues; }
	  	var xAmplitude = (values.xAmplitude === undefined) ? this.defaultValues.xAmplitude : values.xAmplitude; 
	  	var yAmplitude = (values.yAmplitude === undefined) ? this.defaultValues.yAmplitude : values.yAmplitude; 
	  	var xWavelength = (values.xWavelength === undefined) ? this.defaultValues.xWavelength : values.xWavelength; 
	  	var yWavelength = (values.yWavelength === undefined) ? this.defaultValues.yWavelength : values.yWavelength; 
	  	var transInverse = function(x,y,out){
	  		var nx = y/xWavelength;
	  		var ny = x/yWavelength;
	  		var fx = filterUtils.triangle(nx,1)
	  		var fy = filterUtils.triangle(ny,1)
	  		out[0] = x + xAmplitude * fx;
	  		out[1] = y + yAmplitude * fy;
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
