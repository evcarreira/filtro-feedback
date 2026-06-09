precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_prevFrame;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Cámara actual
    vec4 cam = texture2D(u_texture, uv);

    // Feedback suave (eco)
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.001, -0.001));

    // Mezcla entre cámara y eco
    vec4 mixFB = mix(cam, prev, 0.85);

    // Halo de color
    float glow = smoothstep(0.2, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.2, 0.4, 1.0);

    gl_FragColor = vec4(halo, 1.0);
}
