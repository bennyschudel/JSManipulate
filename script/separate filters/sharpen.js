/**
 * Sharpens the image slightly. For increased effect, apply the filter multiple times.
 */
function SharpenFilter(){
	this.name = "Sharpen";
	this.defaultValues = {
	};
	this.valueRanges = {
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
	  	var matrix = [ 0,-0.2, 0,
	  				  -0.2,1.8,-0.2,
	  				   0, -0.2, 0];
	  	filterUtils.convolveFilter(inputData,matrix,width,height);
	}			
}
