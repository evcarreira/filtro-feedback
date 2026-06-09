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

    // Cámara base
    vec3 cam = texture2D(u_texture, uv).rgb;

    // ⭐ ECO suave tipo agua
    vec3 prev = texture2D(u_prevFrame, uv + vec2(0.0006, -0.0006)).rgb;
    vec3 echo = mix(cam, prev, 0.30);   // eco suave, no agresivo

    // ⭐ Arcoíris suave tipo refracción en agua
    vec3 rainbow = vec3(
        texture2D(u_texture, uv + vec2(0.001, -0.0005)).r,
        texture2D(u_texture, uv).g,
        texture2D(u_texture, uv + vec2(-0.001, 0.0005)).b
    );

    // Mezcla arcoíris + eco
    vec3 mixColor = mix(echo, rainbow, 0.35);

    // ⭐ Glitch suave tipo ondulación
    float wave = sin(uv.y * 40.0) * 0.002;
    vec3 water = texture2D(u_texture, uv + vec2(wave, 0.0)).rgb;

    // Mezcla final estilo agua
    vec3 finalColor = mix(mixColor, water, 0.25);

    // ⭐ Saturación baja y contraste bajo
    finalColor = pow(finalColor, vec3(0.85));  // baja contraste
    finalColor *= vec3(1.1, 1.05, 1.15);       // saturación suave

    gl_FragColor = vec4(finalColor, 1.0);
}
