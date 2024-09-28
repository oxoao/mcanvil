var anvilSolver = {};

class Item {
  constructor(id, name, enchants, misc) {
    this.id = id;
    this.name = name;
    this.enchants = enchants;
    this.misc = misc;
  }
}

class Enchantment {
  constructor(
    id,
    name,
    maxLevel,
    multItem,
    multBook,
    exclusivitySets = [],
    cursed = false,
  ) {
    this.id = id;
    this.name = name;
    this.maxLevel = maxLevel;
    this.multItem = multItem;
    this.multBook = multBook;
    this.exclusivitySets = exclusivitySets;
    this.cursed = cursed;
  }
  hasExclusivity() {
    return !!this.exclusivitySets.length;
  }
}

var _enchants = [
  new Enchantment("binding_curse", "Curse of Binding", 1, 8, 4, [], true),
  new Enchantment("vanishing_curse", "Curse of Vanishing", 1, 8, 4, [], true),
  new Enchantment("riptide", "Riptide", 3, 4, 2, [6]),
  new Enchantment("channeling", "Channeling", 1, 8, 4, [6]),
  new Enchantment("wind_burst", "Wind Burst", 3, 4, 2),
  new Enchantment("frost_walker", "Frost Walker", 2, 4, 2, [3]),
  new Enchantment("sharpness", "Sharpness", 5, 1, 1, [1]),
  new Enchantment("smite", "Smite", 5, 2, 1, [1]),
  new Enchantment("bane_of_arthropods", "Bane of Arthropods", 5, 2, 1, [1]),
  new Enchantment("impaling", "Impaling", 5, 4, 2),
  new Enchantment("power", "Power", 5, 1, 1),
  new Enchantment("density", "Density", 5, 2, 1, [1]),
  new Enchantment("breach", "Breach", 4, 4, 2, [1]),
  new Enchantment("piercing", "Piercing", 4, 1, 1, [5]),
  new Enchantment("sweeping_edge", "Sweeping Edge", 3, 4, 2),
  new Enchantment("multishot", "Multishot", 1, 4, 2, [5]),
  new Enchantment("fire_aspect", "Fire Aspect", 2, 4, 2),
  new Enchantment("flame", "Flame", 1, 4, 2),
  new Enchantment("knockback", "Knockback", 2, 2, 1),
  new Enchantment("punch", "Punch", 2, 4, 2),
  new Enchantment("protection", "Protection", 4, 1, 1, [0]),
  new Enchantment("blast_protection", "Blast Protection", 4, 4, 2, [0]),
  new Enchantment("fire_protection", "Fire Protection", 4, 2, 1, [0]),
  new Enchantment("projectile_protection", "Projectile Protection", 4, 2, 1, [0]),
  new Enchantment("feather_falling", "Feather Falling", 4, 2, 1),
  new Enchantment("fortune", "Fortune", 3, 4, 2, [2]),
  new Enchantment("looting", "Looting", 3, 4, 2),
  new Enchantment("silk_touch", "Silk Touch", 1, 8, 4, [2]),
  new Enchantment("luck_of_the_sea", "Luck of the Sea", 3, 4, 2),
  new Enchantment("efficiency", "Efficiency", 5, 1, 1),
  new Enchantment("quick_charge", "Quick Charge", 3, 2, 1),
  new Enchantment("lure", "Lure", 3, 4, 2),
  new Enchantment("respiration", "Respiration", 3, 4, 2),
  new Enchantment("aqua_affinity", "Aqua Affinity", 1, 4, 2),
  new Enchantment("soul_speed", "Soul Speed", 3, 8, 4),
  new Enchantment("swift_sneak", "Swift Sneak", 3, 8, 4),
  new Enchantment("depth_strider", "Depth Strider", 3, 4, 2, [3]),
  new Enchantment("thorns", "Thorns", 3, 8, 4),
  new Enchantment("loyalty", "Loyalty", 3, 1, 1, [6]),
  new Enchantment("unbreaking", "Unbreaking", 3, 2, 1),
  new Enchantment("infinity", "Infinity", 1, 8, 4, [4]),
  new Enchantment("mending", "Mending", 1, 4, 2, [4]),
];

var _exclusivitySets = (function () {
  const a = [];
  for (let i = 0; i < _enchants.length; i++) {
    const e = _enchants[i];
    const sets = e.exclusivitySets;
    for (const set of sets) {
      if (a[set] === undefined) a[set] = [];
      a[set].push(i);
    }
  }
  return a;
})();

