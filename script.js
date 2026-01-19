// Constants
const NOTE_BACKGROUND_COLOR = "#fff8dc";
const NOTE_OUTLINE_COLOR = "#333333";
const NOTE_TEXT_COLOR = "#000000";
const NOTE_FONT = "14px monospace";
const DEFAULT_NODE_HEIGHT = 120;
const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_X = 400;
const DEFAULT_NODE_Y = 200;
const canvas = document.getElementById("area");
const overlay = document.querySelector(".overlay");
const modal = document.querySelector(".modal");
const input = document.getElementById("text");

let nodes = [];
let projectname = "New Evidence Board";
let idcounter = 0;

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

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/**
 * Save current evidence to localstorage
 */
function saveLS() {
  if (!nodes) nodes = [];
  let newNodes = nodes;
  for (const node of newNodes) {
    node.el = null;
  }
  const s = JSON.stringify(newNodes);
  localStorage.setItem("nodes", s);
  localStorage.setItem("name", projectname);
}

/**
 * Save current evidence to computer
 */
function saveDisk() {
  if (!nodes) nodes = [];
  let newNodes = nodes;
  for (const node of newNodes) {
    node.el = null;
  }
  const s = JSON.stringify(newNodes);
  const filename = `${projectname.replace(/\s+/g, "_") || "project"}.json`;
  download(s, filename);
  console.log("Download attempted:", filename);
}

/**
 * Load current evidence from localstorage
 */
function loadLS() {
  nodes = JSON.parse(localStorage.getItem("nodes") || "[]");
  for (const node of nodes) {
    node.el = null;
  }
  idcounter = nodes[nodes.length - 1].id;
  projectname = localStorage.getItem("name") || projectname;
  draw();
  document.getElementById("projectname").value = projectname;
}

function submitFile() {
  return new Promise((resolve) => {
    const f = document.getElementById("file");

    f.onchange = () => {
      const file = f.files[0];

      const reader = new FileReader();

      reader.onload = (e) => {
        resolve([file.name, e.target.result]);
      };

      reader.readAsText(file);
    };

    f.click();
  });
}

/**
 * Load current evidence from computer
 */
async function loadDisk() {
  const [filename, content] = await submitFile();
  nodes = JSON.parse(content);
  for (const node of nodes) {
    node.el = null;
  }
  idcounter = nodes[nodes.length - 1].id;
  projectname = filename.slice(0, -5);
  draw();
  document.getElementById("projectname").value = projectname;
}

function openForm() {
  overlay.hidden = false;
  modal.hidden = false;
  input.focus();
}

function closeForm() {
  overlay.hidden = true;
  modal.hidden = true;
}

/**
 * Add a node
 */
function add() {
  closeForm();
  const text = document.getElementById("text");
  const t = text.value;
  text.value = "";
  const background = document.getElementById("bg");
  const bg = background.value;
  background.value = NOTE_BACKGROUND_COLOR;
  const border = document.getElementById("bd");
  const bd = border.value;
  border.value = NOTE_OUTLINE_COLOR;
  textcolor = document.getElementById("tc");
  const tc = textcolor.value;
  textcolor.value = NOTE_TEXT_COLOR;

  nodes.push({
    type: "note", // TODO: add other types eg. images
    id: idcounter + 1,
    text: t,
    x: DEFAULT_NODE_X,
    y: DEFAULT_NODE_Y,
    w: DEFAULT_NODE_WIDTH,
    h: DEFAULT_NODE_HEIGHT,
    c: bg,
    b: bd,
    t: tc,
    el: null,
    connections: [],
  });
  idcounter++;
  draw();
}

function renderWrappingTextToCanvas(item) {
  console.log(item);
  if (item.el) {
    if (item.el.innerHTML != item.text) item.el.innerHTML = item.text;
    item.el.style.top = item.y + document.getElementById("topnav").offsetHeight + "px";
    item.el.style.left = item.x + "px";
  } else {
    item.el = document.createElement("span");
    item.el.style = `padding: 2px; font-size: 14px; word-wrap: break-word; font-family: monospace, monospace; position: absolute; width: ${item.w}px; height: ${item.h}px; pointer-events:none; background-color: ${item.c}; border: 2px solid ${item.b}; color: ${item.t}; `;
    item.el.id = `${item.id}`;
    item.el.innerHTML = item.text;
    item.el.style.top = item.y + document.getElementById("topnav").offsetHeight + "px";
    item.el.style.left = item.x + "px";
    document.body.appendChild(item.el);
  }
}

/**
 * Draws a note
 * TODO: add other types eg. images
 */
function drawNote(ctx, item) {
  //ctx.fillStyle = NOTE_BACKGROUND_COLOR;
  //ctx.fillRect(item.x, item.y, item.w, item.h);

  //ctx.strokeStyle = NOTE_OUTLINE_COLOR;
  //ctx.strokeRect(item.x, item.y, item.w, item.h);

  renderWrappingTextToCanvas(item);
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
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); //*NOTE: this only clears the view, so when moving around is implemented, wont work
  drawConnections(ctx); //*                                  actually, it might work but im not sure
  for (const item of nodes) {
    drawNote(ctx, item);
  }
}

/**
 * Resize canvas to current window height and width
 */
function resize(/*NO ARGS*/) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.getElementById("topnav").offsetHeight;
  draw();
}

/**
 * Runs on load of window, and activates main logic
 */
function load() {
  resize();
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
      if (!lastclicked.connections.includes(nodes.indexOf(node))) {
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
