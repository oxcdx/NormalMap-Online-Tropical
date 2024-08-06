import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSG } from 'three-csg-ts';
// add GUI
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';


// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: use soft shadows




document.body.appendChild(renderer.domElement);

// simulate a desert sky background with a sphere and gradient
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);

// Create a gradient for the sky
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
const context = canvas.getContext('2d');
const gradient = context.createRadialGradient(
  canvas.width / 2, canvas.height / 2, 0, // Inner circle (center)
  canvas.width / 2, canvas.height / 2, canvas.width / 2 // Outer circle (edge)
);
gradient.addColorStop(0, '#87CEEB'); // Sky blue
gradient.addColorStop(1, '#FFD700'); // Desert yellow
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

const skyMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.CanvasTexture(canvas),
  side: THREE.BackSide // Render the inside of the sphere
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);


// // Add a light source
// const light = new THREE.PointLight( 0xffffff, 1.5, 0, 0 );
// light.position.z = 2;
// light.position.x = 2;
// light.position.y = 5;
// scene.add(light);

// Add an ambient light
const light2 = new THREE.AmbientLight(0xffffff, .2);
light2.position.z = 2;
light2.position.x = -2;
light2.position.y = 15;
scene.add(light2);


// const pointLight2 = new THREE.PointLight( 0xffffff, 3, 0, 0 );
// camera.add( pointLight2 );

// Create a directional light to simulate sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(-7, 30, 10); // Position the light
sunLight.castShadow = true; // Enable shadows for the light

// Adjust shadow properties for better quality
sunLight.shadow.mapSize.width = 2048; // Increase shadow map size for better quality
sunLight.shadow.mapSize.height = 2048; // Increase shadow map size for better quality
sunLight.shadow.camera.near = 0.5; // Adjust near clipping plane
sunLight.shadow.camera.far = 1500; // Adjust far clipping plane

// Adjust the shadow camera's view area to cover the scene
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;

// Add the directional light to the scene
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
hemiLight.position.set( 0, 500, 0 );
scene.add( hemiLight );




// add helpers to make lights visible
// scene.add(new THREE.PointLightHelper(light));
// scene.add(new THREE.PointLightHelper(pointLight2));
scene.add(new THREE.PointLightHelper(sunLight));


// Add a grid helper
const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = false; // Do not allow panning in screen space

// Add an event listener to prevent the camera from going below ground
controls.addEventListener('change', () => {
  if (camera.position.y < 0) {
    camera.position.y = 0;
  }
});

// Function to load the OBJ model
function loadOBJModel(url) {
  return new Promise((resolve, reject) => {
      const objLoader = new OBJLoader();
      objLoader.load(url, resolve, undefined, reject);
  });
}

// Function to load the texture
function loadTexture(url) {
  return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(url, resolve, undefined, reject);
  });
}

// Function to make the file name web-safe
function makeWebSafeFileName(fileName) {
  return fileName
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-\.]+/g, '') // Remove all non-word characters except dashes and dots
    .replace(/_+/g, '_'); // Replace multiple underscores with a single underscore
}

