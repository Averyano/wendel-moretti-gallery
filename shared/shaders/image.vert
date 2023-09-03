
#define M_PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform float uProgress;
uniform vec2 uMouse;
uniform vec2 uZoomScale;

void main() {
	vUv = uv;
	vec3 pos = position;
	float angle = uProgress * M_PI / 2.;
	float wave = cos(angle);
	float c = sin(length(uv - .5) * 15. + uProgress * 2.) * .5 + .5;
	pos.x *= mix(1., uZoomScale.x + wave * c, uProgress);
	pos.y *= mix(1., uZoomScale.y + wave * c, uProgress);

	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}