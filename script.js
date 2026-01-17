let nodes = [];

/**
 * Save current evidence to computer
 * TODO: create this function
 */
function save() {}

/**
 * Load current evidence from computer
 * TODO: create this function
 */
function load() {}

/**
 * Add a node
 * TODO: create this function
 */
function add() {
  nodes.push({
    type: "note",
    text: "Suspect was here at 9pm",
    x: 400,
    y: 200,
    w: 220,
    h: 120,
    connections: [1],
  });
  nodes.push({
    type: "note",
    text: "Suspect was here at 1pm",
    x: 700,
    y: 200,
    w: 220,
    h: 120,
    connections: [0],
  });
  draw();
}

/**
 * Draws a note
 */
function drawNote(item, ctx) {
  ctx.fillStyle = "#fff8dc";
  ctx.fillRect(item.x, item.y, item.w, item.h);

  ctx.strokeStyle = "#333";
  ctx.strokeRect(item.x, item.y, item.w, item.h);

  ctx.fillStyle = "#000";
  ctx.font = "14px monospace";
  ctx.fillText(item.text, item.x + 8, item.y + 24);
}

/**
 * Draw lines between nodes
 */
function drawConnections(ctx) {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  for (const node of nodes) {
    const connections = node.connections;
    for (const connection of connections) {
      const a = node;
      const b = nodes[connection];

      ctx.beginPath();
      ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2);
      ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2);
      ctx.stroke();
    }
  }
}

/**
 * Check if item is clicked by mouse
 */
function hit(item, mx, my) {
  return mx >= item.x && mx <= item.x + item.w && my >= item.y && my <= item.y + item.h;
}

/**
 * Draw loop
 */
function draw() {
  const canvas = document.getElementById("area");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections(ctx);
  for (const item of nodes) {
    drawNote(item, ctx);
  }
}

/**
 * Resize canvas to current window height and width
 */
function resize() {
  const canvas = document.getElementById("area");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.getElementById("topnav").offsetHeight;
  draw();
}

/**
 * Runs on load of window, and activates main logic
 */
function load() {
  resize();
  const canvas = document.getElementById("area");
  let selected = null;
  let offsetX = 0;
  let offsetY = 0;
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = nodes.length - 1; i >= 0; i--) {
      if (hit(nodes[i], mx, my)) {
        selected = nodes[i];
        offsetX = mx - selected.x;
        offsetY = my - selected.y;
        break;
      }
    }
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!selected) return;

    const rect = canvas.getBoundingClientRect();
    selected.x = e.clientX - rect.left - offsetX;
    selected.y = e.clientY - rect.top - offsetY;
    draw();
  });
  canvas.addEventListener("mouseup", () => {
    selected = null;
  });
}

window.onload = load;
