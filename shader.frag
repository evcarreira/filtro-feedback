precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_prevFrame;
uniform float u_time;
uniform vec2 u_resolution;

varying vec2 v_uv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_uv;
    
    // Corrección de orientación
    uv.y = 1.0 - uv.y;
    uv.x = 1.0 - uv.x;

    // Cámara base
    vec3 cam = texture2D(u_texture, uv).rgb;

    // === GLITCH más agresivo pero controlado ===
    float lum = dot(cam, vec3(0.299, 0.587, 0.114));
    
    // Umbral más bajo y glitch variable en el tiempo
    float trigger = step(0.28, lum);
    float glitchAmount = trigger * 0.065;
    
    // Desplazamiento horizontal aleatorio (glitch blocks)
    float block = floor(uv.y * 25.0 + u_time * 8.0);
    float randShift = (random(vec2(block, floor(u_time * 12.0))) - 0.5) * 2.0;
    vec2 glitchUV = uv + vec2(glitchAmount * randShift, -glitchAmount * 0.7);

    // === ARCOÍRIS + ABERRACIÓN CROMÁTICA ===
    float aberration = 0.0035 + 0.004 * randShift * trigger;
    
    vec3 rainbow = vec3(
        texture2D(u_texture, glitchUV + vec2(aberration * 1.8, 0.0)).r,
        texture2D(u_texture, glitchUV).g,
        texture2D(u_texture, glitchUV - vec2(aberration * 2.0, 0.0)).b
    );

    // === ECO con movimiento ===
    vec2 echoOffset = vec2(0.0005, -0.0005) + vec2(randShift * 0.0003, 0.0) * trigger;
    vec3 prev = texture2D(u_prevFrame, uv + echoOffset).rgb;
    vec3 echo = mix(cam, prev, 0.22);

    // Mezcla final
    vec3 color = mix(echo, rainbow, 0.55);

    // === EFECTOS FINALES ===
    // Scanlines sutiles
    float scan = sin(uv.y * u_resolution.y * 1.8) * 0.035;
    color -= scan;

    // Ruido ligero
    float noise = (random(uv + u_time) - 0.5) * 0.045;
    color += noise * trigger;

    // Saturación + contraste suave
    color *= vec3(1.22, 1.12, 1.32);
    color = pow(color, vec3(0.88));

    gl_FragColor = vec4(color, 1.0);
}
