/**
 * Pixelates the image i.e. divides the image into blocks of color.
 */
function PixelationFilter(){
	this.name = "Pixelation";
	this.defaultValues = {
		size : 5
	};
	this.valueRanges = {
		size : {min:1, max:50}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	if(values === undefined){ values = this.defaultValues; }
	  	var size = (values.size === undefined) ? this.defaultValues.size : values.size;
	  	size = parseInt(size);
	  	var pixels = [];
	  	for (var y = 0; y < height; y+=size) {
	        for (var x = 0; x < width; x+=size) {
	            var pixel = (y*width + x)*4;
	            var w = Math.min(size, width-x);
	            var h = Math.min(size, height-y);
	            var t = w*h;
	            var r = 0, g = 0, b = 0;
	            for(var by = y; by < y+h; by++){
	            	for(var bx = x; bx < x+w; bx++){
	            		var bPixel = (by*width + bx)*4;
	            		r += inputData[bPixel];
	            		g +=  inputData[bPixel+1];
	            		b += inputData[bPixel+2];
	            	}
	            }
	            for(var by = y; by < y+h; by++){
	            	for(var bx = x; bx < x+w; bx++){
	            		var bPixel = (by*width + bx)*4;
	            		inputData[bPixel] = r/t;
	            		inputData[bPixel+1] = g/t;
	            		inputData[bPixel+2] = b/t;
	            	}
	            }
	        }   
	    }
	}
}
