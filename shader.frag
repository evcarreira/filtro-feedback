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

    // ⭐ ECO suave
    vec3 prev = texture2D(u_prevFrame, uv + vec2(0.0006, -0.0006)).rgb;
    vec3 echo = mix(cam, prev, 0.25);

    // ⭐ THRESHOLD más agresivo
    float lum = dot(cam, vec3(0.299, 0.587, 0.114));
    float t = step(0.35, lum);   // antes 0.45 → ahora más sensible

    // ⭐ GLITCH basado en threshold (MUCHO más fuerte)
    float glitch = t * 0.045;    // antes 0.015 → ahora 3× más
    vec2 glitchUV = uv + vec2(glitch, -glitch * 0.6);

    // ⭐ ARCOÍRIS más visible (RGB split mayor)
    vec3 rainbow = vec3(
        texture2D(u_texture, glitchUV + vec2(0.002, 0.0)).r,
        texture2D(u_texture, glitchUV).g,
        texture2D(u_texture, glitchUV - vec2(0.002, 0.0)).b
    );

    // Mezcla arcoíris + eco
    vec3 mixColor = mix(echo, rainbow, 0.45);

    // ⭐ Saturación suave
    mixColor *= vec3(1.25, 1.15, 1.35);

    // ⭐ Contraste bajo
    mixColor = pow(mixColor, vec3(0.85));

    gl_FragColor = vec4(mixColor, 1.0);
}
