/*
 * Author: Christian Petry
 * Homepage: www.petry-christian.de
 *
 * License: MIT
 * Copyright (c) 2014 Christian Petry
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */

NMO_FileDrop = new function(){
	window.addEventListener("dragover",function(e){
	  e = e || event;
	  e.preventDefault();
	},false);
	window.addEventListener("drop",function(e){
	  e = e || event;
	  e.preventDefault();
	},false);
	
	this.height_canvas = document.getElementById("height_canvas");
	this.height_image;
	this.picture_above, this.picture_left, this.picture_right, this.picture_below;
	this.container_height = 1200;


	this.handleDragOver = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	};


	// Setup the dnd listeners.
	this.handleFileSelect = function(evt) {
		console.log(evt.target.param);
		if (typeof evt !== 'undefined'){
	    	if (evt.target.param === 'height')
		    	NMO_FileDrop.readImage(evt.target.files[0], "height", ""); // files is a FileList of File objects. List some properties.
			else if (evt.target.param === 'multiple_height')
			{
				for (var i=0; i<evt.target.files.length; i++)
				{
					NMO_FileDrop.readImage(evt.target.files[i], "height", "", NMO_FileDrop.downloadAll, evt.target.files[i].name);
				}
			}
				
				
	    	else
	    		NMO_FileDrop.readImage(evt.target.files[0], "pictures", evt.target.param); // files is a FileList of File objects. List some properties.
		}
	};

  let videoStream = null;
  let autoTimerMode = false;
  let timerId; // Variable to store the timer ID

  let autoPhotoToggle = document.getElementById("autoPhotoToggle");


  autoPhotoToggle.addEventListener("click", function() {
    autoTimerMode = !autoTimerMode;
    if (autoTimerMode) {
        console.log("Auto timer mode is active");
        autoPhotoToggle.classList.add("active");
        // Start the timer to run capturePhoto every 5 seconds
        timerId = setInterval(function() { // Store the interval ID in timerId
            capturePhoto(false);
            console.log('Interval running');
        }, 5000);
    } else {
        console.log("Auto timer mode is inactive");
        autoPhotoToggle.classList.remove("active");
        // Stop the timer using the stored interval ID
        clearInterval(timerId);
    }
  });
    
  async function initializeWebcam() {
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 }, // Request a high resolution to aim for the native resolution
            height: { ideal: 1080 }
          }
        });
        const video = document.createElement('video');
        video.srcObject = videoStream;
        video.play();
        
        // Use the canvas to display the video stream
        const canvas = document.getElementById('height_canvas');
        const ctx = canvas.getContext('2d');
        
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth; // Adjusts to the actual resolution provided
            canvas.height = video.videoHeight;
            drawVideoOnCanvas(video, ctx, canvas.width, canvas.height);
        });
      } catch (error) {
          console.error('Error accessing the camera', error);
      }
  }

  function drawVideoOnCanvas(video, ctx, width, height) {
    // Determine the size of the largest square that can fit inside the video feed
    const squareSize = Math.min(video.videoWidth, video.videoHeight);

    // Calculate the top-left corner of the square in the video feed
    const x = (video.videoWidth - squareSize) / 2;
    const y = (video.videoHeight - squareSize) / 2;

    // Adjust the canvas size to match the square size for a 1:1 aspect ratio
    ctx.canvas.width = squareSize;
    ctx.canvas.height = squareSize;

    // Draw only the central square of the video feed onto the canvas
    ctx.drawImage(video, x, y, squareSize, squareSize, 0, 0, squareSize, squareSize);

    // Continue updating the canvas with the video feed
    requestAnimationFrame(() => drawVideoOnCanvas(video, ctx, squareSize, squareSize));
  }

  function capturePhoto(clicked) {
    console.log('Clicked:', clicked);
    if (videoStream && videoStream.getVideoTracks().length > 0) {
      const videoTrack = videoStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      // Determine the size for the square (use the smaller dimension of the video to ensure a square)
      const squareSize = Math.min(settings.width, settings.height);

      // Create an off-screen canvas
      const offScreenCanvas = document.createElement('canvas');
      offScreenCanvas.width = squareSize; // Adjust canvas size to match the square size
      offScreenCanvas.height = squareSize;

      // Draw the video frame to the off-screen canvas
      const ctx = offScreenCanvas.getContext('2d');
      const offScreenVideo = document.createElement('video');
      offScreenVideo.srcObject = videoStream;
      offScreenVideo.play();

      offScreenVideo.onloadedmetadata = () => {
          // Calculate the top left corner of the square area to capture from the video
          const x = (settings.width - squareSize) / 2;
          const y = (settings.height - squareSize) / 2;

          ctx.drawImage(offScreenVideo, x, y, squareSize, squareSize, 0, 0, squareSize, squareSize);

          // Capture the canvas content as a Blob
          offScreenCanvas.toBlob(function(blob) {
              const file = new File([blob], "captured_image.png", {type: "image/png", lastModified: new Date()});

              // Here you can use the file as needed. For example:
              // - Pass it to a function that handles the file
              NMO_FileDrop.readImage(file, "height", "");

              // - Or download the image directly
              if (clicked) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'captured_image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
          });
      };
  } else {
      console.error('No video stream available');
    }
  }

  // Modify the existing code to add an event listener to the canvas for capturing photos on click
  document.getElementById('height_canvas').addEventListener('click', function() {
    capturePhoto(true);
  });



  window.onload = initializeWebcam;
	
	this.downloadAll = function(name){
		document.getElementById('file_name').value = name + "_normal";
		NMO_Main.downloadImage("NormalMap");
		document.getElementById('file_name').value = name + "_displacement";
		NMO_Main.downloadImage("DisplacementMap");
		document.getElementById('file_name').value = name + "_ambient";
		NMO_Main.downloadImage("AmbientOcclusionMap");
		document.getElementById('file_name').value = name + "_specular";
		NMO_Main.downloadImage("SpecularMap");
	};
	

	this.handleModelFileSelect = function(evt) {
	    var files = evt.target.files; // FileList object
	    NMO_FileDrop.readModelFile(evt.target.files[0]); // files is a FileList of File objects. List some properties.
	}

	this.readModelFile = function(file){
		console.log(file);
		console.log("trying to load model")

		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};
		var onError = function ( xhr ) { };

		var reader = new FileReader();
		reader.onload = function(e){
			// model
			//console.log(e.target.result)
			var data = e.target.result;
			var objLoader = new THREE.OBJLoader();
			var object = objLoader.parse( data );
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = NMO_RenderView.render_model.material;
					NMO_RenderView.customModel = child;
					NMO_RenderView.setModel("Custom");
				}
			} );
		}
		reader.readAsText(file);
		
	};


	this.isPowerOf2 = function(x){
		return ((x != 0) && !(x & (x - 1)))
		/*if((val & -val) == val)
			return true;
		else 
			return false;*/
	};



	this.readImage = function(imgFile, type, direction, readImageCallback=false, name=""){
    if(!imgFile.type.match(/image.*/)){
        console.log("The dropped file is not an image: ", imgFile.type);
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e){
        var data = e.target.result;
        if (imgFile.type == "image/targa"){
            var tga = new TGA();
            tga.load(new Uint8Array(data));
            data = tga.getDataURL('image/png');
        }
        // Ensure the image processing functions handle 1080x1080 images correctly
        if (type === "height")
            NMO_FileDrop.loadHeightmap(data); // Adjust if necessary for 1080x1080
        else if (type === "pictures")
            NMO_FileDrop.loadHeightFromPictures(data, direction); // Adjust if necessary for 1080x1080
        
        if (readImageCallback != false)
            readImageCallback(name); // Ensure callback handles 1080x1080 correctly
    };
    if (imgFile.type == "image/targa")
        reader.readAsArrayBuffer(imgFile);
    else
        reader.readAsDataURL(imgFile);
  };




	this.loadHeightmap = function(source){
		this.height_image = new Image();
				
		this.height_image.onload = function(){
			console.log("loading height image");
						
			NMO_RenderNormalview.renderNormalview_update("height");
			
			NMO_NormalMap.createNormalMap();
			NMO_RenderNormalview.height_map.needsUpdate = true;
			
			NMO_NormalMap.setNormalSetting('strength', document.getElementById('strength_nmb').value);
			NMO_NormalMap.setNormalSetting('level', document.getElementById('level_nmb').value);
			NMO_NormalMap.setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value);
			
			NMO_DisplacementMap.createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
			NMO_DisplacementMap.setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
			
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
			NMO_SpecularMap.createSpecularTexture();
		};

		this.height_image.src = source;
	};




	this.initHeightMap = function(){

		//height_canvas.height = document.getElementById("height_canvas").height;
		this.height_canvas.height = 1080;
		this.height_canvas.width = 1080;
		
	    this.height_image = new Image();
		this.height_image.onload = function () {
			//height_canvas.height = height_image.naturalWidth;
			//height_canvas.width = height_image.naturalHeight;
			var context = self.height_canvas.getContext('2d');

			context.drawImage(this, 0, 0, this.width, this.height, 
								0,0, self.height_canvas.width, self.height_canvas.height);
			this.width = this.naturalWidth;
			this.height = this.naturalHeight;
			
			// document.getElementById("size").value = "" +(this.naturalWidth) + " x " + (this.naturalHeight);
			

			// NMO_FileDrop.initHeightFromPictures();
			NMO_RenderNormalview.renderNormalview_init(); // init only when both types of images are loaded (init)
			NMO_AmbientOccMap.initAOshader();
			NMO_DisplacementMap.initDisplacementshader();
			NMO_SpecularMap.initSpecularshader();
			NMO_RenderNormalview.height_map.needsUpdate = true;
				
			NMO_NormalMap.setNormalSetting('strength', document.getElementById('strength_nmb').value, 'initial');
			NMO_NormalMap.setNormalSetting('level', document.getElementById('level_nmb').value, 'initial');
			NMO_NormalMap.setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value, 'initial');
      NMO_NormalMap.setNormalSetting('mosaic', document.getElementById('dm_mosaic_nmb').checked, 'initial');
			NMO_NormalMap.createNormalMap(); // height map was loaded... so create standard normal map!

			
			NMO_DisplacementMap.createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
			NMO_DisplacementMap.setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
			
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
			NMO_SpecularMap.createSpecularTexture();


	    };
		
	    this.height_image.src = './images/standard_height.png';	
	};




	this.loadHeightFromPictures = function(source, direction){
		var pic_canvas_above = document.getElementById("picture_canvas_above");
		var pic_canvas_left = document.getElementById("picture_canvas_left");
		var pic_canvas_right = document.getElementById("picture_canvas_right");
		var pic_canvas_below = document.getElementById("picture_canvas_below");
		var context_above = pic_canvas_above.getContext('2d');
		var context_left = pic_canvas_left.getContext('2d');
		var context_right = pic_canvas_right.getContext('2d');
		var context_below = pic_canvas_below.getContext('2d');
		//console.log("loading picture image");

		if(direction == "above"){
			this.picture_above = new Image();
			this.picture_above.onload = function () {	
				context_above.drawImage(this, 0, 0, this.width, this.height,
										 0,0, pic_canvas_above.width, pic_canvas_above.height);
				this.width = this.naturalWidth;
				this.height = this.naturalHeight;
			};

			this.picture_above.src = source;
		}
	    else if (direction == "left"){
	    	this.picture_left = new Image();
			this.picture_left.onload = function () {	
				context_left.drawImage(this, 0, 0, this.width, this.height,
										0,0, pic_canvas_left.width, pic_canvas_left.height);
				this.width = this.naturalWidth;
				this.height = this.naturalHeight;
		    };
			
		    this.picture_left.src = source;
		}
	    else if (direction == "right"){
		    this.picture_right = new Image();
			this.picture_right.onload = function () {	
				context_right.drawImage(this, 0, 0, this.width, this.height,
										0,0, pic_canvas_right.width, pic_canvas_right.height);
				this.width = this.naturalWidth;
				this.height = this.naturalHeight;
		    };
			
		    this.picture_right.src = source;	
		}
	    else if (direction == "below"){
		    this.picture_below = new Image();
			this.picture_below.onload = function () {	
				context_below.drawImage(this, 0, 0, this.width, this.height,
										0,0, pic_canvas_below.width, pic_canvas_below.height);
				this.width = this.naturalWidth;
				this.height = this.naturalHeight;
		    };
			
		    this.picture_below.src = source;
		}

		NMO_RenderNormalview.renderNormalview_update("pictures");
		NMO_NormalMap.createNormalMap();
		NMO_RenderNormalview.renderNormalToHeight();
	};



	// gets called inside initHeightMap!
	// this.initHeightFromPictures = function(){
		
	// 	var pic_canvas_above = document.getElementById("picture_canvas_above");
	// 	var pic_canvas_left = document.getElementById("picture_canvas_left");
	// 	var pic_canvas_right = document.getElementById("picture_canvas_right");
	// 	var pic_canvas_below = document.getElementById("picture_canvas_below");
	// 	var context_above = pic_canvas_above.getContext('2d');
	// 	var context_left = pic_canvas_left.getContext('2d');
	// 	var context_right = pic_canvas_right.getContext('2d');
	// 	var context_below = pic_canvas_below.getContext('2d');
		
	//     this.picture_above = new Image();
	// 	this.picture_above.onload = function () {	
	// 		context_above.drawImage(this, 0, 0, this.width, this.height,
	// 								0,0, pic_canvas_above.width, pic_canvas_above.height);
	// 		this.width = this.naturalWidth;
	// 		this.height = this.naturalHeight;

	// 		//NMO_NormalMap.createNormalMap(); // height map was loaded... so create standard normal map!
		
	// 		NMO_RenderNormalview.picture_above_map.needsUpdate = true;
			
	//     };
		
	//     this.picture_left = new Image();
	// 	this.picture_left.onload = function () {	
	// 		context_left.drawImage(this, 0, 0, this.width, this.height,
	// 								0,0, pic_canvas_left.width, pic_canvas_left.height);
	// 		this.width = this.naturalWidth;
	// 		this.height = this.naturalHeight;

	// 		NMO_RenderNormalview.picture_left_map.needsUpdate = true;
	//     };
		

	//     this.picture_right = new Image();
	// 	this.picture_right.onload = function () {	
	// 		context_right.drawImage(this, 0, 0, this.width, this.height,
	// 								0,0, pic_canvas_right.width, pic_canvas_right.height);
	// 		this.width = this.naturalWidth;
	// 		this.height = this.naturalHeight;

	// 		NMO_RenderNormalview.picture_right_map.needsUpdate = true;
	//     };
		

	//     this.picture_below = new Image();
	// 	this.picture_below.onload = function () {	
	// 		context_below.drawImage(this, 0, 0, this.width, this.height,
	// 								0,0, pic_canvas_below.width, pic_canvas_below.height);
	// 		this.width = this.naturalWidth;
	// 		this.height = this.naturalHeight;

	// 		NMO_RenderNormalview.picture_below_map.needsUpdate = true;
	// 		//NMO_RenderNormalview.renderNormalToHeight(); // when the last one was loaded
	//     };
		
	// 	this.picture_above.src = './images/default_picture_above.jpg';
	//     this.picture_left.src  = './images/default_picture_left.jpg';
	//     this.picture_right.src = './images/default_picture_right.jpg';	
	//     this.picture_below.src = './images/default_picture_below.jpg';

	// };
}