var _eitems = [
  new Item("helmet", "Helmet", [0, 1, 20, 21, 22, 23, 32, 33, 37, 39, 41], false),
  new Item("chestplate", "Chestplate", [0, 1, 20, 21, 22, 23, 37, 39, 41], false),
  new Item("leggings", "Leggings", [0, 1, 20, 21, 22, 23, 35, 37, 39, 41], false),
  new Item("boots", "Boots", [0, 1, 5, 20, 21, 22, 23, 24, 34, 36, 37, 39, 41], false),
  new Item("turtle_shell", "Turtle Shell", [0, 1, 20, 21, 22, 23, 32, 33, 37, 39, 41], true),
  new Item("sword", "Sword", [1, 6, 7, 8, 14, 16, 18, 26, 39, 41], false),
  new Item("axe", "Axe", [1, 6, 7, 8, 25, 27, 29, 39, 41], false),
  new Item("pickaxe", "Pickaxe", [1, 25, 27, 29, 39, 41], false),
  new Item("shovel", "Shovel", [1, 25, 27, 29, 39, 41], false),
  new Item("hoe", "Hoe", [1, 25, 27, 29, 39, 41], false),
  new Item("shears", "Shears", [1, 29, 39, 41], true),
  new Item("fishing_rod", "Fishing Rod", [1, 28, 31, 39, 41], true),
  new Item("bow", "Bow", [1, 10, 17, 19, 39, 40, 41], false),
  new Item("flint_and_steel", "Flint and Steel", [1, 39, 41], true),
  new Item("carrot_on_a_stick", "Carrot on a Stick", [1, 39, 41], true),
  new Item("warped_fungus_on_a_stick", "Warped Fungus on a Stick", [1, 39, 41], true),
  new Item("shield", "Shield", [1, 39, 41], false),
  new Item("elytra", "Elytra", [0, 1, 39, 41], false),
  new Item("trident", "Trident", [2, 1, 3, 9, 38, 39, 41], false),
  new Item("crossbow", "Crossbow", [1, 13, 15, 30, 39, 41], false),
  new Item("carved_pumpkin", "Carved Pumpkin", [0, 1], true),
  new Item("player_head", "Head", [0, 1], true),
  new Item("compass", "Compass", [1], true),
  new Item("recovery_compass", "Recovery Compass", [1], true),
  new Item("mace", "Mace", [1, 4, 7, 8, 11, 12, 16, 39, 41], false),
  new Item("brush", "Brush", [1, 39, 41], true),
  new Item("book", "Book", [], true),
];
(function (a) {
  for (let i = 0; i < _enchants.length; i++) a[i] = i;
})(_eitems[26].enchants);

class AnvilItem {
  constructor(u, e) {
    this.u = u;
    this.e = e;
  }
}

class _Node {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

class ItemNode extends _Node {
  constructor(a, b, anvilItem, enchants, width, x, y, item) {
    super(a, b);
    this.anvilItem = anvilItem;
    this.enchants = enchants;
    this.width = width;
    this.x = x;
    this.y = y;
    this.item = item;
  }

  enchantNames() {
    let name = "";
    for (const e of this.enchants) {
      let enchant = _enchants[e[0]];
      let level = e[1];
      let showLevel = enchant.maxLevel > 1;
      name += enchant.name + (showLevel ? " " + _numerals(level) : "") + "\n";
    }
    return name;
  }
}

function _numerals(n) {
  if (n < 1 || n > 5) return n;
  const a = ["I", "II", "III", "IV", "V"];
  return a[n - 1];
}

function height(n) {
  return n === null ? 0 : Math.max(height(n.a), height(n.b)) + 1;
}

function getcol(h) {
  if (h === 1) {
    return 1;
  }
  return getcol(h - 1) * 2 + 1;
}

function mapTreeR(k, itemNodes, perm, tree, h, steps) {
  const leaf = tree.a === null;
  if (leaf) {
    const i = perm[k[0]];
    const itemNode = itemNodes[i];
    itemNode.x = k[0]++ + 0.5;
    itemNode.y = h;
    return itemNode;
  }

  const l = mapTreeR(k, itemNodes, perm, tree.a, h + 1, steps);
  const r = mapTreeR(k, itemNodes, perm, tree.b, h + 1, steps);

  const [anvilItem, cost, lvls] = combine(l.anvilItem, r.anvilItem);
  steps.push([l, r, cost, lvls]);
  const enchants = l.enchants.concat(r.enchants);
  enchants.sort(function (a, b) {
    return a[0] - b[0];
  });
  const width = l.width + r.width;
  const x = (l.x + r.x) / 2;
  return new ItemNode(l, r, anvilItem, enchants, width, x, h, l.item);
}

function mapTree(itemNodes, tree, perm) {
  const steps = [];
  return [mapTreeR([0], itemNodes, perm, tree, 0.5, steps), steps];
}

function printTreeR(m, tree, col, row, height, maxCol) {
  const leaf = tree.a === null;
  if (leaf) {
    m[row * maxCol + col] = true;
    return;
  }
  const childOffset = Math.floor(Math.pow(2, height - 2));
  printTreeR(m, tree.a, col - childOffset, row + 1, height - 1, maxCol);
  printTreeR(m, tree.b, col + childOffset, row + 1, height - 1, maxCol);
  m[row * maxCol + col] = true;
}

function printTree(tree) {
  const h = height(tree);
  const col = getcol(h);
  const m = new Array(h * col);
  printTreeR(m, tree, Math.floor(col / 2), 0, h, col);
  let output = "";
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < col; j++) {
      output += m[i * col + j] ? ". " : "  ";
    }
    output += "\n";
  }
  console.log(output);
}

