/** 
 * Highlights the edges of the image.
 */
function EdgeFilter(){
	this.name = "Edge Detection";
	var matrixH = [-1,-2,-1,
		 			0, 0, 0,
		 			1, 2, 1];
	var matrixV = [-1, 0, 1,
		 		   -2, 0, 2,
		 		   -1, 0, 1];
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	var outputData = [];
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            var rh = 0; gh = 0; bh = 0;
	            var rv = 0; gv = 0; bv = 0;
	            for(var row = -1; row <= 1; row++){
	            	var iy = y+row;
	            	var ioffset;
	            	if(iy >= 0 && iy < height){
	            		ioffset = iy*width*4;
	            	} else {
	            		ioffset = y*width*4;
	            	}
	            	var moffset = 3*(row+1)+1;
	            	for(var col = -1; col <= 1; col++){
	            		var ix = x+col;
	            		if(!(ix >= 0 && ix < width)){
	            			ix = x;
	            		}
	            		ix *= 4;
	            		var r = inputData[ioffset+ix];
	            		var g = inputData[ioffset+ix+1];
	            		var b = inputData[ioffset+ix+2];
	            		var h = matrixH[moffset+col];
	            		var v = matrixV[moffset+col];
	            		rh += parseInt(h*r);
	            		bh += parseInt(h*g);
	            		gh += parseInt(h*b);
	            		rv += parseInt(v*r);
	            		gv += parseInt(v*g);
	            		bv += parseInt(v*b);
	            	}
	            }
	            r = parseInt(Math.sqrt(rh*rh + rv*rv) / 1.8);
	            g = parseInt(Math.sqrt(gh*gh + gv*gv) / 1.8);
	            b = parseInt(Math.sqrt(bh*bh + bv*bv) / 1.8);
	            
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
