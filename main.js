var canvasEle;
var itemSelector;
var inputMisc;
var inputMinimiseUses;
var inputIncompatible;
var inputAutoCalc;
var solutionTable;
var level = [].fill.call({ length: _enchants.length }, -1);

function onLoad() {
  cacheDOM();
  createEnchantControls();
  populateItemSelector();
  addEvents();
}

function cacheDOM() {
  canvasEle = document.getElementById("canvas");
  itemSelector = document.getElementById("item-selector");
  inputMisc = document.getElementById("input-misc");
  inputMinimiseUses = document.getElementById("input-minimise-uses");
  inputIncompatible = document.getElementById("input-incompatible");
  inputAutoCalc = document.getElementById("input-auto-calc");
  solutionTable = document.getElementById("solution-table");
}

function addEvents() {
  document.getElementById("btn-calc").addEventListener("click", calculate);
  document.getElementById("btn-toggle-all").addEventListener("click", toggleAll);
  itemSelector.addEventListener("change", toggleItem);
  inputMisc.addEventListener("change", populateItemSelector);
  inputMinimiseUses.addEventListener("change", calculate);
  inputAutoCalc.addEventListener("change", function () {
    if (this.checked) calculate();
  });
  inputIncompatible.addEventListener("change", function () {
    if (!this.checked) filterExclusiveAll();
  });
}

function toggleAll() {
  let shouldToggle = true;
  for (let i = 0; i < _enchants.length; i++) {
    if (level[i] !== -1) {
      shouldToggle = false;
      const activeBtn = document.getElementById("e" + i + "l" + level[i]);
      activeBtn.classList.remove("selected");
      level[i] = -1;
    }
  }
  if (shouldToggle) {
    for (let i = 0; i < _enchants.length; i++) {
      const enchant = _enchants[i];
      const maxL = enchant.maxLevel - 1;
      const maxBtn = document.getElementById("e" + i + "l" + maxL);
      maxBtn.classList.add("selected");
      level[i] = maxL;
    }
  }
  filterExclusiveAll();
  if (inputAutoCalc.checked) calculate();
}

function filterExclusiveAll() {
  if (inputIncompatible.checked) return;

  const item = getSelectedItem();
  const eIndices = item.enchants;

  for (let i = 0; i < eIndices.length; i++) {
    const e = eIndices[i];
    const enchant = _enchants[e];

    const isActive = level[e] !== -1;
    if (isActive && enchant.hasExclusivity()) filterExclusive(e);
  }
}

function filterExclusive(e) {
  const enchant = _enchants[e];
  if (enchant.exclusivitySets.length > 1) return;
  if (inputIncompatible.checked) return;

  for (const set of enchant.exclusivitySets) {
    const setEnchants = _exclusivitySets[set];
    for (let i = 0; i < setEnchants.length; i++) {
      const j = setEnchants[i];
      const setEnchant = _enchants[j];
      const tridentSet = set === 6;
      const isRiptide = enchant === _enchants[2];
      const setRiptide = setEnchant === _enchants[2];
      if (!tridentSet || isRiptide || setRiptide) {
        const l = level[j];
        if (j !== e && l !== -1) {
          const activeBtn = document.getElementById("e" + j + "l" + l);
          activeBtn.classList.remove("selected");
          level[j] = -1;
        }
      }
    }
  }
}

function toggleLevel(e, l) {
  filterExclusive(e);

  const cur = level[e];
  const toggledOn = cur !== l;
  const activeBtn = document.getElementById("e" + e + "l" + cur);
  if (toggledOn) {
    if (cur !== -1) {
      activeBtn.classList.remove("selected");
    }
    document.getElementById("e" + e + "l" + l).classList.add("selected");
    level[e] = l;
  } else {
    activeBtn.classList.remove("selected");
    level[e] = -1;
  }
  if (inputAutoCalc.checked) calculate();
}

