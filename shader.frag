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

    // ⭐ GLITCH: desplazamiento aleatorio por línea
    float glitch = step(0.97, fract(sin(uv.y * 1200.0) * 99999.0));
    float glitchShift = glitch * 0.02;

    // ⭐ ARCOÍRIS: separación RGB (chromatic aberration)
    vec2 rUV = uv + vec2(0.002 + glitchShift, -0.001);
    vec2 gUV = uv + vec2(0.000, 0.000);
    vec2 bUV = uv + vec2(-0.002 - glitchShift, 0.001);

    vec3 rainbowCam = vec3(
        texture2D(u_texture, rUV).r,
        texture2D(u_texture, gUV).g,
        texture2D(u_texture, bUV).b
    );

    // ⭐ ECO profundo (feedback)
    vec4 prev = texture2D(u_prevFrame, uv + vec2(0.0015, -0.0015));

    //