async function init() {
  try {
      let objectArr = [];
      let selectedObject = 0;

      // create a texture link array
      const textureLinks = [];

      const object = await loadOBJModel('imports/CustomTitle__Model_20240806130711_displacement_1.obj');
      const displacementMap = await loadTexture('imports/CustomTitle__DisplacementMap_20240806130711_displacement_1.jpg');
      
      // Modify the displacement map to create transparency where values are below 0.5
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = displacementMap.image.width;
      canvas.height = displacementMap.image.height;
      context.drawImage(displacementMap.image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
          const displacementValue = data[i] / 255; // Assuming grayscale image
          if (displacementValue < 0.1) {
              data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
      }

      context.putImageData(imageData, 0, 0);
      const modifiedTexture = new THREE.Texture(canvas);
      modifiedTexture.needsUpdate = true;
      
      // Apply the modified displacement map to the material
      object.traverse(function (child) {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            displacementMap: modifiedTexture,
            displacementScale: 1,
            side: THREE.DoubleSide,
            roughness: 1, // Adjust roughness for better shading
            metalness: 0,  // Adjust metal
            transparent: true, // Enable transparency
            alphaMap: modifiedTexture, // Use the modified texture as alpha map
            alphaTest: 0.5, // Set alpha test value
            depthWrite: false // Ensure depth writing is disabled for transparent objects
          });
          child.castShadow = true; // Enable shadow casting
          child.receiveShadow = true; // Enable shadow receiving
          // Ensure shadow material respects alpha map
        }
      });
      // Rotate the object
      object.rotation.x = Math.PI / -2;

      // make the object higher on y axis
      object.position.y = 4;
      
      object.castShadow = true; 

      // Add the object to the scene
      scene.add(object);

      // push the object to the objectArr
      objectArr.push(object);


      
      // add settings to move the object on 3 axes
      const objectSettings = {
        x: 0,
        y: 4,
        z: 0
      };
      const objectFolder = gui.addFolder('Object Position');
      objectFolder.add(objectSettings, 'x', -10, 20).onChange(value => {
        // edit the position of the current selected object
        objectArr[selectedObject].position.x = value;
      }
      );
      objectFolder.add(objectSettings, 'y', 0, 50).onChange(value => {
        objectArr[selectedObject].position.y = value;
      }
      );
      objectFolder.add(objectSettings, 'z', -10, 20).onChange(value => {
        objectArr[selectedObject].position.z = value;
      }
      );
      objectFolder.open();

      // add settings to adjust the object color
      const objectColorSettings = {
        color: 0x333333
      };
      const objectColorFolder = gui.addFolder('Object Color');
      objectColorFolder.addColor(objectColorSettings, 'color').onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.color.setHex(value);
          }
        });
      }
      );

      // add settings to adjust the object displacement scale
      const objectDisplacementSettings = {
        scale: 1
      };
      const objectDisplacementFolder = gui.addFolder('Object Displacement');
      objectDisplacementFolder.add(objectDisplacementSettings, 'scale', 0, 5).onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.displacementScale = value;
          }
        });
      }
      );

      // add settings to adjust the object roughness
      const objectRoughnessSettings = {
        roughness: 1
      };
      const objectRoughnessFolder = gui.addFolder('Object Roughness');
      objectRoughnessFolder.add(objectRoughnessSettings, 'roughness', 0, 1).onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.roughness = value;
          }
        });
      }
      );
      
      // add settings to adjust the object metalness
      const objectMetalnessSettings = {
        metalness: 0
      };
      const objectMetalnessFolder = gui.addFolder('Object Metalness');
      objectMetalnessFolder.add(objectMetalnessSettings, 'metalness', 0, 1).onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.metalness = value;
          }
        });
      }
      );

      // add settings to adjust the object transparency
      const objectTransparencySettings = {
        transparency: 1
      };
      const objectTransparencyFolder = gui.addFolder('Object Transparency');
      objectTransparencyFolder.add(objectTransparencySettings, 'transparency', 0, 1).onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.opacity = value;
          }
        });
      }
      );

      // add settings to adjust the object alpha test value
      const objectAlphaTestSettings = {
        alphaTest: 0.5
      };
      const objectAlphaTestFolder = gui.addFolder('Object Alpha Test');
      objectAlphaTestFolder.add(objectAlphaTestSettings, 'alphaTest', 0, 1).onChange(value => {
        objectArr[selectedObject].traverse(function (child) {
          if (child.isMesh) {
            child.material.alphaTest = value;
          }
        });
      }
      );

      // add settings to rotate the object on 3 axes but locked at degrees of 45
      const objectRotationSettings = {
        x: 0,
        y: 0,
        z: 0
      };
      const objectRotationFolder = gui.addFolder('Object Rotation');
      objectRotationFolder.add(objectRotationSettings, 'x', -180, 180).step(45).onChange(value => {
        objectArr[selectedObject].rotation.x = value * Math.PI / 180;
      });
      objectRotationFolder.add(objectRotationSettings, 'y', -180, 180).step(45).onChange(value => {
        objectArr[selectedObject].rotation.y = value * Math.PI / 180;
      });
      objectRotationFolder.add(objectRotationSettings, 'z', -180, 180).step(45).onChange(value => {
        objectArr[selectedObject].rotation.z = value * Math.PI / 180;
      });
      objectRotationFolder.open();

      // add settings to adjust scale of the object
      const objectScaleSettings = {
        scale: 1
      };
      const objectScaleFolder = gui.addFolder('Object Scale');
      objectScaleFolder.add(objectScaleSettings, 'scale', .5, 4).step(1).onChange(value => {
        objectArr[selectedObject].scale.set(value, value, value);
      }
      );
      objectScaleFolder.open();

      // add a button in a folder to select the object from the objectArr
      let objectSelectSettings = {
        object0: () => {
          selectedObject = 0;
        }
      };
      const objectSelectFolder = gui.addFolder('Object Select');
      objectSelectFolder.add(objectSelectSettings, 'object0');
      objectSelectFolder.open();

      // add a button to duplicate the object
      const objectDuplicateSettings = {
        duplicate: () => {
          const newObject = objectArr[selectedObject].clone();
          newObject.position.y += 5;
      
          // prompt to upload a new texture
          const textureUpload = document.createElement('input');
          textureUpload.type = 'file';
          textureUpload.accept = 'image/*';
          textureUpload.click();
          textureUpload.onchange = async () => {
            const file = textureUpload.files[0];
            if (!file) {
              console.error('No file selected');
              return;
            }

            console.log('File selected:', file.name);

            // rename file to be web friendly
            const webSafeFileName = makeWebSafeFileName(file.name);

            const formData = new FormData();
            formData.append('file', new File([file], webSafeFileName, { type: file.type }));

            try {
              const response = await fetch('/upload', { // Ensure this URL is correct
                method: 'POST',
                body: formData
              });

              if (response.ok) {
                console.log('File uploaded successfully');
                const result = await response.json();
                console.log('Upload result:', result);

                try {
                  // remove first slash from the file path
                  const newPath = result.filePath.substring(1);
                  console.log('New texture path:', newPath);
                  const texture = await loadTexture(newPath);
                  console.log('Texture loaded successfully:', texture);

                  // Modify the displacement map to create transparency where values are below 0.5
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.width = texture.image.width;
                  canvas.height = texture.image.height;
                  context.drawImage(texture.image, 0, 0);
                  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                  const data = imageData.data;

                  for (let i = 0; i < data.length; i += 4) {
                      const displacementValue = data[i] / 255; // Assuming grayscale image
                      if (displacementValue < 0.1) {
                          data[i + 3] = 0; // Set alpha to 0 (transparent)
                      }
                  }

                  context.putImageData(imageData, 0, 0);
                  const modifiedTexture = new THREE.Texture(canvas);
                  modifiedTexture.needsUpdate = true;

                  newObject.traverse(function (child) {
                    if (child.isMesh) {
                      console.log('Applying texture to mesh:', child);
                      // Clone the material to avoid modifying the original object's material
                      child.material = child.material.clone();
                      child.material.alphaMap = modifiedTexture;
                      child.material.displacementMap = modifiedTexture;
                      child.material.needsUpdate = true;

                      // add the new object to the scene
                      scene.add(newObject);

                      // after adding the object to the scene, push it to the objectArr
                      objectArr.push(newObject);
                      
                      // push a new button to the objectSelectFolder
                      objectArr.forEach((obj, index) => {
                        objectSelectSettings[`object${index}`] = () => {
                          selectedObject = index;
                        };
                      });

                      // Add the new button for the duplicated object
                      objectSelectFolder.add(objectSelectSettings, `object${objectArr.length - 1}`);
                      selectedObject = objectArr.length - 1;
                    }
                  });

                  
                } catch (textureError) {
                  console.error('Error loading texture:', textureError);
                }
              } else {
                console.error('Failed to upload file:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error details:', errorText);
              }
            } catch (error) {
              console.error('Error during file upload:', error);
            }
          };
        
        }
      };

      const objectDuplicateFolder = gui.addFolder('Object Duplicate');
      objectDuplicateFolder.add(objectDuplicateSettings, 'duplicate');
      objectDuplicateFolder.open();





  } catch (error) {
      console.error('An error occurred while loading the model or texture:', error);
  }
}

