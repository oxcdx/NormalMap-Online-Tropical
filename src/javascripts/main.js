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

//console.log("Warnings are disabled!");
//console.warn = function() {};

NMO_FileDrop.initHeightMap();
NMO_RenderView.initRenderer();

var NMO_Main = new function(){
	this.TextureEnum = {
	    NORMAL : 0,
	    DISPLACEMENT : 1,
	    AMBIENT : 2,
	    SPECULAR : 3
	}

	this.auto_update = true;
	this.current_texture = this.TextureEnum.NORMAL;
	this.normal_map_mode = "height";
	this.download_btn = document.getElementById('download');
	this.download_all_btn = document.getElementById('download_all');
	this.download_normal_map_ox = document.getElementById('normal_map');


	this.activate_height_tab = function(type){
		this.normal_map_mode = type;
		if (type == "height"){
			document.getElementById('tab_btn_heightmap').disabled = true;
			document.getElementById('tab_btn_pictures').disabled = false;
			$('#pictures_map').hide("slide", {direction: "right"}, 400, function() {
				NMO_RenderNormalview.reinitializeShader("height");
				NMO_RenderNormalview.renderNormalview_update("height");
				NMO_NormalMap.createNormalMap();
				NMO_Main.setTexturePreview(NMO_NormalMap.normal_canvas, "normal_img", NMO_NormalMap.normal_canvas.width, NMO_NormalMap.normal_canvas.height);
				NMO_DisplacementMap.createDisplacementMap();
				NMO_AmbientOccMap.createAmbientOcclusionTexture();
				NMO_SpecularMap.createSpecularTexture();
				$('#height_map').show("slide", {direction: "left"}, 400);
			});
		}
		else if (type == "pictures"){
			document.getElementById('tab_btn_pictures').disabled = true;
			document.getElementById('tab_btn_heightmap').disabled = false;
			$('#height_map').hide("slide", {direction: "left"}, 400, function() {
				NMO_RenderNormalview.reinitializeShader("pictures");
				NMO_RenderNormalview.renderNormalview_update("pictures");
				NMO_NormalMap.createNormalMap();
				NMO_Main.setTexturePreview(NMO_NormalMap.normal_canvas, "normal_img", NMO_NormalMap.normal_canvas.width, NMO_NormalMap.normal_canvas.height);
				NMO_RenderNormalview.renderNormalToHeight(); // when the last one was loaded
				NMO_DisplacementMap.createDisplacementMap();
				NMO_AmbientOccMap.createAmbientOcclusionTexture();
				NMO_SpecularMap.createSpecularTexture();
				$('#pictures_map').show("slide", {direction: "right"}, 400);
			});
		}
	}

	this.activate_texture = function(type){
		if (type == "normal"){
			document.getElementById('tab_btn_normal').disabled = true;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = false;
			//console.log("normal!");
			document.getElementById('normal_map').style.cssText = "";
			document.getElementById('normal_settings').style.cssText = "";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";
			
			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "NormalMap";
			this.current_texture = this.TextureEnum.NORMAL;
		}
		
		else if (type == "displace"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = true;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = false;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "";
			document.getElementById('displacement_settings').style.cssText = "";
			
			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "DisplacementMap";
			this.current_texture = this.TextureEnum.DISPLACEMENT;
			//console.log("displace!");
		}
		else if (type == "ao"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = true;
			document.getElementById('tab_btn_specular').disabled = false;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";
			
			document.getElementById('ao_map').style.cssText = "";
			document.getElementById('ao_settings').style.cssText = "";

			document.getElementById('specular_map').style.cssText = "display: none;";
			document.getElementById('specular_settings').style.cssText = "display: none;";

			document.getElementById('file_name').placeholder = "AmbientOcclusionMap";
			this.current_texture = this.TextureEnum.AMBIENT;
			//console.log("displace!");
		}
		else if (type == "specular"){
			document.getElementById('tab_btn_normal').disabled = false;
			document.getElementById('tab_btn_displace').disabled = false;
			document.getElementById('tab_btn_ao').disabled = false;
			document.getElementById('tab_btn_specular').disabled = true;
			
			document.getElementById('normal_map').style.cssText = "display: none;";
			document.getElementById('normal_settings').style.cssText = "display: none;";
			
			document.getElementById('displacement_map').style.cssText = "display: none;";
			document.getElementById('displacement_settings').style.cssText = "display: none;";

			document.getElementById('ao_map').style.cssText = "display: none;";
			document.getElementById('ao_settings').style.cssText = "display: none;";
			
			document.getElementById('specular_map').style.cssText = "";
			document.getElementById('specular_settings').style.cssText = "";

			document.getElementById('file_name').placeholder = "SpecularMap";
			this.current_texture = this.TextureEnum.SPECULAR;
			//console.log("displace!");
		}
	}


	this.setTexturePreview = function(canvas, img_id, width, height){
		var img = document.getElementById(img_id);

		//canvas.width = width;
		//canvas.height = height;

		//console.log(img_id + ": " + width);		

		img.getContext('2d').clearRect ( 0 , 0 , img.width, img.height );

			
		var ratio = width / height;
		var draw_width = ratio >= 1 ? NMO_FileDrop.container_height : (NMO_FileDrop.container_height * ratio );
		var draw_height = ratio >= 1 ? (NMO_FileDrop.container_height / ratio ) : NMO_FileDrop.container_height;
		
		var reduce_canvas = document.createElement('canvas');
		var helper_canvas = document.createElement('canvas');
		helper_canvas.width = width;
		helper_canvas.height = height;
		reduce_canvas.width = width;
		reduce_canvas.height = height;

		var current_width = width;
		var current_height = height;
		var reduce_context = reduce_canvas.getContext('2d');
		var helper_context = helper_canvas.getContext('2d');
		reduce_context.clearRect(0,0,reduce_context.width, reduce_context.height);
		reduce_context.drawImage(canvas, 0, 0, width, height);
		helper_context.clearRect(0,0,helper_canvas.width, helper_canvas.height);
		helper_context.drawImage(canvas, 0, 0, width, height);
		while(2*draw_width < current_width && 2*draw_height < current_height ){
			//console.log("redraw!");
			helper_context.clearRect(0, 0, helper_canvas.width, helper_canvas.height);
			helper_context.drawImage(reduce_canvas, 0, 0, reduce_canvas.width, reduce_canvas.height);
			reduce_context.clearRect(0, 0, reduce_canvas.width, reduce_canvas.height);
			reduce_context.drawImage(helper_canvas, 0, 0, reduce_canvas.width * 0.5, reduce_canvas.height * 0.5);
			current_width *= 0.5;
			current_height *= 0.5;
		}

		//console.log(draw_width + ", " + draw_height)
		img.height = draw_height;
		img.width = draw_width;
		img.getContext('2d').drawImage(reduce_canvas, 0, 0, current_width, current_height, 0,0, draw_width, draw_height);
		
		if (canvas == NMO_NormalMap.normal_canvas)
			NMO_RenderView.normal_map.needsUpdate = true;
		else if (canvas == NMO_DisplacementMap.displacement_canvas)
			NMO_RenderView.displacement_map.needsUpdate = true;
		else if (canvas == NMO_AmbientOccMap.ao_canvas)
			NMO_RenderView.ao_map.needsUpdate = true;
		else if (canvas == NMO_SpecularMap.specular_canvas)
			NMO_RenderView.specular_map.needsUpdate = true;
		
	}

	this.toggle_height_column = function(){

		if ($("#column_height").is(":visible") == true) {
			$("#column_btn_left_div").html("<<");
			$("#column_height").hide("slide", {direction: "right"}, 400);
				/*$(".column").each(function () {
	    		$(this).css("width", "438px");
				});
				$(".preview_img").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				$(".view").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				$(".helper").each(function () {
		    		$(this).css("max-width", "400px");
		    		$(this).css("max-height", "400px");
				});
				container_height = 400;
				updateCurrentTexture();
				renderer.setSize( 400, 400 );*/
		}
		else{
			$("#column_btn_left_div").html(">>");			
			$("#column_height").show("slide", {direction: "right"}, 400);
		}
	}

	this.toggle_preview_column = function(){

		if ($("#preview").is(":visible") == true) {
			$("#column_btn_right_div").html(">>");
			$("#preview").hide("slide", {direction: "left"}, 400);				
		}
		else{
			$("#column_btn_right_div").html("<<");
			$("#preview").show("slide", {direction: "left"}, 400);
		}
	}

	this.getImageType = function(){
		var select_file_type = document.getElementById('file_type');
		var file_type = select_file_type.options[select_file_type.selectedIndex].value;
		return file_type;
	};

	this.switchJPGQual = function(){
		if (this.getImageType() != 'jpg'){
			document.getElementById('file_jpg_qual').style.cssText = "display: none;";
			document.getElementById('total_transparency').style.cssText = "font-size:11px;";
		}
		else{
			document.getElementById('total_transparency').style.cssText = "display: none;";	
			document.getElementById('file_jpg_qual').style.cssText = "font-size:11px;";
		}
	};


	this.toggleAutoUpdate = function(){
		this.auto_update = !this.auto_update;
		
		if (this.auto_update)
			NMO_NormalMap.createNormalMap();
			NMO_DisplacementMap.createDisplacementMap();
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
			NMO_SpecularMap.createSpecularTexture();
	};

	this.updateCurrentTexture = function(){
		if (this.current_texture == TextureEnum.NORMAL)
			NMO_NormalMap.createNormalMap();
		else if (this.current_texture == TextureEnum.DISPLACEMENT)
			NMO_DisplacementMap.createDisplacementMap();
		else if (this.current_texture == TextureEnum.AMBIENT)
			NMO_AmbientOccMap.createAmbientOcclusionTexture();
		else if (this.current_texture == TextureEnum.SPECULAR)
			NMO_SpecularMap.createSpecularTexture();
	};


  function formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // JS months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

	this.download_all_btn.addEventListener('click', function (e) {		
    // Prompt user for custom title
    const customTitle = prompt("Enter a custom title for the file:", "CustomTitle_");
    if (customTitle === null) return; // User pressed cancel, exit the function

    // Generate a timestamp string
    const timestamp = formatTimestamp(new Date());

    // Get the current value of the #dm_strength_slider
    const sliderValue = document.getElementById('dm_strength_slider').value;

    // Append the custom title, timestamp, and slider value to each image title in the downloadImage function calls
    NMO_Main.downloadImage("NormalMap", customTitle + "_NormalMap_" + timestamp + "_" + "displacement_" + sliderValue);
    NMO_Main.downloadImage("DisplacementMap", customTitle + "_DisplacementMap_" + timestamp + "_" + "displacement_" + sliderValue);
    NMO_Main.downloadImage("AmbientOcclusionMap", customTitle + "_AmbientOcclusionMap_" + timestamp + "_" + "displacement_" + sliderValue);
    NMO_Main.downloadImage("SpecularMap", customTitle + "_SpecularMap_" + timestamp + "_" + "displacement_" + sliderValue);
  });

  this.download_normal_map_ox.addEventListener('click', function (e) {		
    // Prompt user for custom title
    const customTitle = prompt("Enter a custom title for the file:", "CustomTitle_");
    if (customTitle === null) return; // User pressed cancel, exit the function

    // Generate a timestamp string
    const timestamp = formatTimestamp(new Date());

    // Get the current value of the #dm_strength_slider
    const sliderValue = document.getElementById('dm_strength_slider').value;

    // Append the custom title, timestamp, and slider value to each image title in the downloadImage function calls
    const t1 = customTitle + "_NormalMap_" + timestamp + "_" + "displacement_" + sliderValue;
    const t2 = customTitle + "_DisplacementMap_" + timestamp + "_" + "displacement_" + sliderValue;
    const t3 = customTitle + "_AmbientOcclusionMap_" + timestamp + "_" + "displacement_" + sliderValue;
    const t4 = customTitle + "_SpecularMap_" + timestamp + "_" + "displacement_" + sliderValue;
    
    // NMO_Main.downloadImage("NormalMap", t1);
    // NMO_Main.downloadImage("DisplacementMap", t2);
    // NMO_Main.downloadImage("AmbientOcclusionMap", t3);
    // NMO_Main.downloadImage("SpecularMap", t4);
    const objBlob = NMO_RenderView.returnOBJBlob();
    
    NMO_Main.zipDownloadImagesAndObj(["NormalMap", "DisplacementMap", "AmbientOcclusionMap", "SpecularMap"], [t1, t2, t3, t4], objBlob);

   

    // NMO_RenderView.exportModelObj(
    //   customTitle + "_Model_" + timestamp + "_" + "displacement_" + sliderValue,
    //   t1, t2, t3, t4, sliderValue
    // );


  });
	
	this.download_btn.addEventListener('click', function (e) {		
		if (document.getElementById('normal_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("NormalMap");
		}
		else if (document.getElementById('displacement_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("DisplacementMap");
		}
		else if (document.getElementById('ao_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("AmbientOcclusionMap");
		}
		else if (document.getElementById('specular_map').style.cssText != "display: none;"){
			NMO_Main.downloadImage("SpecularMap");
		}		
	});
	
	
	this.downloadImage = function(type, oxTitle){
		// console.log("Downloading image");
		var qual = 0.9;
		var file_name = "download";
		var canvas = document.createElement("canvas");
		
		var file_type = NMO_Main.getImageType();
		var image_type = "image/png";
		if (file_type == "jpg")
			image_type = "image/jpeg";

		if (type == "NormalMap"){
			canvas.width = NMO_NormalMap.normal_canvas.width;
			canvas.height = NMO_NormalMap.normal_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_NormalMap.normal_canvas,0,0);
			file_name=oxTitle ? oxTitle : "NormalMap";
		}
		else if (type == "DisplacementMap"){
			canvas.width = NMO_DisplacementMap.displacement_canvas.width;
			canvas.height = NMO_DisplacementMap.displacement_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_DisplacementMap.displacement_canvas,0,0);
			file_name=oxTitle ? oxTitle : "DisplacementMap";
		}
		else if (type == "AmbientOcclusionMap"){
			canvas.width = NMO_AmbientOccMap.ao_canvas.width;
			canvas.height = NMO_AmbientOccMap.ao_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_AmbientOccMap.ao_canvas,0,0);
			file_name=oxTitle ? oxTitle : "AmbientOcclusionMap";
		}
		else if (type == "SpecularMap"){
			canvas.width = NMO_SpecularMap.specular_canvas.width;
			canvas.height = NMO_SpecularMap.specular_canvas.height;
			var context = canvas.getContext('2d');
			if (file_type == "png") 
				context.globalAlpha = $('#transparency_nmb').val() / 100;
			context.drawImage(NMO_SpecularMap.specular_canvas,0,0);
			file_name=oxTitle ? oxTitle : "SpecularMap";
		}
		
		if (document.getElementById('file_name').value != "")
			file_name = document.getElementById('file_name').value;
		
		
			
		var qual = $('#file_jpg_qual_nmb').val() / 100;
		if (file_type == "tiff"){
			CanvasToTIFF.toBlob(canvas, function(blob) {
   				saveAs(blob, file_name + ".tif");
		    });
		}
		else{
			canvas.toBlob(function(blob) {
	    		saveAs(blob, file_name + "." + file_type);
			}, image_type, qual);
		}
	}

  this.zipDownloadImagesAndObj = async function(
    types, oxTitles, objBlob
  ) {
    console.log(new JSZip);
    console.log(new window.JSZip); 
    
    var qual = 0.9;
    var canvas = document.createElement("canvas");
    // var JSZip = new JSZip(); // Assuming JSZip is already included in your project
    var zipx = new window.JSZip(); 

    // a string for the mtl file
    var mtlString = [
      "newmtl dispMaterial",
      "Ka 1.000 1.000 1.000  # Ambient color",
      "Kd 0.200 0.200 0.200  # Diffuse color",
      "Ks 0.000 0.000 0.000  # Specular color",
      "Ns 0.100              # Shininess",
      "d 1.0                 # Opacity (d is for dissolve)",
      "illum 2               # Illumination model (2 is for specular highlights)"
    ].join('\n');

    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let oxTitle = oxTitles[i];
      let file_name = "download";
      var file_type = NMO_Main.getImageType();
      let image_type = "image/jpeg";
      if (file_type == "jpg") image_type = "image/jpeg";

      // Set canvas dimensions and draw the image based on the type
      if (type == "NormalMap"){
        canvas.width = NMO_NormalMap.normal_canvas.width;
        canvas.height = NMO_NormalMap.normal_canvas.height;
        var context = canvas.getContext('2d');
        if (file_type == "png") 
          context.globalAlpha = $('#transparency_nmb').val() / 100;
        context.drawImage(NMO_NormalMap.normal_canvas,0,0);
        file_name=oxTitle ? oxTitle : "NormalMap";
        // Add the normal map to the mtl file
        mtlString += `\nmap_normal ${file_name}.jpg\n`;
        console.log("is a normal map");
      }
      else if (type == "DisplacementMap"){
        canvas.width = NMO_DisplacementMap.displacement_canvas.width;
        canvas.height = NMO_DisplacementMap.displacement_canvas.height;
        var context = canvas.getContext('2d');
        if (file_type == "png") 
          context.globalAlpha = $('#transparency_nmb').val() / 100;
        context.drawImage(NMO_DisplacementMap.displacement_canvas,0,0);
        file_name=oxTitle ? oxTitle : "DisplacementMap";
        // Add the displacement map to the mtl file
        mtlString += `map_bump ${file_name}.jpg\n`;
        console.log("is a displacement map");
      }
      else if (type == "AmbientOcclusionMap"){
        canvas.width = NMO_AmbientOccMap.ao_canvas.width;
        canvas.height = NMO_AmbientOccMap.ao_canvas.height;
        var context = canvas.getContext('2d');
        if (file_type == "png") 
          context.globalAlpha = $('#transparency_nmb').val() / 100;
        context.drawImage(NMO_AmbientOccMap.ao_canvas,0,0);
        file_name=oxTitle ? oxTitle : "AmbientOcclusionMap";
        // Add the ambient occlusion map to the mtl file
        mtlString += `map_Ka ${file_name}.jpg\n`;
      }
      else if (type == "SpecularMap"){
        canvas.width = NMO_SpecularMap.specular_canvas.width;
        canvas.height = NMO_SpecularMap.specular_canvas.height;
        var context = canvas.getContext('2d');
        if (file_type == "png") 
          context.globalAlpha = $('#transparency_nmb').val() / 100;
        context.drawImage(NMO_SpecularMap.specular_canvas,0,0);
        file_name=oxTitle ? oxTitle : "SpecularMap";
        // Add the specular map to the mtl file
        mtlString += `map_Ks ${file_name}.jpg\n`;
      }

      var context = canvas.getContext('2d');
      if (file_type == "png") context.globalAlpha = $('#transparency_nmb').val() / 100;
      file_name = oxTitle || type;

      if (document.getElementById('file_name').value != "") file_name = document.getElementById('file_name').value;

      var qual = $('#file_jpg_qual_nmb').val() / 100;

      // Convert canvas to Blob and add to zip
      await new Promise(resolve => {
        if (file_type == "tiff") {
          CanvasToTIFF.toBlob(canvas, function(blob) {
            zipx.file(file_name + ".tif", blob);
            resolve();
          });
        } else {
          canvas.toBlob(function(blob) {
            zipx.file(file_name + "." + file_type, blob);
            resolve();
          }, image_type, qual);
        }
      });
    }


    const newMtlFileName = oxTitles[0].replace('_NormalMap_', '_Model_') + '.mtl';
    // set the mtl file contents and add it to the zip
    zipx.file(newMtlFileName, mtlString);

    // add the mtllib line to the objBlob
    const newMtlLine = 'mtllib ' + newMtlFileName;
    const newMtlLine1 = 'usemtl dispMaterial';
    const objString = await objBlob.text();
    const lines = objString.split('\n');

    if (lines[0].startsWith('o')) {
        lines[0] = 'o dispPlane' + lines[0].substring(1);
    } else {
        lines.unshift('o dispPlane');
    }

    const newObjString = lines.join('\n');

    const objStringWithMtlInjected = newMtlLine + '\n' + newMtlLine1 + '\n' + newObjString;
    const objBlobWithMtl = new Blob([objStringWithMtlInjected], {type: 'text/plain'});



    // Add the OBJ file to the zip
    // title can be t1 but replace '_NormalMap_' with '_Model_
    const objFileName = oxTitles[0].replace('_NormalMap_', '_Model_');
    zipx.file(objFileName + ".obj", objBlobWithMtl);

    // Generate the zip file and trigger download
    zipx.generateAsync({type:"blob"}).then(function(content) {
      saveAs(content, "images.zip");
      // also dowload the displacement map .jpg

      const timestamp = formatTimestamp(new Date());
      
      NMO_Main.downloadImage("DisplacementMap", "customTitle" + "_DisplacementMap_" + timestamp + "_" + "displacement");
    });
  };
}

//
 // Function to toggle visibility
 function toggleVisibility(event) {
  event.preventDefault(); // Prevent the default context menu

  // Toggle visibility of both maps
  const normalMap = document.getElementById('normal_map');
  const displacementMap = document.getElementById('displacement_map');

  normalMap.classList.toggle('d-none');
  displacementMap.classList.toggle('d-none');
}

// Attach event listeners
document.getElementById('normal_map').addEventListener('contextmenu', toggleVisibility);
document.getElementById('displacement_map').addEventListener('contextmenu', toggleVisibility);
