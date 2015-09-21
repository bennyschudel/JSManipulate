/**
 * Dithers the image to the specified number of colors. Setting color to false
 * grayscales the image.
 */
function DitherFilter(){
	this.name = "Dither";
	this.defaultValues = {
		levels : 3,
		color : true
	};
	this.valueRanges = {
		levels : {min:2, max:30},
		color : {min:false, max:true}
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
	  	var outputData = [];
	  	for (var i=0; i < inputData.length; i++) {
			outputData[i] = 0;
		};
	  	if(values === undefined){ values = this.defaultValues; }
	  	var levels = (values.levels === undefined) ? this.defaultValues.levels : values.levels;
	  	var color = (values.color === undefined) ? this.defaultValues.color : values.color;
	  	if(levels <= 1){
	  		levels = 1;
	  	}
		var matrix = [0,0,0,
					  0,0,7,
					  3,5,1];
		var sum = 7+3+5+1;
		var index = 0;
		var map = [];
		for (var i=0; i < levels; i++) {
			map[i] = parseInt(255* i / (levels-1));
		};
		var div = [];
		for (var i=0; i < 256; i++) {
			div[i] = parseInt(levels*i / 256);
		};
	  	for (var y = 0; y < height; y++) {
	  		var reverse = ((y & 1) == 1);
	  		var direction;
	  		if(reverse){
	  			index = (y*width+width-1)*4;
	  			direction = -1
	  		} else {
	  			index = y*width*4;
	  			direction = 1;
	  		}
	        for (var x = 0; x < width; x++) {
	            var r1 = inputData[index]; var g1 = inputData[index+1]; var b1 = inputData[index+2];
	            if(!color){
	            	r1 = g1 = b1 = parseInt((r1+g1+b1) / 3);
	            }
	            var r2 = map[div[r1]];var g2 = map[div[g1]];var b2 = map[div[b1]];
	            
	            outputData[index] = r2; outputData[index + 1] = g2; outputData[index+2] = b2; outputData[index+3] = inputData[index+3];
	            
	            var er = r1-r2; var eg = g1-g2; var eb = b1-b2;
	            
	            for (var i = -1; i <= 1; i++) {
					var iy = i+y;
					if (0 <= iy && iy < height) {
						for (var j = -1; j <= 1; j++) {
							var jx = j+x;
							if (0 <= jx && jx < width) {
								var w;
								if (reverse){
									w = matrix[(i+1)*3-j+1];
								} else{
									w = matrix[(i+1)*3+j+1];
								}
								if (w != 0) {
									var k = (reverse) ? index - j*4 : index + j*4;
									r1 = inputData[k]; g1 = inputData[k+1]; b1 = inputData[k+2];
									var factor = w/sum;
									r1 += er * factor; g1 += eg * factor; b1 += eb * factor;
									inputData[k] = r1; inputData[k+1] = g1 ;inputData[k+2] = b1;
								}
							}
						}
					}
				}
				index += direction*4;
			}
	    }
	    for(var k = 0; k < outputData.length; k++){
	  		inputData[k] = outputData[k];
	  	}
	}
}
