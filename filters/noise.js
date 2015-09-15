/**
 * Creates random noise on the image, with or without color.
 */
function NoiseFilter(){
	this.name = "Noise";
	this.defaultValues = {
		amount : 25,
		density : 1,
		monochrome : true
	};
	this.valueRanges = {
		amount : {min:0, max:100},
		density : {min:0, max:1.0},
		monochrome : {min:false, max:true}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	if(values === undefined){ values = this.defaultValues; }
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
	  	var density = (values.density === undefined) ? this.defaultValues.density : values.density;
	  	var monochrome = (values.monochrome === undefined) ? this.defaultValues.monochrome : values.monochrome;
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            if(Math.random() <= density){
	            	if(monochrome){
	            		var n = parseInt((2*Math.random()-1) * amount);
	            		inputData[pixel] += n;
	            		inputData[pixel+1] += n;
	            		inputData[pixel+2] += n;
	            	} else {
	            		for(var i = 0; i < 3; i++){
	            			var n = parseInt((2*Math.random()-1) * amount);
	            			inputData[pixel+i] += n; 
	            		}
	            	}
	            }
	        }   
	    }
	}
}
