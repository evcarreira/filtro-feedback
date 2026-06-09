const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Crear shaders
function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
  }

  return shader;
}

// Cargar shader fragment
async function loadShader() {
  const frag = await fetch("shader.frag").then(r => r.text());

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0, 1);
    }
  `;

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, frag);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program error:", gl.getProgramInfoLog(program));
  }

  gl.useProgram(program);
  return program;
}

async function start() {
  const program = await loadShader();

  // Cuadrado a pantalla completa
  const position = gl.getAttribLocation(program, "a_position");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // Crear video
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  // ⭐ Pedir cámara
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;

    // ⭐ Esperar a que el vídeo tenga datos reales
    video.onloadeddata = () => {
      video.play();
      requestAnimationFrame(render);
    };
  });

  // ⭐ Crear texturas
  const tex = gl.createTexture();
  const prevTex = gl.createTexture();

  function setupTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  setupTexture(tex);
  setupTexture(prevTex);

  function render() {
    // ⭐ Solo dibujar si el vídeo tiene frames válidos
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video
      );
    }

    // ⭐ Copiar el frame anterior del canvas
    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.copyTexImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      0,
      0,
      canvas.width,
      canvas.height,
      0
    );

    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_prevFrame"), 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prevTex);

    gl.uniform2f(
      gl.getUniformLocation(program, "u_resolution"),
      canvas.width,
      canvas.height
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  }
}

start();
