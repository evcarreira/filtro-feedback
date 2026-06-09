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

    // ⭐ Glitch más fuerte pero no destructivo
    float glitchH = step(0.985, fract(sin(uv.y * 1200.0) * 99999.0));
    float glitchV = step(0.985, fract(sin(uv.x * 800.0) * 99999.0));
    float glitchShift = (glitchH + glitchV) * 0.015;

    // ⭐ Arcoíris más marcado (RGB split mayor)
    vec2 rUV = uv + vec2(0.0025 + glitchShift, -0.0015);
    vec2 gUV = uv;
    vec2 bUV = uv + vec2(-0.0025 - glitchShift, 0.0015);

    vec3 rainbowCam = vec3(
        texture2D(u_texture, rUV).r,
        texture2D(u_texture, gUV).g,
        texture2D(u_texture, bUV).b
    );

    // ⭐ Eco fuerte pero suave en contraste
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.001, -0.001));
    vec3 mixFB = mix(rainbowCam, prev.rgb, 0.48);

    // ⭐ Halo arcoíris suave (menos contraste)
    float glow = smoothstep(0.40, 1.0, length(cam.rgb));
    vec3 halo = mixFB + glow * vec3(0.35, 0.20, 0.65);

    // ⭐ Saturación alta pero luminancia controlada
    vec3 saturated = halo * vec3(1.45, 1.35, 1.65);

    // ⭐ Contraste bajo → look digital suave
    vec3 soft = mix(saturated, sqrt(saturated), 0.70);

    // ⭐ Suavizado final para evitar blancos
    vec3 finalColor = min(soft, vec3(1.0));

    gl_FragColor = vec4(finalColor, 1.0);
}
