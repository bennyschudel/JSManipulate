/**
 * Produces a water ripple/waves on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function WaterRippleFilter(){
	this.name = "Water Ripples";
	this.defaultValues = {
		phase : 0,
		radius : 50,
		wavelength : 16,
		amplitude : 10,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		phase : {min: 0, max: 100},
		radius : {min: 1, max: 200},
		wavelength : {min: 1, max: 100},
		amplitude : {min: 1, max: 100},
		centerX : {min: 0.0, max:1.0},
		centerY : {min: 0.0, max:1.0}
	};
	if(!FilterUtils){
		if(console){
			console.error("Unable to find filterutils.js, please include this file! (Required by " + this.name + " filter)");
		}
		return;
	}
	var filterUtils = new FilterUtils();
	
	this.filter = function (input, values){
	  	var width = input.width, height = input.height;
	 	var inputData = input.data;
	 	if(values === undefined){ values = this.defaultValues; }
	  	var wavelength = (values.wavelength === undefined) ? this.defaultValues.wavelength : values.wavelength; 
	  	var amplitude = (values.amplitude === undefined) ? this.defaultValues.amplitude : values.amplitude; 
	  	var phase = (values.phase === undefined) ? this.defaultValues.phase : values.phase; 
	  	var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
	  	var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
	  	var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
	  	var radius2 = radius*radius;
	  	var iCenterX = width * centerX; var iCenterY = height * centerY;
	  	var transInverse = function(x,y,out){
			var dx = x-iCenterX;
		  	var dy = y-iCenterY;
		  	var distance2 = dx*dx + dy*dy;
		  	if(distance2 > radius2){
		  		out[0] = x;
		  		out[1] = y;
		  	} else {
		  		var distance = Math.sqrt(distance2);
		  		var amount = amplitude * Math.sin(distance/wavelength * Math.PI * 2 - phase);
		  		amount *= (radius-distance)/radius;
		  		if(distance != 0){
		  			amount *= wavelength/distance;
		  		}
		  		out[0] = x + dx*amount;
		  		out[1] = y + dy*amount;
		  	}
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
