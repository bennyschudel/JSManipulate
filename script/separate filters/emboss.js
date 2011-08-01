/**
 * Embosses the image with a simulated light source. 
 * Angle and elevation sets the position of the light.
 */
function EmbossFilter(){
	this.name = "Emboss";
	this.defaultValues = {
		height : 1,
		angle : 135,
		elevation : 30
	};
	this.valueRanges = {
		height : {min:1, max:10},
		angle : {min:0, max:360},
	    elevation : {min:0, max:180}
	};
	this.filter = function(input,values){
		var width = input.width, height = input.height;
	  	var inputData = input.data;
	  	if(values === undefined){ values = this.defaultValues; }
	  	var bumpHeight = (values.height === undefined) ? this.defaultValues.height : values.height;
	  	var angle = (values.angle === undefined) ? this.defaultValues.angle : values.angle;
	  	var elevation = (values.elevation === undefined) ? this.defaultValues.elevation : values.elevation; 
	  	angle = angle / 180 * Math.PI;
	  	elevation = elevation / 180 * Math.PI;
	  	var width45 = 3 * bumpHeight;
	  	var pixelScale = 255.9;
		
		var bumpPixels = [];
		var bumpMapWidth = width;
		var bumpMapHeight = height;
		for(var i = 0; i < inputData.length; i+=4){
			bumpPixels[i/4] = (inputData[i] + inputData[i+1] + inputData[i+2])/3
		}
		var Nx, Ny, Nz, Lx, Ly, Lz, Nz2, NzLz, NdotL;
		var shade, background;
		
		Lx = parseInt(Math.cos(angle) * Math.cos(elevation) * pixelScale);
		Ly = parseInt(Math.sin(angle) * Math.cos(elevation) * pixelScale);
		Lz = parseInt(Math.sin(elevation) * pixelScale);
		
		Nz = parseInt(6 * 255 / width45);
		Nz2 = Nz * Nz;
		NzLz = Nz * Lz;
		background = Lz;

		var bumpIndex = 0;
		
	  	for (var y = 0; y < height; y++, bumpIndex += bumpMapWidth) {
	  		var s1 = bumpIndex;
			var s2 = s1 + bumpMapWidth;
			var s3 = s2 + bumpMapWidth;
	        for (var x = 0; x < width; x++, s1++, s2++, s3++) {
	            var pixel = (y*width + x)*4;
	            if (y != 0 && y < height-2 && x != 0 && x < width-2) {
					Nx = bumpPixels[s1-1] + bumpPixels[s2-1] + bumpPixels[s3-1] - bumpPixels[s1+1] - bumpPixels[s2+1] - bumpPixels[s3+1];
					Ny = bumpPixels[s3-1] + bumpPixels[s3] + bumpPixels[s3+1] - bumpPixels[s1-1] - bumpPixels[s1] - bumpPixels[s1+1];
					if (Nx == 0 && Ny == 0){
						shade = background;
					} else if ((NdotL = Nx*Lx + Ny*Ly + NzLz) < 0){
						shade = 0;
					} else {
						shade = parseInt(NdotL / Math.sqrt(Nx*Nx + Ny*Ny + Nz2));
					}
				} else {
					shade = background;
				}
				inputData[pixel] = inputData[pixel+1] = inputData[pixel+2] = shade;
	        }   
	    }
	}
}
