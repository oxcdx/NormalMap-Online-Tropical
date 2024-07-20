NMO_DisplacementShader = {
	uniforms: {
		//"type": 		{type: "1i", value: 0},
    	"invert": 		{type: "1f", value: 1},
    	"contrast":		{type: "1f", value: 0},
      "mosaic":		{type: "1f", value: 0},
    	"flipY": 		{type: "1f", value: 0},
    	"tHeight": 		{type: "t", value: null }
	},

	vertexShader: `
		precision mediump float;
        varying vec2 vUv;
		uniform float flipY;
        void main() 
		{
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			vUv = uv;
			vUv.y = (flipY > 0.0) ? (1.0 - vUv.y) : vUv.y;
		}`
	,

	fragmentShader: `
    precision mediump float;
    varying vec2 vUv;
    uniform float contrast;
    uniform float mosaic;
    uniform float invert;
    uniform sampler2D tHeight;
    
    void main(void) 
    {
        vec2 processedUv;
        // Check if mosaic is 0 to bypass it
        if (mosaic == 0.0) {
            processedUv = vUv;
        } else {
            // Step 1: Quantize the Texture Coordinates
            processedUv = floor(vUv * mosaic) / mosaic;
        }
        
        // Step 2: Sample the Texture
        vec4 v = texture2D(tHeight, processedUv);
        
        // Step 3: Apply Contrast
        float factor = (contrast + 1.0) / (1.0 - contrast);
        v.rgb = factor * (v.rgb - vec3(0.5, 0.5, 0.5)) + vec3(0.5, 0.5, 0.5);
        
        // Step 4: Apply Inversion
        v.rgb = (invert == 1.0) ? vec3(1.0) - v.rgb : v.rgb;
        
        // Step 5: Output the Color
        gl_FragColor = v;
    }`
}