function treeGen(n, cache = []) {
  if (cache[n] !== undefined) {
    return cache[n];
  }
  if (n === 1) {
    const nn = [new _Node(null, null)];
    cache[1] = nn;
    return nn;
  }
  const nn = [];
  for (let i = 1; i <= n / 2; i++) {
    const a = treeGen(n - i, cache);
    const b = treeGen(i, cache);
    for (let j = 0; j < a.length; j++) {
      for (let k = 0; k < b.length; k++) {
        nn.push(new _Node(a[j], b[k]));
      }
    }
  }
  cache[n] = nn;
  return nn;
}

function swap(a, i, j) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}

function priorWork(u) {
  return Math.pow(2, u) - 1;
}

function totalXP(n) {
  if (n < 17) return n * n + 6 * n;
  else if (n < 32) return 2.5 * n * n - 40.5 * n + 360;
  else return 4.5 * n * n - 162.5 * n + 2220;
}

function combine(a, b) {
  const l = priorWork(a.u) + priorWork(b.u) + b.e;
  const cost = totalXP(l);
  const c = new AnvilItem(Math.max(a.u, b.u) + 1, a.e + b.e);
  return [c, cost, l];
}

function combineR(a, b, tree, k) {
  const l = tree.a;
  const r = tree.b;

  if (l === null) {
    return [b[0], 0];
  }
  let left;
  let right;
  let totalCost = 0;
  if (l.a === null) {
    const j = a[k[0]++];
    left = b[j];
  } else {
    const x = combineR(a, b, l, k);
    left = x[0];
    totalCost += x[1];
  }
  if (r.a === null) {
    const j = a[k[0]++];
    right = b[j];
  } else {
    const x = combineR(a, b, r, k);
    right = x[0];
    totalCost += x[1];
  }
  const y = combine(left, right);
  totalCost += y[1];
  return [y[0], totalCost];
}

function permSort(a, b, tree) {
  const n = a.length;
  
  let bestCost = combineR(a, b, tree, [0])[1];
  
  for (;;) {
    let swapped = false;
    
    for (let i = 0; i < n; i++) {
      let bestSlot = 0;
      
      for (let j = i; j < n; j++) {
        if (j !== i && i !== 0 && j !== 0) {
          swap(a, i, j);
          const costJ = combineR(a, b, tree, [0])[1];
          swap(a, i, j);
          if (costJ < bestCost) {
            bestCost = costJ;
            bestSlot = j;
            swapped = true;
          }
        }
      }
      if (bestSlot !== 0) {
        swap(a, i, bestSlot);
      }
    }
    if (!swapped) {
      break;
    }
  }
  return bestCost;
}

function contrib(tree, c, a) {
  if (tree.a === null) {
    a.push(c);
    return;
  }
  contrib(tree.a, c, a);
  contrib(tree.b, c + 1, a);
}

function optimalPerm(startItems, tree, bestCost) {
  const len = startItems.length;
  const a = new Array(len);
  for (let i = 0; i < len; i++) a[i] = i;

  const b = [];
  contrib(tree, 0, b);

  a.sort(function (a, b) {
    return b[a] < b[b] ? -1 : b[a] > b[b] ? 1 : 0;
  });

  let lowerLimit = totalPwp(tree)[0];
  for (let i = 1; i < a.length; i++)
    lowerLimit += totalXP(startItems[a[i]].e) * b[i];
  if (lowerLimit >= bestCost) {
    return [null, Number.MAX_VALUE];
  }

  return [a, permSort(a, startItems, tree)];
}

function totalPwp(tree) {
  if (tree.a === null) {
    return [0, 0];
  }
  const [xpLeft, ul] = totalPwp(tree.a);
  const [xpRight, ur] = totalPwp(tree.b);
  const pw = priorWork(ul) + priorWork(ur);
  const xp = xpLeft + xpRight + totalXP(pw);
  const u = Math.max(ul, ur) + 1;
  return [xp, u];
}

function _solve(startItems, minimiseU) {
  const startPerm = new Array(startItems.length);
  for (let i = 0; i < startItems.length; i++) startPerm[i] = i;
  startPerm.sort(function (a, b) { return startItems[a].e < startItems[b].e ? -1 : startItems[a].e > startItems[b].e ? 1 : 0; });
  startItems.sort(function (a, b) { return a.e - b.e; });

  const n = startItems.length;
  const trees = treeGen(n);
  trees.sort(function (a, b) { return height(b) - height(a); });
  let bestTree;
  let bestCost = Number.MAX_VALUE;
  let bestPerm;

  for (let i = trees.length - 1; i >= 0; i--) {
    const tree = trees[i];

    if (bestTree != null && height(tree) > height(bestTree) + (minimiseU ? 0 : 1))
      break;
    const [perm, cost] = optimalPerm(startItems, tree, bestCost);

    if (cost < bestCost) {
      bestTree = tree;
      bestCost = cost;
      bestPerm = perm;
    }
  }

  const tej = [];
  for (let i in startItems) {
    tej[i] = startPerm[bestPerm[i]];
  }
  bestPerm = tej;

  return [bestTree, bestPerm, bestCost];
}
