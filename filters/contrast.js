/**
 * Adjusts the contrast of the image.
 */
function ContrastFilter(){
	this.name = "Contrast";
	this.defaultValues = {
		amount : 1.0
	};
	this.valueRanges = {
		amount : {min:0.0, max:2.0}
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
		if(amount < 0){
			amount = 0.0;
		}
		var table = [];
		
		for(var i = 0; i < 256; i++){
			table[i] = parseInt(255 * (((i/255)-0.5)*amount+0.5));
		}
	    filterUtils.tableFilter(inputData,table,width,height);
	}
}
