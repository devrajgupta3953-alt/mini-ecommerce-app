// Step 2: Define the product data array (8 products with numeric prices, categories, and imageText)
const products = [
  {
    id: 1,
    name: "Dot-Grid Engineering Notebook",
    price: 120,
    category: "Stationery",
    code: "NB-01",
    imageText: "A5 hardcover 160gsm dot-grid notebook for UI wireframes and architecture notes."
  },
  {
    id: 2,
    name: "Precision Gel Pen Pack (Set of 5)",
    price: 80,
    category: "Stationery",
    code: "PN-02",
    imageText: "0.5mm quick-dry archival black and blue technical pens for daily sketching."
  },
  {
    id: 3,
    name: "Braided USB-C Fast Data Cable",
    price: 250,
    category: "Cables & Power",
    code: "CB-03",
    imageText: "2-meter 100W Power Delivery nylon-braided cable with reinforced aluminum connectors."
  },
  {
    id: 4,
    name: "Ergonomic Memory-Foam Wrist Rest",
    price: 350,
    category: "Desk Setup",
    code: "WR-04",
    imageText: "Anti-slip keyboard wrist cushion with breathable mesh cover for long coding sessions."
  },
  {
    id: 5,
    name: "LED Architect Desk Lamp",
    price: 650,
    category: "Lighting",
    code: "DL-05",
    imageText: "Flicker-free eye-care LED work lamp with 3 color temperatures and touch dimmer."
  },
  {
    id: 6,
    name: "Foldable Aluminum Laptop Stand",
    price: 899,
    category: "Desk Setup",
    code: "LS-06",
    imageText: "6-angle anodized alloy riser stand designed for optimal posture and airflow."
  },
  {
    id: 7,
    name: "7-in-1 USB-C Multiport Hub",
    price: 1250,
    category: "Cables & Power",
    code: "HB-07",
    imageText: "4K HDMI output, Gigabit Ethernet, SD/TF card reader, and 3 high-speed USB 3.0 ports."
  },
  {
    id: 8,
    name: "Wireless Mechanical Macro Keypad",
    price: 1499,
    category: "Peripherals",
    code: "MK-08",
    imageText: "Hot-swappable tactile mechanical switches with dual-mode Bluetooth and USB-C."
  }
];

function formatINR(amount) {
  return Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
  });
}

function loadCart() {
  try {
    var raw = localStorage.getItem("cart");
    if (!raw) return {};
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    var clean = {};
    Object.keys(parsed).forEach(function (id) {
      var qty = Number(parsed[id]);
      var exists = products.find(function (p) { return p.id === Number(id); });
      if (exists && Number.isInteger(qty) && qty > 0) {
        clean[id] = qty;
      }
    });
    return clean;
  } catch (err) {
    return {};
  }
}

var cart = loadCart();
var activeCategory = "All";

var catalogEl = document.getElementById("catalog");
var catalogCountEl = document.getElementById("catalog-count");
var categoryButtons = document.querySelectorAll(".cat-btn");

var cartBodyEl = document.getElementById("cart-body");
var cartTableWrapEl = document.getElementById("cart-table-wrap");
var emptyCartMsgEl = document.getElementById("empty-cart-msg");
var subtotalEl = document.getElementById("subtotal");
var deliveryEl = document.getElementById("delivery");
var deliveryNoteEl = document.getElementById("delivery-note");
var totalEl = document.getElementById("total");
var headerCartCountEl = document.getElementById("header-cart-count");
var cartItemsBadgeEl = document.getElementById("cart-items-badge");
var checkoutBtn = document.getElementById("checkout-btn");
var clearCartBtn = document.getElementById("clear-cart-btn");
var orderFeedbackEl = document.getElementById("order-feedback");

var checkoutModal = document.getElementById("checkout-modal");
var modalItemsBodyEl = document.getElementById("modal-items-body");
var modalSubtotalEl = document.getElementById("modal-subtotal");
var modalDeliveryEl = document.getElementById("modal-delivery");
var modalTotalEl = document.getElementById("modal-total");
var closeModalBtn = document.getElementById("close-modal-btn");
var cancelModalBtn = document.getElementById("cancel-modal-btn");
var confirmDemoBtn = document.getElementById("confirm-demo-btn");

// Step 4: Cart state operations keyed by product id
function addToCart(id) {
  var product = products.find(function (x) { return x.id === Number(id); });
  if (!product) return;
  cart[id] = (cart[id] || 0) + 1;
  save();
}

function changeQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) {
    delete cart[id];
  }
  save();
}

function removeItem(id) {
  delete cart[id];
  save();
}