init();

// add settings to move the light on 3 axes
const gui = new GUI();
const lightSettings = {
  x: sunLight.position.x,
  y: sunLight.position.y,
  z: sunLight.position.z
};
const lightFolder = gui.addFolder('Light Position');
lightFolder.add(lightSettings, 'x', -20, 20).onChange(value => {
  sunLight.position.x = value;
}
);
lightFolder.add(lightSettings, 'y', 0, 60).onChange(value => {
  sunLight.position.y = value;
}
);
lightFolder.add(lightSettings, 'z', -20, 20).onChange(value => {
  sunLight.position.z = value;
}
);
lightFolder.open();

// add settings to adjust the light color
const lightColorSettings = {
  color: sunLight.color.getHex()
};
const lightColorFolder = gui.addFolder('Light Color');
lightColorFolder.addColor(lightColorSettings, 'color').onChange(value => {
  sunLight.color.setHex(value);
}
);
lightColorFolder.open();

// add settings to export the scene as a glb file and html file and download them
const exportSettings = {
  export: () => {
    const exporter = new GLTFExporter();
    exporter.parse(scene, (result) => {
      const output = JSON.stringify(result, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene.glb';
      a.click();
      URL.revokeObjectURL(url);

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLB Viewer</title>
  <style>
    body { margin: 0; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r126/three.min.js" integrity="sha512-n8IpKWzDnBOcBhRlHirMZOUvEq2bLRMuJGjuVqbzUJwtTsgwOgK5aS0c1JA647XWYfqvXve8k3PtZdzpipFjgg==" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/three@0.126.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://unpkg.com/three@0.126.0/examples/js/loaders/GLTFLoader.js"></script>
  <script>
    // Ensure THREE is available globally
    const loader = new THREE.GLTFLoader();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xaaaaaa); // Set background color
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Add OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();

    loader.load('scene.glb', function (gltf) {
      console.log('GLTF loaded successfully', gltf);
      scene.add(gltf.scene);

      // Adjust model position and scale if necessary
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.scale.set(1, 1, 1);

      camera.position.z = 5;
      animate();
    }, function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) {
      console.error('An error happened', error);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update(); // Update controls on each frame
      renderer.render(scene, camera);
    }
  </script>
</body>
      `;

      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = 'scene.html';
      htmlLink.click();
      URL.revokeObjectURL(htmlUrl);
    }, { binary: true });
  }
};
const exportFolder = gui.addFolder('Export Scene');
exportFolder.add(exportSettings, 'export');
exportFolder.open();




// // add a cube to test shadows
// const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
// const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.castShadow = true;
// cube.position.x = 2;
// cube.position.y = 4;
// cube.position.z = 2;
// scene.add(cube);

// Create a canvas element
const canvas2 = document.createElement('canvas');
canvas2.width = 256;
canvas2.height = 256;
const context2 = canvas2.getContext('2d');

// Create a radial gradient
const gradient2 = context2.createRadialGradient(
  canvas2.width / 2, canvas2.height / 2, 0, // Inner circle (center)
  canvas2.width / 2, canvas2.height / 2, canvas2.width / 2 // Outer circle (edge)
);

// Set the color stops
gradient2.addColorStop(0, '#FFD700'); // Inner color
gradient2.addColorStop(1, '#FE95C8'); // Outer color
gradient2.addColorStop(.8, '#EDC9AF'); // Outer color

// Use the gradient to fill a rectangle
context2.fillStyle = gradient2;
context2.fillRect(0, 0, canvas2.width, canvas2.height);

// Create a texture from the canvas
const texture2 = new THREE.CanvasTexture(canvas2);

// Create the cylinder geometry and material
const cylinderGeometry = new THREE.CylinderGeometry(100, 100, 1, 32);
const cylinderMaterial = new THREE.MeshStandardMaterial({ map: texture2 }); // Use the texture as the material map
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.receiveShadow = true; // Enable shadow receiving
cylinder.position.y = -2; // Position the cylinder below the object

// cylinder.rotation.x = Math.PI / 2; // Rotate to make it horizontal
scene.add(cylinder);

// Set the camera position
camera.position.z = 15;
camera.position.y = 15;
camera.position.x = 3;

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update controls
  renderer.render(scene, camera);
}

animate();