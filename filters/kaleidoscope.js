/**
 * Creates a kaleidoscope effect on the image. CenterX and CenterY specify the
 * position in terms of ratios of width and height.
 */
function KaleidoscopeFilter(){
	this.name = "Kaleidoscope";
	this.defaultValues = {
		angle : 0,
		rotation : 0,
		sides : 3,
		centerX : 0.5,
		centerY : 0.5
	};
	this.valueRanges = {
		angle : {min: 0, max: 360},
		rotation : {min: 0, max: 360},
		sides : {min: 1, max: 30},
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
	  	var rotation = (values.rotation === undefined) ? this.defaultValues.rotation : values.rotation; 
	  	var sides = (values.sides === undefined) ? this.defaultValues.sides : values.sides; 
	  	var centerX = (values.centerX === undefined) ? this.defaultValues.centerX : values.centerX; 
	  	var centerY = (values.centerY === undefined) ? this.defaultValues.centerY : values.centerY; 
	  	var iCenterX = width * centerX; var iCenterY = height * centerY;
	  	angle = angle/180 * Math.PI;
	  	rotation = rotation/180 * Math.PI;
	  	var transInverse = function(x,y,out){
	  		var dx = x - iCenterX;
	  		var dy = y - iCenterY;
	  		var r = Math.sqrt(dx*dx + dy*dy);
	  		var theta = Math.atan2(dy,dx) - angle - rotation;
	  		theta = filterUtils.triangle(theta/Math.PI*sides*0.5);
	  		theta += angle;
	  		out[0] = iCenterX + r*Math.cos(theta);
	  		out[1] = iCenterY + r*Math.sin(theta);
		}
		filterUtils.transformFilter(inputData,transInverse,width,height);
    }
}
