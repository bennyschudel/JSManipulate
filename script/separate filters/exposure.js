/**
 * Adjust simulated exposure values on the image.
 */
function ExposureFilter(){
	this.name = "Exposure";
	this.defaultValues = {
		exposure : 1.0
	};
	this.valueRanges = {
		exposure : {min:0, max:5}
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
	  	var exposure = (values.exposure === undefined) ? this.defaultValues.exposure : values.exposure;
  		var table = [];
  		for(var i = 0; i < 256; i++){
  			table[i] = parseInt(255 *(1-Math.exp(-(i/255) * exposure)));
  		}
	  	filterUtils.tableFilter(inputData, table, width, height);
	}			
}
