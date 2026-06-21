<script>
	import { onMount, onDestroy } from 'svelte';

	let { opacity = 0.4 } = $props();

	let canvas = $state(null);
	let gl;
	let animationFrameId;
	let resizeObserver;
	let mouse = { x: 0, y: 0 };

	const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

	const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = v_texCoord;
    
    // Create a very subtle, slow-moving dark gradient "vapor"
    // This adds depth to the #000000 background without breaking the "Pure Black" rule
    float noise = sin(uv.x * 2.0 + u_time * 0.2) * cos(uv.y * 2.0 + u_time * 0.3);
    float glow = smoothstep(0.0, 0.8, noise * 0.1);
    
    // Normalize mouse position
    vec2 mouseUV = u_mouse / u_resolution;
    float dist = distance(uv, mouseUV);
    float pointerGlow = smoothstep(0.4, 0.0, dist) * 0.08;
    
    // Electric blue tint, kept extremely dark and subtle, plus interactive pointer glow
    vec3 color1 = vec3(0.0, 0.0, 0.0);
    vec3 color2 = vec3(0.0, 0.02, 0.05); // Barely perceptible blue depth
    
    vec3 finalColor = mix(color1, color2, glow + pointerGlow);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

	function syncSize() {
		if (!canvas) return;
		const w = canvas.clientWidth || 1280;
		const h = canvas.clientHeight || 720;
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
		}
	}

	function handlePointerMove(event) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		if (rect.width && rect.height) {
			const nx = (event.clientX - rect.left) / rect.width;
			const ny = 1.0 - (event.clientY - rect.top) / rect.height;
			mouse.x = nx * canvas.width;
			mouse.y = ny * canvas.height;
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('pointermove', handlePointerMove);
		}

		if (typeof ResizeObserver !== 'undefined' && canvas) {
			resizeObserver = new ResizeObserver(syncSize);
			resizeObserver.observe(canvas);
		}
		syncSize();

		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		if (!gl) return;

		function cs(type, src) {
			const s = gl.createShader(type);
			gl.shaderSource(s, src);
			gl.compileShader(s);
			const success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
			if (!success) {
				console.error('Shader compilation error:', gl.getShaderInfoLog(s));
			}
			return s;
		}

		const prog = gl.createProgram();
		gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
		gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
		gl.linkProgram(prog);
		const success = gl.getProgramParameter(prog, gl.LINK_STATUS);
		if (!success) {
			console.error('Program link error:', gl.getProgramInfoLog(prog));
			return;
		}
		gl.useProgram(prog);

		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

		const pos = gl.getAttribLocation(prog, 'a_position');
		gl.enableVertexAttribArray(pos);
		gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

		const uTime = gl.getUniformLocation(prog, 'u_time');
		const uRes = gl.getUniformLocation(prog, 'u_resolution');
		const uMouse = gl.getUniformLocation(prog, 'u_mouse');

		mouse.x = canvas.width / 2;
		mouse.y = canvas.height / 2;

		function render(t) {
			if (!canvas || !gl) return;
			if (typeof ResizeObserver === 'undefined') syncSize();
			gl.viewport(0, 0, canvas.width, canvas.height);
			if (uTime) gl.uniform1f(uTime, t * 0.001);
			if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
			if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			animationFrameId = requestAnimationFrame(render);
		}

		animationFrameId = requestAnimationFrame(render);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointermove', handlePointerMove);
		}
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	});
</script>

<div class="shader-container" style="opacity: {opacity};">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.shader-container {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		display: block;
		transition: opacity 0.5s ease;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
