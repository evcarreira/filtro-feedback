precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_prevFrame;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Correcciones de orientación
    uv.y = 1.0 - uv.y;
    uv.x = 1.0 - uv.x;

    // Cámara actual
    vec4 cam = texture2D(u_texture, uv);

    // Feedback suave
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.001, -0.001));

    // Mucho más suave
    vec4 mixFB = mix(cam, prev, 0.25);

    // Halo muy suave
    float glow = smoothstep(0.3, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.05, 0.1, 0.2);

    gl_FragColor = vec4(halo, 1.0);
}

