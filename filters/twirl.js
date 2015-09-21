/**
 * Twists the image around a given center point. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function TwirlFilter(){
	this.name = "Twirl";
	this.defaultValues = {
		radius : 100,
		angle : 180,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		radius : {min: 1, max: 200},
		angle : {min: 0, max: 360},
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
	  	var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle; 
	  	var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
	  	var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
	  	var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
	  	var radius2 = radius*radius;
	  	angle = angle/180 * Math.PI;
	  	var iCenterX = width * centerX; var iCenterY = height * centerY;
	  	var transInverse = function(x,y,out){
			var dx = x-iCenterX;
		  	var dy = y-iCenterY;
		  	var distance = dx*dx + dy*dy;
		  	if(distance > radius2){
		  		out[0] = x;
		  		out[1] = y;
		  	} else {
		  		distance = Math.sqrt(distance);
		  		var a = Math.atan2(dy, dx) + angle * (radius-distance) / radius;
		  		out[0] = iCenterX + distance*Math.cos(a);
		  		out[1] = iCenterY + distance*Math.sin(a);
		  	}
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
