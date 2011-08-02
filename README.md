JSManipulate 
============
JSManipulate is an image filter and effects library written in Javascript for
client-side manipulation of images on a web page.

Version: v1.0 (2011-08-01)

Developed by Joel Besada (http://www.joelb.me)

Demo page: http://www.joelb.me/jsmanipulate

MIT LICENSED (http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2011, Joel Besada

Usage
------

The filters are javascript objects all with a commonly named filter function.
To use any of the filters, you need to input the ImageData object to be manipulated, and any
optional extra parameters taken by the filter. To get the ImageData of an image, 
it needs to first be drawn on an HTML5 canvas object, from which you can use the
getImageData function to retrieve the data.

Here is an example of a common usage scenario:

	var canvas = document.getElementById('#your-canvas-element');
	var context = canvas.getContext("2d");
	
	//Get data for the entire image
	var data = context.getImageData(0,0,canvas.width, canvas.height) 
	
	//Apply a Lens Distortion effect, with 3.0 refraction and a radius of 75.
	//The filter has two more parameters, centerX and centerY, but
	//all filters have default values for every parameter, so we can choose not
	//to specify these, leaving centerX and centerY at the default 0.5 value.
	JSManipulate.lensdistortion.filter(data, {refraction: 3.0, radius: 75}); 

	//Now finally put the data back into the context, which will render
	//the manipulated image on the page.
	context.putImageData(data,0,0);

If you are using any of the separate filters instead, note that you won't have a JSManipulate
object, so to use the filter you will have to create an instance of that specific filter object:
	
	//Instead of JSManipulate.lensdistortion.filter(...);
	new LensDistortionFilter().filter(data, {refraction: 3.0, radius: 75}); 

You can check out all of the filters and their parameters in index.html in the filter list folder


 
