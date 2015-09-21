/**
 * Pinches and whirls the image toward the center point. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function PinchFilter(){
	this.name = "Pinch/Whirl";
	this.defaultValues = {
		amount : 0.5,
		radius : 100,
		angle : 0,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		amount : {min: -1.0, max: 1.0},
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
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount; 
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
		  	if(distance > radius2 || distance == 0){
		  		out[0] = x;
		  		out[1] = y;
		  	} else {
		  		var d = Math.sqrt( distance / radius2 );
				var t = Math.pow( Math.sin( Math.PI*0.5 * d ), -amount);
	
				dx *= t;
				dy *= t;
	
				var e = 1 - d;
				var a = angle * e * e;
	
				var s = Math.sin(a);
				var c = Math.cos(a);
	
				out[0] = iCenterX + c*dx - s*dy;
				out[1] = iCenterY + s*dx + c*dy;
		  	}
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
