/**
 * Creates a sepia effect on the image i.e. gives the image a yellow-brownish tone.
 */
function SepiaFilter(){
	this.name = "Sepia";
	this.defaultValues = {
		amount : 10
	};
	this.valueRanges = {
		amount : {min:0, max:30}
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
	  	amount *= 255/100;
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            var luma = inputData[pixel]*0.3 + inputData[pixel+1]*0.59 + inputData[pixel+2]*0.11;
	            var r,g,b;
	            r = g = b = luma;
	           	r += 40;
	           	g += 20;
				b -= amount;	
				
				inputData[pixel] = r;           	
				inputData[pixel+1] = g;           	
				inputData[pixel+2] = b;           	
	        }   
	    }
	}			
}
