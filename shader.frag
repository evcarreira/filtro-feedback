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

    // ⭐ ECO MUY FUERTE
    // Más desplazamiento → más duplicación estética
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.0015, -0.0015));

    // ⭐ Mezcla MUY alta → eco profundo
    vec4 mixFB = mix(cam, prev, 0.45);

    // ⭐ Halo FUERTE y saturado
    float glow = smoothstep(0.25, 1.0, length(cam.rgb));
    vec3 halo = mixFB.rgb + glow * vec3(0.25, 0.35, 0.9); // azul intenso

    // ⭐ Saturación extrema
    vec3 saturated = halo * vec3(1.8, 1.5, 2.2);

    // ⭐ Realce final (sin quemar del todo)
    vec3 finalColor = mix(saturated, saturated * saturated, 0.35);

    gl_FragColor = vec4(finalColor, 1.0);
}