// Step 5: Calculate subtotal, delivery fee (₹40 if subtotal > 0 && subtotal < 500), and grand total using reduce
function totals() {
  var subtotal = Object.keys(cart).reduce(function (sum, id) {
    var p = products.find(function (x) { return x.id === Number(id); });
    return p ? sum + p.price * cart[id] : sum;
  }, 0);

  var itemCount = Object.keys(cart).reduce(function (sum, id) {
    return sum + (cart[id] || 0);
  }, 0);

  var delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;
  return {
    subtotal: subtotal,
    delivery: delivery,
    total: subtotal + delivery,
    count: itemCount
  };
}

function save() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    // Safely ignore storage errors in private browsing mode
  }
  render();
}

// Step 3: Render product catalogue dynamically from the products array
function renderCatalog() {
  if (!catalogEl) return;
  catalogEl.innerHTML = "";

  var filtered = activeCategory === "All"
    ? products
    : products.filter(function (p) { return p.category === activeCategory; });

  if (catalogCountEl) {
    catalogCountEl.textContent = "Showing " + filtered.length + (filtered.length === 1 ? " item" : " items");
  }

  filtered.forEach(function (product) {
    var card = document.createElement("article");
    card.className = "product-card";

    var topGroup = document.createElement("div");

    var visualBox = document.createElement("div");
    visualBox.className = "product-visual";

    var visualTop = document.createElement("div");
    visualTop.className = "visual-top";

    var codeSpan = document.createElement("span");
    codeSpan.className = "product-code";
    codeSpan.textContent = product.code;

    var catSpan = document.createElement("span");
    catSpan.className = "product-category";
    catSpan.textContent = product.category;

    visualTop.append(codeSpan, catSpan);

    var imgTextP = document.createElement("p");
    imgTextP.className = "product-img-text";
    imgTextP.textContent = product.imageText;

    visualBox.append(visualTop, imgTextP);

    var titleEl = document.createElement("h3");
    titleEl.className = "product-title";
    titleEl.textContent = product.name;

    topGroup.append(visualBox, titleEl);

    var footer = document.createElement("div");
    footer.className = "product-footer";

    var priceEl = document.createElement("p");
    priceEl.className = "product-price";
    priceEl.textContent = formatINR(product.price);

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-cart";
    addBtn.dataset.action = "add-to-cart";
    addBtn.dataset.id = String(product.id);
    var inCartQty = cart[product.id] || 0;
    addBtn.textContent = inCartQty > 0 ? "Add to cart (" + inCartQty + ")" : "Add to cart";

    footer.append(priceEl, addBtn);
    card.append(topGroup, footer);
    catalogEl.appendChild(card);
  });
}

// Step 6: Render the shopping cart table and totals
function render() {
  renderCatalog();

  var t = totals();
  var cartIds = Object.keys(cart);

  if (headerCartCountEl) {
    headerCartCountEl.textContent = String(t.count);
  }
  if (cartItemsBadgeEl) {
    cartItemsBadgeEl.textContent = t.count + (t.count === 1 ? " item" : " items");
  }

  cartBodyEl.innerHTML = "";

  if (cartIds.length === 0) {
    emptyCartMsgEl.hidden = false;
    cartTableWrapEl.hidden = true;
    checkoutBtn.disabled = true;
    clearCartBtn.disabled = true;
  } else {
    emptyCartMsgEl.hidden = true;
    cartTableWrapEl.hidden = false;
    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;

    cartIds.forEach(function (id) {
      var p = products.find(function (x) { return x.id === Number(id); });
      if (!p) return;
      var qty = cart[id];
      var lineTotal = p.price * qty;

      var tr = document.createElement("tr");

      var nameTd = document.createElement("td");
      var nameSpan = document.createElement("span");
      nameSpan.className = "cart-item-name";
      nameSpan.textContent = p.name;

      var unitSpan = document.createElement("span");
      unitSpan.className = "cart-item-unit";
      unitSpan.textContent = formatINR(p.price) + " each";
      nameTd.append(nameSpan, unitSpan);

      var qtyTd = document.createElement("td");
      var qtyWrap = document.createElement("div");
      qtyWrap.className = "qty-controls";

      var decBtn = document.createElement("button");
      decBtn.type = "button";
      decBtn.className = "qty-btn";
      decBtn.dataset.cartAction = "dec";
      decBtn.dataset.id = String(p.id);
      decBtn.setAttribute("aria-label", "Decrease quantity of " + p.name);
      decBtn.textContent = "−";

      var qtyVal = document.createElement("span");
      qtyVal.className = "qty-val";
      qtyVal.textContent = String(qty);

      var incBtn = document.createElement("button");
      incBtn.type = "button";
      incBtn.className = "qty-btn";
      incBtn.dataset.cartAction = "inc";
      incBtn.dataset.id = String(p.id);
      incBtn.setAttribute("aria-label", "Increase quantity of " + p.name);
      incBtn.textContent = "+";

      qtyWrap.append(decBtn, qtyVal, incBtn);
      qtyTd.appendChild(qtyWrap);

      var lineTd = document.createElement("td");
      lineTd.className = "num-col";
      lineTd.textContent = formatINR(lineTotal);

      var removeTd = document.createElement("td");
      removeTd.className = "action-col";
      var remBtn = document.createElement("button");
      remBtn.type = "button";
      remBtn.className = "remove-btn";
      remBtn.dataset.cartAction = "remove";
      remBtn.dataset.id = String(p.id);
      remBtn.setAttribute("aria-label", "Remove " + p.name + " from cart");
      remBtn.textContent = "×";
      removeTd.appendChild(remBtn);

      tr.append(nameTd, qtyTd, lineTd, removeTd);
      cartBodyEl.appendChild(tr);
    });
  }

  subtotalEl.textContent = formatINR(t.subtotal);
  deliveryEl.textContent = formatINR(t.delivery);
  totalEl.textContent = formatINR(t.total);

  if (deliveryNoteEl) {
    if (t.subtotal === 0) {
      deliveryNoteEl.textContent = "Orders of ₹500 or more qualify for FREE delivery.";
    } else if (t.subtotal < 500) {
      var remaining = 500 - t.subtotal;
      deliveryNoteEl.textContent = "Add " + formatINR(remaining) + " more to unlock FREE delivery!";
    } else {
      deliveryNoteEl.textContent = "Free delivery unlocked (saved ₹40.00)!";
    }
  }
}