function toggleItem() {
  for (let i = 0; i < _enchants.length; i++) {
    document.getElementById("r" + i).style.display = "none";
  }

  const item = getSelectedItem();
  const eIndices = item.enchants;

  const exSetCount = new Array(_exclusivitySets.length).fill(0);
  for (let i = 0; i < eIndices.length; i++) {
    const enchant = _enchants[eIndices[i]];
    if (enchant.hasExclusivity()) {
      for (const set of enchant.exclusivitySets) {
        exSetCount[set]++;
      }
    }
  }

  for (let i = 0; i < eIndices.length; i++) {
    const enchant = _enchants[eIndices[i]];
    const row = document.getElementById("r" + eIndices[i]);
    row.style.display = "";

    if (enchant.hasExclusivity() && !enchant.cursed) {
      let possibleConflicts = false;
      for (const set of enchant.exclusivitySets) {
        if (exSetCount[set] > 1) possibleConflicts = true;
        break;
      }
      if (possibleConflicts) {
        row.classList.add("exclusive-tr");
      } else {
        row.classList.remove("exclusive-tr");
      }
    }
  }

  filterExclusiveAll();
  if (inputAutoCalc.checked) calculate();
}

class TreeNode {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

function drawNode(ctx, n, u) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(n.x, n.y, n.r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("" + u, n.x - 5, n.y + 9);
  ctx.restore();
}

function drawArrow(ctx, ax, ay, bx, by) {
  const headSize = 5;
  ctx.save();

  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  ctx.translate(bx, by);
  ctx.rotate(Math.atan2(dy, dx));

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-len, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headSize, -headSize);
  ctx.lineTo(-headSize, headSize);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function populateItemSelector() {
  const j = getSelectedItemI();

  for (a in itemSelector.options) {
    itemSelector.options.remove(0);
  }
  const showMisc = inputMisc.checked;
  for (let i = 0; i < _eitems.length; i++) {
    const item = _eitems[i];
    if (showMisc || !item.misc) {
      const option = document.createElement("option");
      option.text = item.name;
      itemSelector.add(option);
    }
  }

  const k = getSelectedItemI();
  const selectionChanged = j !== k;
  if (selectionChanged) toggleItem();
}

function createEnchantControls() {
  for (let i = 0; i < _enchants.length; i++) {
    const et = document.getElementById("etable");
    const row = et.insertRow(-1);
    row.setAttribute("id", "r" + i);
    const cell = [
      row.insertCell(0),
      row.insertCell(1),
      row.insertCell(2),
      row.insertCell(3),
    ];

    const enchant = _enchants[i];
    cell[0].innerHTML = enchant.name;
    if (enchant.cursed) {
      row.classList.add("cursed-tr");
    }

    for (let j = 0; j < enchant.maxLevel; j++) {
      const y = document.createElement("button");
      y.innerHTML = _numerals(j + 1);
      y.classList += "level-btn";
      y.setAttribute("id", "e" + i + "l" + j);
      y.setAttribute("onclick", `toggleLevel(${i},${j})`);
      cell[1].appendChild(y);
      cell[2].innerHTML = enchant.multBook;
      cell[3].innerHTML = enchant.multItem;
    }
  }
}

function getSelectedItemI() {
  const itemName = itemSelector.value;
  return _eitems
    .map(function (e) {
      return e.name;
    })
    .indexOf(itemName);
}

function getSelectedItem() {
  const index = getSelectedItemI();
  return _eitems[index];
}

function genItemList() {
  const itemNodes = [];
  const item = getSelectedItem();
  itemNodes.push(
    new ItemNode(null, null, new AnvilItem(0, 0), [], 1, 0, 0, item),
  );
  const enchantIndices = item.enchants;
  for (const i of enchantIndices) {
    const l = level[i];
    if (l !== -1) {
      const enchant = _enchants[i];
      const e = enchant.multBook * (l + 1);
      const itemNode = new ItemNode(
        null,
        null,
        new AnvilItem(0, e),
        [[i, l + 1]],
        1,
        0,
        0,
        _eitems[26],
      );
      itemNodes.push(itemNode);
    }
  }
  return itemNodes;
}

function drawNodeR(ctx, n, nodeSize) {
  const colour = "#5cb45c";
  const leafColour = "#328f32";
  const leaf = n.a === null;
  const nx = n.x * nodeSize;
  const ny = n.y * nodeSize;

  ctx.fillStyle = leaf ? leafColour : colour;
  drawNode(ctx, new TreeNode(nx, ny, nodeSize / 2), n.anvilItem.u);

  if (leaf) return;

  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  const lx = n.a.x * nodeSize;
  const ly = n.a.y * nodeSize;
  let [ex, ey] = nodeIntersection(nx, ny, lx, ly, nodeSize / 2);
  drawArrow(ctx, lx, ly, ex, ey);
  const rx = n.b.x * nodeSize;
  const ry = n.b.y * nodeSize;
  [ex, ey] = nodeIntersection(nx, ny, rx, ry, nodeSize / 2);
  drawArrow(ctx, rx, ry, ex, ey);

  drawNodeR(ctx, n.a, nodeSize);
  drawNodeR(ctx, n.b, nodeSize);
}

function drawTree(itemNodes, tree, perm, root) {
  const ctx = canvasEle.getContext("2d");
  let canvasWidth = canvasEle.width;
  let canvasHeight = canvasEle.height;
  ctx.reset();
  const padding = [0, 0];
  canvasWidth -= padding[0] * 2;
  canvasHeight -= padding[1] * 2;

  const nodeSize = Math.min(
    canvasWidth / itemNodes.length,
    canvasHeight / height(tree),
  );
  drawNodeR(ctx, root, nodeSize);
}

function itemImage(item) {
  const path = "images/" + item.id + ".gif";
  const img = document.createElement("IMG");
  img.setAttribute("src", path);
  img.setAttribute("width", "32");
  img.setAttribute("height", "32");
  img.setAttribute("alt", item.name);
  return img;
}

function stepItem(cell, itemNode) {
  cell.classList.add("step-item");

  const img = itemImage(itemNode.item);
  img.classList.add("step-sub");
  cell.appendChild(img);


  const enchants = document.createElement("div");
  enchants.innerHTML += itemNode.enchantNames();
  enchants.classList.add("step-sub");
  cell.appendChild(enchants);
}

function updateSteps(steps, delta, cost) {
  solutionTable.innerHTML = "";
  const head = solutionTable.insertRow(-1).insertCell(0);
  head.colSpan = 5;
  head.innerHTML = `Solved in ${delta}ms using ${cost}XP`;
  for (let i = 0; i < steps.length;) {
    const [l, r, cost, lvls] = steps[i];

    const row = solutionTable.insertRow(-1);
    const c0 = row.insertCell(-1);
    c0.classList.add("step");
    c0.innerHTML = ++i + ". Combine";

    stepItem(row.insertCell(-1), l);

    const c2 = row.insertCell(-1);
    c2.innerHTML = "with";
    c2.classList.add("step");

    stepItem(row.insertCell(-1), r);

    const c4 = row.insertCell(-1);
    c4.innerHTML = lvls + " Levels";
    c4.classList.add("step");
    const c5 = row.insertCell(-1);
    c5.innerHTML = "(" + cost + " XP)";
    c5.classList.add("step");
  }
}

function updateSolution(itemNodes, tree, perm, delta, cost, minimiseU) {
  const [root, steps] = mapTree(itemNodes, tree, perm);
  drawTree(itemNodes, tree, perm, root);
  updateSteps(steps, delta, cost);
  document.getElementById("solution-title").innerHTML = "Solution (optimal XP" + (minimiseU ? ", minimal anvil uses" : "") + ")";
}

function nodeIntersection(ax, ay, bx, by, r) {
  const dx = ax - bx;
  const dy = ay - by;
  const rr = r / Math.sqrt(dx * dx + dy * dy);
  const ex = ax - rr * dx;
  const ey = ay - rr * dy;
  return [ex, ey];
}

function validateInput(startItems) {
  const itemLimit = 16;
  return startItems.length > itemLimit
    ? confirm(
        `Combining more than ${itemLimit} items. Are you sure you wish to continue?`,
      )
    : true;
}

function calculate() {
  const itemNodes = genItemList();

  const startItems = [];
  for (let n of itemNodes) {
    startItems.push(n.anvilItem);
  }

  if (!validateInput(startItems)) {
    return;
  }
  const startTime = performance.now();
  const minimiseU = inputMinimiseUses.checked;
  const [tree, perm, cost] = _solve(startItems, minimiseU);
  const endTime = performance.now();
  const delta = Math.floor(endTime - startTime);
  updateSolution(itemNodes, tree, perm, delta, cost, minimiseU);
}

function withinNode(n, e) {
  const target = canvasEle.getBoundingClientRect();
  const y = e.clientY - target.top - n.y;
  const x = e.clientX - target.left - n.x;
  const dist = Math.sqrt(y * y + x * x);
  return dist < n.r;
}

onLoad();
