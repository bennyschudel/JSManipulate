/**
 * Applies a fisheye lens distortion effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function LensDistortionFilter(){
	this.name = "Lens Distortion";
	this.defaultValues = {
		refraction : 1.5,
		radius : 50,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		refraction : {min: 1, max: 10},
		radius : {min: 1, max: 200},
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
	  	var refraction = (values.refraction === undefined) ? this.defaultValues.refraction : values.refraction; 
	  	var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
	  	var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
	  	var radius = (values.radius === undefined) ? this.defaultValues.radius : values.radius;  
	  	var radius2 = radius*radius;
	  	var iCenterX = width * centerX; var iCenterY = height * centerY;
	  	var transInverse = function(x,y,out){
			var dx = x-iCenterX;
		  	var dy = y-iCenterY;
		  	var x2 = dx*dx;
			var y2 = dy*dy;
			if (y2 >= (radius2 - (radius2*x2)/radius2)) {
				out[0] = x;
				out[1] = y;
			} else {
				var rRefraction = 1.0 / refraction;
	
				var z = Math.sqrt((1.0 - x2/radius2 - y2/radius2) * radius2);
				var z2 = z*z;
	
				var xAngle = Math.acos(dx / Math.sqrt(x2+z2));
				var angle1 = Math.PI/2 - xAngle;
				var angle2 = Math.asin(Math.sin(angle1)*rRefraction);
				angle2 = Math.PI/2 - xAngle - angle2;
				out[0] = x - Math.tan(angle2)*z;
	
				var yAngle = Math.acos(dy / Math.sqrt(y2+z2));
				angle1 = Math.PI/2 - yAngle;
				angle2 = Math.asin(Math.sin(angle1)*rRefraction);
				angle2 = Math.PI/2 - yAngle - angle2;
				out[1] = y - Math.tan(angle2)*z;
			}
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
