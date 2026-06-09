precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_prevFrame;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Correcciones de orientación
    uv.y = 1.0 - uv.y;   // arregla imagen al revés
    uv.x = 1.0 - uv.x;   // arregla espejo horizontal

    // Cámara actual
    vec4 cam = texture2D(u_texture, uv);

    // Feedback suave (eco)
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.001, -0.001));

    // Mucho más suave (antes 0.85)
    vec4 mixFB = mix(cam, prev, 0.25);

    // Halo MUCHO más suave (antes 0.2,0.4,1.0)
    float glow = smoothstep(0.3, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.05, 0.1, 0.2);

    gl_FragColor = vec4(halo, 1.0);
}
