/**
 * Embosses the edges of the image.
 * This filter takes no parameters but can be applied several times for
 * further effect.
 */
function BumpFilter(){
	this.name = "Bump";
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
	  	var matrix = [-1,-1, 0,
	  				  -1, 1, 1,
	  				   0, 1, 1];
	  	filterUtils.convolveFilter(inputData,matrix,width,height);
	}			
}
