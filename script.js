let nodes = [];
let projectname = "New Evidence Board";

/**
 * Download file to disk
 * Stolen from graphile/crystal by Benjie lolol
 */
function download(contents, filename, type = "application/json") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  // Append temporarily to body and click
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Delay revoke for safety
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Save current evidence to localstorage
 */
function saveLS() {
  const s = JSON.stringify(nodes);
  localStorage.setItem("nodes", s);
  localStorage.setItem("name", projectname);
}

/**
 * Save current evidence to computer
 */
function saveDisk() {
  if (!nodes) nodes = [];
  const s = JSON.stringify(nodes, null, 2); // pretty JSON
  const filename = `${projectname.replace(/\s+/g, "_") || "project"}.json`;
  download(s, filename);
  console.log("Download attempted:", filename);
}

/**
 * Load current evidence from localstorage
 */
function loadLS() {
  nodes = JSON.parse(localStorage.getItem("nodes") || "[]");
  projectname = localStorage.getItem("name") || projectname;
  draw();
  document.getElementById("projectname").value = projectname;
}

/**
 * Load current evidence from computer
 */
function loadDisk() {
  const f = document.getElementById("file");
  f.click();
  f.addEventListener("change", () => {
    const file = f.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      filecontent = e.target.result;
      console.log(filecontent);
      nodes = JSON.parse(filecontent);
      projectname = file.name.slice(0, -5);
      draw();
      document.getElementById("projectname").value = projectname;
    };
    reader.readAsText(file);
  });
}

/**
 * Add a node
 */
function add() {
  const t = prompt("Note?");
  nodes.push({
    type: "note",
    text: t,
    x: 400,
    y: 200,
    w: 220,
    h: 120,
    connections: [],
  });
  draw();
}

/**
 * Draws a note
 */
function drawNote(ctx, item) {
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

  for (const a of nodes) {
    const connections = a.connections;
    for (const node of connections) {
      b = nodes[node];
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
    drawNote(ctx, item);
  }
}

/**
 * Resize canvas to current window height and width
 */
function resize(/*NO ARGS*/) {
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
  document.getElementById("projectname").value = projectname;
  let selected = null;
  let dragging = false;
  let lastclicked = null;
  let offsetX = 0;
  let offsetY = 0;
  let mx = 0;
  let my = 0;
  canvas.addEventListener("mousedown", (e) => {
    dragging = false;
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;

    let node = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (hit(nodes[i], mx, my)) {
        node = nodes[i];
        break;
      }
    }
    if (!node) return;

    selected = node;
    offsetX = mx - selected.x;
    offsetY = my - selected.y;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!selected) return;

    if (!dragging) {
      if (Math.abs(e.clientX - mx) + Math.abs(e.clientY - my) > 6) {
        dragging = true;
      }
    }
    if (dragging) {
      const rect = canvas.getBoundingClientRect();
      selected.x = e.clientX - rect.left - offsetX;
      selected.y = e.clientY - rect.top - offsetY;
      draw();
    }
  });
  canvas.addEventListener("mouseup", () => {
    if (!selected) return;
    if (!dragging) toggleConnection(selected);
    selected = null;
  });
  window.addEventListener("resize", resize);
  document.getElementById("projectname").addEventListener("change", () => {
    projectname = document.getElementById("projectname").value;
  });
  function toggleConnection(node) {
    if (node != lastclicked && lastclicked != null) {
      if (!lastclicked.connections.includes(node)) {
        lastclicked.connections.push(nodes.indexOf(node));
        node.connections.push(nodes.indexOf(lastclicked));
      } else {
        lastclicked.connections.splice(lastclicked.connections.indexOf(nodes.indexOf(node)), 1);
        node.connections.splice(node.connections.indexOf(nodes.indexOf(lastclicked)), 1);
      }
      lastclicked = null;
      draw();
    } else lastclicked = node;
  }
}

window.onload = load;