document.getElementById('select_file_height').param = "height";
// document.getElementById('select_file_above').param = "above";
// document.getElementById('select_file_left').param = "left";
// document.getElementById('select_file_right').param = "right";
// document.getElementById('select_file_below').param = "below";
// document.getElementById('select_multiple_height_files').param = "multiple_height";
document.getElementById('select_file_height').addEventListener('change', NMO_FileDrop.handleFileSelect, false);
// document.getElementById('select_file_above').addEventListener('change', NMO_FileDrop.handleFileSelect, false);
// document.getElementById('select_file_left').addEventListener('change', NMO_FileDrop.handleFileSelect, false);
// document.getElementById('select_file_right').addEventListener('change', NMO_FileDrop.handleFileSelect, false);
// document.getElementById('select_file_below').addEventListener('change', NMO_FileDrop.handleFileSelect, false);
// document.getElementById('select_multiple_height_files').addEventListener('change', NMO_FileDrop.handleFileSelect, false);

document.getElementById("height_map").addEventListener("dragover", function(e) {e.preventDefault();}, true);
document.getElementById("height_map").addEventListener("drop", function(e){
	//console.log("height");
	e.preventDefault(); 
	NMO_FileDrop.readImage(e.dataTransfer.files[0], "height", "");
}, true);

