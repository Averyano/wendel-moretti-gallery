uniform sampler2D uTexture;
uniform vec2 uResolution; // 1, 1
uniform vec2 uZoomScale; // 1, 1
uniform vec2 uImageRes; // tex.source.data.width & height

uniform vec2 uScale;
uniform vec2 uOffset;
uniform vec2 uMouse;
uniform float uDarken;

varying vec2 vUv;

vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
	float r = texture2D(textureImage,uv + offset).r;
	vec2 gb = texture2D(textureImage,uv).gb;
	return vec3(r,gb);
}

/*------------------------------
Background Cover UV
--------------------------------
u = basic UV
s = screensize
i = image size
------------------------------*/
vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
	float rs = s.x / s.y; // Aspect screen size
	float ri = i.x / i.y; // Aspect image size
	vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
	vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
	return u * s / st + o;
}

void main() {
	vec2 uv = CoverUV(vUv, uResolution, uImageRes);
	// vec3 tex = texture2D(uTexture, uv).rgb;
	vec3 color = rgbShift(uTexture, uv, uOffset);
	gl_FragColor = vec4( color * uDarken, 1.0 );
}

// void main() {

// 	float uvx, uvy;
// 	if (uScale.x > uScale.y) {
// 		uvx = vUv.x  / uScale.x;
// 		uvy = vUv.y / uScale.y;
// 	} else {
// 		uvx = vUv.x / uScale.x;
// 		uvy = vUv.y / uScale.y;
// 	}

// 	vec2 newuv = vec2(uvx, uvy);

// 	vec3 color = rgbShift(uTexture, newuv, uOffset);
// 	// vec4 image = texture2D(uTexture, newuv);

// 	gl_FragColor = vec4(color, 1.0);
// }