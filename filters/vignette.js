/**
 * Creates a classical vignette effect on the image i.e. darkens the corners.
 */
function VignetteFilter(){
	this.name = "Vignette";
	this.defaultValues = {
		amount : 0.3,
	};
	this.valueRanges = {
		amount : {min:0.0, max:1.0},
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	var outputData = [];
	  	if(values === undefined){ values = this.defaultValues; }
	  	var amount = (values.amount === undefined) ? this.defaultValues.amount : values.amount;
	  	var canvas = document.createElement("canvas");
	  	canvas.width = width;
	  	canvas.height = height;
	  	var context = canvas.getContext("2d");
	  	var gradient;
	  	var radius = Math.sqrt( Math.pow(width/2, 2) + Math.pow(height/2, 2) );
	  	context.putImageData(input,0,0);
  		context.globalCompositeOperation = 'source-over';
  		
        gradient = context.createRadialGradient(width/2, height/2, 0, width/2, height/2, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,' + amount + ')');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        outputData = context.getImageData(0,0,width,height).data;
	    for(var k = 0; k < outputData.length; k++){
  			inputData[k] = outputData[k];
  		}
	}			
}