// Step 7: Populate and open the <dialog> checkout preview modal
function openCheckoutPreview() {
  var t = totals();
  if (t.count === 0) return;

  modalItemsBodyEl.innerHTML = "";
  Object.keys(cart).forEach(function (id) {
    var p = products.find(function (x) { return x.id === Number(id); });
    if (!p) return;
    var qty = cart[id];

    var tr = document.createElement("tr");

    var tdName = document.createElement("td");
    tdName.textContent = p.name;

    var tdQty = document.createElement("td");
    tdQty.textContent = String(qty);

    var tdUnit = document.createElement("td");
    tdUnit.className = "num-col";
    tdUnit.textContent = formatINR(p.price);

    var tdSub = document.createElement("td");
    tdSub.className = "num-col";
    tdSub.textContent = formatINR(p.price * qty);

    tr.append(tdName, tdQty, tdUnit, tdSub);
    modalItemsBodyEl.appendChild(tr);
  });

  modalSubtotalEl.textContent = formatINR(t.subtotal);
  modalDeliveryEl.textContent = t.delivery === 0 ? "FREE (₹0.00)" : formatINR(t.delivery);
  modalTotalEl.textContent = formatINR(t.total);

  if (checkoutModal && typeof checkoutModal.showModal === "function") {
    checkoutModal.showModal();
  } else if (checkoutModal) {
    checkoutModal.setAttribute("open", "open");
  }
}

function closeCheckoutPreview() {
  if (checkoutModal && typeof checkoutModal.close === "function") {
    checkoutModal.close();
  } else if (checkoutModal) {
    checkoutModal.removeAttribute("open");
  }
}

// Event Listeners
catalogEl.addEventListener("click", function (e) {
  var btn = e.target.closest("[data-action='add-to-cart']");
  if (!btn) return;
  if (orderFeedbackEl) {
    orderFeedbackEl.classList.remove("visible");
  }
  addToCart(Number(btn.dataset.id));
});

cartBodyEl.addEventListener("click", function (e) {
  var btn = e.target.closest("[data-cart-action]");
  if (!btn) return;
  var id = Number(btn.dataset.id);
  var action = btn.dataset.cartAction;

  if (action === "inc") {
    changeQuantity(id, 1);
  } else if (action === "dec") {
    changeQuantity(id, -1);
  } else if (action === "remove") {
    removeItem(id);
  }
});

categoryButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    activeCategory = btn.getAttribute("data-category") || "All";
    categoryButtons.forEach(function (b) {
      var isSelected = b === btn;
      b.classList.toggle("active", isSelected);
      b.setAttribute("aria-pressed", String(isSelected));
    });
    renderCatalog();
  });
});

checkoutBtn.addEventListener("click", openCheckoutPreview);

clearCartBtn.addEventListener("click", function () {
  cart = {};
  save();
});

closeModalBtn.addEventListener("click", closeCheckoutPreview);
cancelModalBtn.addEventListener("click", closeCheckoutPreview);

confirmDemoBtn.addEventListener("click", function () {
  var t = totals();
  closeCheckoutPreview();
  cart = {};
  save();
  if (orderFeedbackEl) {
    orderFeedbackEl.textContent =
      "Demo Order Confirmed! Summarised " + t.count + " item(s) totaling " + formatINR(t.total) + " (Demonstration only — no payment was charged).";
    orderFeedbackEl.classList.add("visible");
  }
});

render();
