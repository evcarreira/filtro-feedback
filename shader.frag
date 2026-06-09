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
    vec4 cam = texture2D(u_texture, uv);

    // ⭐ Glitch suave por línea
    float glitch = step(0.995, fract(sin(uv.y * 900.0) * 99999.0));
    float glitchShift = glitch * 0.01;

    // ⭐ Arcoíris suave (RGB split pequeño)
    vec2 rUV = uv + vec2(0.001 + glitchShift, -0.0005);
    vec2 gUV = uv;
    vec2 bUV = uv + vec2(-0.001 - glitchShift, 0.0005);

    vec3 rainbowCam = vec3(
        texture2D(u_texture, rUV).r,
        texture2D(u_texture, gUV).g,
        texture2D(u_texture, bUV).b
    );

    // ⭐ Eco profundo pero suave (menos contraste)
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.0008, -0.0008));
    vec3 mixFB = mix(rainbowCam, prev.rgb, 0.38);

    // ⭐ Halo arcoíris suave (sin quemar)
    float glow = smoothstep(0.35, 1.0, length(cam.rgb));
    vec3 halo = mixFB + glow * vec3(0.25, 0.15, 0.45);

    // ⭐ Saturación moderada (no quema blancos)
    vec3 saturated = halo * vec3(1.25, 1.15, 1.35);

    // ⭐ Contraste bajo (evita blancos)
    vec3 soft = mix(saturated, sqrt(saturated), 0.55);

    gl_FragColor = vec4(soft, 1.0);
}
