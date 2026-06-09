precision mediump float;

uniform sampler2D u_texture;     // cámara
uniform sampler2D u_prevFrame;   // feedback
uniform vec2 u_resolution;

varying vec2 v_uv;

void main() {
    // ⭐ Usamos v_uv en vez de gl_FragCoord
    vec2 uv = v_uv;

    // ⭐ Correcciones de orientación
    uv.y = 1.0 - uv.y;   // vertical
    uv.x = 1.0 - uv.x;   // horizontal

    // Cámara
    vec4 cam = texture2D(u_texture, uv);

    // Feedback MUY suave y sin desplazamiento exagerado
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.0005, -0.0005));

    // Mezcla suave (antes 0.25 → demasiado eco)
    vec4 mixFB = mix(cam, prev, 0.12);

    // Halo MUY suave (antes demasiado fuerte)
    float glow = smoothstep(0.45, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.02, 0.04, 0.08);

    gl_FragColor = vec4(halo, 1.0);
}
