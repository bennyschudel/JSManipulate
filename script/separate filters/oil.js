/**
 * Produces an oil painting effect on the image.
 * NOTE: This filter can be very slow, especially at higher ranges. Use with caution.
 */
function OilFilter(){
	this.name = "Oil Painting";
	this.defaultValues = {
		range : 3,
	};
	this.valueRanges = {
		range : {min:0, max:5},
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	var outputData = [];
	  	if(values === undefined){ values = this.defaultValues; }
	  	var range = (values.range === undefined) ? this.defaultValues.range : values.range;
	  	range = parseInt(range);
	  	var index = 0;
		var rHistogram = [];
		var gHistogram = [];
		var bHistogram = [];
		var rTotal = [];
		var gTotal = [];
		var bTotal = [];
		var levels = 256;
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            for (var i = 0; i < levels; i++){
				    rHistogram[i] = gHistogram[i] = bHistogram[i] = rTotal[i] = gTotal[i] = bTotal[i] = 0;
	        	}
	        	for (var row = -range; row <= range; row++) {
					var iy = y+row;
					var ioffset;
					if (0 <= iy && iy < height) {
						ioffset = iy*width;
						for (var col = -range; col <= range; col++) {
							var ix = x+col;
							if (0 <= ix && ix < width) {
								var r = inputData[(ioffset+ix)*4]
								var g = inputData[(ioffset+ix)*4+1]
								var b = inputData[(ioffset+ix)*4+2]
								var ri = r*levels/256;
								var gi = g*levels/256;
								var bi = b*levels/256;
								rTotal[ri] += r;
								gTotal[gi] += g;
								bTotal[bi] += b;
								rHistogram[ri]++;
								gHistogram[gi]++;
								bHistogram[bi]++;
							}
						}
					}
				}
				var r = 0, g = 0, b = 0;
				for (var i = 1; i < levels; i++) {
					if (rHistogram[i] > rHistogram[r]){
						r = i;
					}
					if (gHistogram[i] > gHistogram[g]){
						g = i;
					}
					if (bHistogram[i] > bHistogram[b]){
						b = i;
					}
				}
				r = rTotal[r] / rHistogram[r];
				g = gTotal[g] / gHistogram[g];
				b = bTotal[b] / bHistogram[b];
				outputData[pixel] = r;
				outputData[pixel+1] = g;
				outputData[pixel+2] = b;
				outputData[pixel+3] = inputData[pixel+3];
	        }   
	    }
	    for(var k = 0; k < outputData.length; k++){
  			inputData[k] = outputData[k];
  		}
	}			
}
