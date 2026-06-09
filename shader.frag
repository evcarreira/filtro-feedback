precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_prevFrame;
uniform vec2 u_resolution;

varying vec2 v_uv;

void main() {
    vec2 uv = v_uv;

    // Corrección de orientación
    uv.y = 1.0 - uv.y;
    uv.x = 1.0 - uv.x;

    // Cámara
    vec4 cam = texture2D(u_texture, uv);

    // Feedback MUY suave y con desplazamiento mínimo
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.0002, -0.0002));

    // Mezcla muy suave (antes 0.12 → aún fuerte)
    vec4 mixFB = mix(cam, prev, 0.06);

    // Halo extremadamente suave (antes 0.02–0.08)
    float glow = smoothstep(0.55, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.01, 0.02, 0.04);

    // Suavizado final para evitar saturación
    vec3 finalColor = mix(halo, cam.rgb, 0.25);

    gl_FragColor = vec4(finalColor, 1.0);
}