// document.getElementById("picture_above_drop").addEventListener("dragover", function(e) {e.preventDefault();}, true);
// document.getElementById("picture_above_drop").addEventListener("drop", function(e){
// 	//console.log("above");
// 	e.preventDefault(); 
// 	NMO_FileDrop.readImage(e.dataTransfer.files[0], "pictures", "above");
// }, true);

// document.getElementById("picture_left_drop").addEventListener("dragover", function(e) {e.preventDefault();}, true);
// document.getElementById("picture_left_drop").addEventListener("drop", function(e){
// 	e.preventDefault(); 
// 	NMO_FileDrop.readImage(e.dataTransfer.files[0], "pictures", "left");
// }, true);

// document.getElementById("picture_right_drop").addEventListener("dragover", function(e) {e.preventDefault();}, true);
// document.getElementById("picture_right_drop").addEventListener("drop", function(e){
// 	e.preventDefault(); 
// 	NMO_FileDrop.readImage(e.dataTransfer.files[0], "pictures", "right");
// }, true);

// document.getElementById("picture_below_drop").addEventListener("dragover", function(e) {e.preventDefault();}, true);
// document.getElementById("picture_below_drop").addEventListener("drop", function(e){
// 	e.preventDefault(); 
// 	NMO_FileDrop.readImage(e.dataTransfer.files[0], "pictures", "below");
// }, true);


document.getElementById('select_model_file').addEventListener('change', NMO_FileDrop.handleModelFileSelect, false);
