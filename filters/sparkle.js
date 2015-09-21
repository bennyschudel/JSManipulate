/**
 * Generates a sparkle/sunburst effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function SparkleFilter(){
	this.name = "Sparkle";
	this.defaultValues = {
		rays : 50,
		radius : 25,
		amount : 50,
		randomness : 25,
		centerX : 0.5,
		centerY : 0.5,
	};
	this.valueRanges = {
		rays : {min:1, max:100},
		radius : {min:1, max:200},
		amount : {min:0, max:100},
		randomness : {min:0, max:50},
		centerX : {min:0, max:1.0},
		centerY : {min:0, max:1.0},
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
	  	var rays = (values.rays === undefined) ? this.defaultValues.rays : values.rays;
	  	var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
	  	var randomness = (values.randomness === undefined) ? this.defaultValues.randomness : values.randomness;
	  	var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX;
	  	var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY;
	  	var iCenterX = centerX * width;
	  	var iCenterY = centerY * height;
	  	var rayLengths = [];
	  	for(var i = 0; i < rays; i++){
	  		rayLengths[i]= radius + randomness / 100 * radius * filterUtils.gaussianRandom();
	  	}
	  	for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var pixel = (y*width + x)*4;
	            var dx = x-iCenterX;
	            var dy = y-iCenterY;
	            var distance = dx*dx + dy*dy;
	            var angle = Math.atan2(dy,dx);
	            var d = (angle+Math.PI) / (Math.PI*2) * rays;
	            var i = parseInt(d);
	            var f = d - i;
	            if(radius != 0){
	            	var length = filterUtils.linearInterpolate(f, rayLengths[i % rays], rayLengths[(i+1) % rays]);
	            	var g = length*length / (distance+0.0001);
	            	g = Math.pow(g, (100-amount) / 50);
	            	f -= 0.5;
	            	f = 1 - f*f;
	            	f *= g;
	            }
	            f = filterUtils.clampPixel(f,0,1);
	            var mixedRGB = filterUtils.mixColors(f,[inputData[pixel],inputData[pixel+1],inputData[pixel+2],inputData[pixel+3]],[255,255,255,255]);
	            for(var k = 0; k < 3; k++){
	            	inputData[pixel+k] = mixedRGB[k]; 
	            }
	        }   
	    }
	}			
}
