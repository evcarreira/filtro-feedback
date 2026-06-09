// Fragment shader con efecto glitch + chromatic aberration (arcoíris)
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;

varying vec2 v_texCoord;

// Función de ruido para el glitch
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Genera bandas de glitch horizontales
float glitchBlock(vec2 uv, float time) {
    float block = floor(uv.y * 20.0 + time * 5.0);
    return step(0.92, random(vec2(block, floor(time * 10.0))));
}

void main() {
    vec2 uv = v_texCoord;
    float time = u_time;
    
    // === GLITCH: Desplazamiento horizontal aleatorio ===
    float glitchIntensity = glitchBlock(uv, time);
    float shift = (random(vec2(floor(uv.y * 30.0), floor(time * 15.0))) - 0.5) * 0.15;
    uv.x += shift * glitchIntensity;
    
    // Salto vertical ocasional
    float jumpTrigger = step(0.97, random(vec2(floor(time * 8.0), 1.0)));
    uv.y += (random(vec2(time)) - 0.5) * 0.1 * jumpTrigger;
    
    // === CHROMATIC ABERRATION (efecto arcoíris) ===
    // La separación varía con el tiempo para más dinamismo
    float aberrationAmount = 0.01 + 0.02 * sin(time * 3.0) + 0.05 * glitchIntensity;
    
    // Separación en 6 canales para efecto arcoíris completo
    vec2 dir = uv - 0.5; // Dirección desde el centro
    float dist = length(dir);
    vec2 offsetDir = normalize(dir + 0.001);
    
    // Muestreo con offsets para cada color del arcoíris
    float r = texture2D(u_texture, uv + offsetDir * aberrationAmount * 1.0).r;
    float g = texture2D(u_texture, uv).g;
    float b = texture2D(u_texture, uv - offsetDir * aberrationAmount * 1.0).b;
    
    // Canal extra para más separación cromática en glitch fuerte
    float r2 = texture2D(u_texture, uv + vec2(aberrationAmount * 1.5, 0.0)).r;
    float b2 = texture2D(u_texture, uv - vec2(aberrationAmount * 1.5, 0.0)).b;
    
    r = mix(r, r2, glitchIntensity * 0.5);
    b = mix(b, b2, glitchIntensity * 0.5);
    
    vec3 color = vec3(r, g, b);
    
    // === SCANLINES ===
    float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.04;
    color -= scanline;
    
    // === RUIDO DE SEÑAL ===
    float noise = (random(uv + time) - 0.5) * 0.08;
    color += noise * (0.5 + glitchIntensity);
    
    // === PARPADEO OCASIONAL ===
    float flicker = 1.0 - step(0.985, random(vec2(floor(time * 20.0)))) * 0.3;
    color *= flicker;
    
    // === TINTE ARCOÍRIS SUTIL ===
    vec3 rainbowTint = vec3(
        sin(time + uv.x * 3.0) * 0.5 + 0.5,
        sin(time + uv.x * 3.0 + 2.094) * 0.5 + 0.5,  // +2π/3
        sin(time + uv.x * 3.0 + 4.189) * 0.5 + 0.5   // +4π/3
    );
    color = mix(color, color * rainbowTint, 0.15 + glitchIntensity * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
}
