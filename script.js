// --- CONFIGURATION & DATABASE SIMULATION ---
const DEFAULT_RATES = {
  flexNormal: { range1: 15, range2: 12, range3: 10, range4: 7.5, bulk: 7 },
  starFlex: { base: 20, bulk: 18 },
  vinylNormal: { base: 30, bulk: 25 },
  vinylOneWay: 45,
  vinylReflective: 50,
  clearMatte: 30,
  clearGlossy: 30,
};

let RATES = JSON.parse(localStorage.getItem("pk_rates")) || DEFAULT_RATES;

// --- User Database Simulation ---
function getUsers() {
  return JSON.parse(localStorage.getItem("pk_users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("pk_users", JSON.stringify(users));
}

function generateId(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

const PRODUCTS = [
  {
    id: "flexNormal",
    name: "Flex Normal",
    category: "Flex",
    type: "tiered",
    desc: "Standard banner material",
    img: "https://cdn.dotpe.in/longtail/store-items/5486466/9ETy9xoa.jpeg",
  },
  {
    id: "starFlex",
    name: "Star Flex",
    category: "Flex",
    type: "tiered",
    desc: "Premium heavy duty",
    img: "https://cpimg.tistatic.com/7550376/b/4/star-flex-media.jpg",
  },
  {
    id: "vinylNormal",
    name: "Vinyl Normal",
    category: "Vinyl",
    type: "tiered",
    desc: "Standard adhesive vinyl",
    img: "https://octangle.co.za/wp-content/uploads/2025/05/Custom-Vinyl-Sticker-Printing.webp",
  },
  {
    id: "vinylOneWay",
    name: "Vinyl OneWay",
    category: "Vinyl",
    type: "fixed",
    desc: "Perforated window film",
    img: "https://image.made-in-china.com/202f0j00kIWcCJdsPHbj/Affordable-Window-Film-One-Way-Vision-Vinyl-with-Special-Material-Made-Surface.webp",
  },
  {
    id: "vinylReflective",
    name: "Vinyl Reflective",
    category: "Vinyl",
    type: "fixed",
    desc: "High visibility reflective",
    img: "https://weallight.com/wp-content/uploads/2018/11/Reflective-Outdoor-Vinyl.jpg",
  },
  {
    id: "clearMatte",
    name: "Clear Matte",
    category: "Clear Sheet",
    type: "fixed",
    desc: "Non-glare lamination",
    img: "https://www.maizey.co.za/wp-content/uploads/2023/04/self-adhesive-vinyl-avery-frosted-glass.jpg",
  },
  {
    id: "clearGlossy",
    name: "Clear Glossy",
    category: "Clear Sheet",
    type: "fixed",
    desc: "High shine lamination",
    img: "https://www.greatk2.com/uploads/202025332/optically-clear-printable-vinyl18250826580.jpg",
  },
];

// --- State ---
let state = {
  cart: [],
  activeCategory: "All",
  searchQuery: "",
  user: null,
  activeProduct: null,
};

// --- Navigation ---
function navigateTo(pageId) {
  // Hide all pages
  document
    .querySelectorAll(".page-section")
    .forEach((el) => el.classList.add("hidden"));

  // Show target page
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  } else {
    // If page doesn't exist, show 404 page
    document.getElementById('not-found-page').classList.remove('hidden');
  }

  // Clear active product when leaving detail page
  if (state.activeProduct && pageId !== "product-detail") {
    state.activeProduct = null;
  }

  // Page-specific render functions
  if (pageId === "cart") renderCart();
  if (pageId === "admin") renderAdminPanel();
  if (pageId === "profile") renderProfilePage();
  if (pageId === "orders") renderOrdersPage();
  if (pageId === "faq") renderFaqPage();

  // Scroll to top on every navigation
  window.scrollTo(0, 0);
}

// --- Auth Logic ---
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const isAdmin = email === "admin@printvan.com";
  const password = document.getElementById("loginPassword").value;

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  state.user = user;

  document.getElementById("loginBtn").classList.add("hidden");
  document.getElementById("userProfile").classList.remove("hidden");
  document.getElementById("userName").textContent = state.user.name;
  document.getElementById("userCompany").textContent = state.user.company;

  if (state.user.role === "admin") {
    document.getElementById("adminBtn").classList.remove("hidden");
  }

  navigateTo("home");
}

function handleRegister(e) {
  e.preventDefault();
  const users = getUsers();
  const newUser = {
    id: generateId(),
    name: document.getElementById("regName").value,
    company: document.getElementById("regCompany").value,
    email: document.getElementById("regEmail").value,
    phone: document.getElementById("regPhone").value,
    password: document.getElementById("regPassword").value,
    role: "dealer",
  };

  if (users.some((u) => u.email === newUser.email)) {
    alert("An account with this email already exists.");
    return;
  }

  users.push(newUser);
  saveUsers(users);
  alert("Registration successful! Please login.");
  navigateTo("login");
}

let otpSession = {}; // Temporary store for OTP flow

function handleForgotPassword(e) {
  e.preventDefault();
  const phone = document.getElementById("forgotPhone").value;
  const users = getUsers();
  const user = users.find((u) => u.phone === phone);

  if (!user) {
    alert("No account found with this mobile number.");
    return;
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpSession = { email: user.email, otp: otp };

  // Simulate sending OTP
  alert(`Your OTP is: ${otp}`);
  navigateTo("verify-otp");
}

function handleVerifyOtp(e) {
  e.preventDefault();
  const enteredOtp = document.getElementById("otpInput").value;
  if (enteredOtp === otpSession.otp) {
    navigateTo("reset-password");
  } else {
    alert("Invalid OTP. Please try again.");
  }
}

function handleResetPassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById("resetPassword").value;
  let users = getUsers();
  const userIndex = users.findIndex((u) => u.email === otpSession.email);

  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
    alert("Password has been reset successfully. Please login.");
    otpSession = {}; // Clear session
    navigateTo("login");
  } else {
    alert("An error occurred. Please try again.");
  }
}

function renderProfilePage() {
  if (!state.user) return;
  document.getElementById("profileId").value = state.user.id;
  document.getElementById("profileName").value = state.user.name;
  document.getElementById("profileCompany").value = state.user.company;
  document.getElementById("profileEmail").value = state.user.email;
}

function handleUpdateProfile(e) {
  e.preventDefault();
  let users = getUsers();
  const userIndex = users.findIndex((u) => u.id === state.user.id);

  users[userIndex].name = document.getElementById("profileName").value;
  users[userIndex].company = document.getElementById("profileCompany").value;

  saveUsers(users);
  state.user = users[userIndex]; // Update state
  alert("Profile updated successfully!");
  logout(); // Force re-login to see changes in header
}

function logout() {
  state.user = null;
  document.getElementById("loginBtn").classList.remove("hidden");
  document.getElementById("userProfile").classList.add("hidden");
  document.getElementById("adminBtn").classList.add("hidden");
  navigateTo("home");
}

function handleDeleteAccount() {
  if (
    confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    )
  ) {
    let users = getUsers();
    const updatedUsers = users.filter((u) => u.id !== state.user.id);
    saveUsers(updatedUsers);
    alert("Account deleted successfully.");
    logout();
  }
}

// --- Login Prompt Modal ---
function showLoginPrompt() {
  document.getElementById("login-prompt-modal").classList.remove("hidden");
}

function hideLoginPrompt() {
  document.getElementById("login-prompt-modal").classList.add("hidden");
}

// --- Cart Logic ---
function addToCart(item) {
  state.cart.push(item);
  updateCartBadge();
  alert(`${item.product.name} added to cart!`);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (state.cart.length > 0) {
    badge.textContent = state.cart.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  container.innerHTML = "";

  let subtotal = 0;

  if (state.cart.length === 0) {
    container.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
  } else {
    state.cart.forEach((item, index) => {
      subtotal += parseFloat(item.total);
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
                <div>
                    <h4>${item.product.name}</h4>
                    <small class="text-muted">${item.width} ${item.unit} x ${item.height} ${item.unit} (${item.sqft} sqft)</small>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:bold">₹${item.total}</div>
                    <button onclick="removeFromCart(${index})" style="color:red;border:none;background:none;cursor:pointer;font-size:0.8rem">Remove</button>
                </div>
            `;
      container.appendChild(div);
    });
  }

  const total = subtotal;

  document.getElementById("cartSubtotal").textContent =
    `₹${subtotal.toFixed(2)}`;
  document.getElementById("cartTotal").textContent = `₹${total.toFixed(2)}`;
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

function switchPaymentMethod(method, element) {
  // Update tabs
  document
    .querySelectorAll(".method")
    .forEach((el) => el.classList.remove("active"));
  element.classList.add("active");

  // Hide all fields
  document.getElementById("card-fields").classList.add("hidden");
  document.getElementById("upi-fields").classList.add("hidden");
  document.getElementById("netbanking-fields").classList.add("hidden");

  // Reset required attributes
  document
    .querySelectorAll("#card-fields input")
    .forEach((i) => (i.required = false));
  document
    .querySelectorAll("#upi-fields input")
    .forEach((i) => (i.required = false));

  // Show selected and set required
  if (method === "card") {
    document.getElementById("card-fields").classList.remove("hidden");
    document
      .querySelectorAll("#card-fields input")
      .forEach((i) => (i.required = true));
  } else if (method === "upi") {
    document.getElementById("upi-fields").classList.remove("hidden");
    document
      .querySelectorAll("#upi-fields input")
      .forEach((i) => (i.required = true));
  } else if (method === "netbanking") {
    document.getElementById("netbanking-fields").classList.remove("hidden");
  }
}

function handlePayment(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = "Processing Order...";
  btn.disabled = true;

  // Save Order
  const orders = JSON.parse(localStorage.getItem("pk_orders")) || [];
  const newOrder = {
    id: generateId(8),
    date: new Date().toLocaleString(),
    items: state.cart,
    total: document.getElementById("cartTotal").textContent,
    userEmail: state.user ? state.user.email : "guest",
  };
  orders.push(newOrder);
  localStorage.setItem("pk_orders", JSON.stringify(orders));

  setTimeout(() => {
    alert("Payment Successful! Order Placed.");
    state.cart = [];
    updateCartBadge();
    navigateTo("home");
    btn.textContent = originalText;
    btn.disabled = false;
  }, 2000);
}

function renderOrdersPage() {
  const container = document.getElementById("ordersList");
  container.innerHTML = "";

  const allOrders = JSON.parse(localStorage.getItem("pk_orders")) || [];
  // Filter orders for current user
  const userOrders = state.user
    ? allOrders.filter((o) => o.userEmail === state.user.email)
    : [];

  if (userOrders.length === 0) {
    container.innerHTML = '<div class="text-muted">No past orders found.</div>';
    return;
  }

  userOrders.reverse().forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "card p-4 mb-4";

    let itemsHtml = order.items
      .map(
        (item) => `
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem;border-bottom:1px solid #eee;padding-bottom:0.5rem;">
                <span>${item.product.name} <span class="text-muted">(${item.width}x${item.height} ${item.unit})</span></span>
                <span>₹${item.total}</span>
            </div>
        `,
      )
      .join("");

    orderCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:1rem;border-bottom:1px solid #e2e8f0;padding-bottom:0.5rem;">
                <div>
                    <span style="font-weight:bold;color:var(--primary)">#${order.id}</span>
                    <div class="text-muted" style="font-size:0.8rem">${order.date}</div>
                </div>
                <div style="font-weight:bold;font-size:1.1rem">${order.total}</div>
            </div>
            <div>${itemsHtml}</div>
        `;
    container.appendChild(orderCard);
  });
}

// --- Unit Conversion ---
function convertToFeet(val, unit) {
  const v = parseFloat(val) || 0;
  if (unit === "in") return v / 12;
  if (unit === "cm") return v / 30.48;
  if (unit === "mm") return v / 304.8;
  if (unit === "m") return v * 3.28084;
  return v; // default ft
}

// --- Logic Engine ---
function calculatePrice(productId, widthFeet, heightFeet) {
  const w = parseFloat(widthFeet) || 0;
  const h = parseFloat(heightFeet) || 0;
  const sqft = parseFloat((w * h).toFixed(2));

  let rate = 0;
  let isDiscounted = false;

  switch (productId) {
    case "flexNormal": {
      const r = RATES.flexNormal;
      if (sqft <= 12) {
        rate = r.range1;
      } else if (sqft <= 30) {
        rate = r.range2;
        isDiscounted = true;
      } else if (sqft <= 50) {
        rate = r.range3;
        isDiscounted = true;
      } else if (sqft <= 100) {
        rate = r.range4;
        isDiscounted = true;
      } else {
        rate = r.bulk;
        isDiscounted = true;
      }
      break;
    }
    case "starFlex": {
      const r = RATES.starFlex;
      if (sqft <= 20) {
        rate = r.base;
      } else {
        rate = r.bulk;
        isDiscounted = true;
      }
      break;
    }
    case "vinylNormal": {
      const r = RATES.vinylNormal;
      if (sqft <= 12) {
        rate = r.base;
      } else {
        rate = r.bulk;
        isDiscounted = true;
      }
      break;
    }
    default: {
      rate = RATES[productId] || 0;
      isDiscounted = false;
      break;
    }
  }

  return {
    sqft,
    rate,
    total: (sqft * rate).toFixed(2),
    isDiscounted,
  };
}

// --- Render Functions ---
function renderCategories() {
  const container = document.getElementById("categoryFilters");
  if (!container) return;

  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

  container.innerHTML = categories
    .map(
      (cat) => `
        <button class="cat-btn ${state.activeCategory === cat ? "active" : ""}" 
                onclick="setCategory('${cat}')">
            ${cat}
        </button>
    `,
    )
    .join("");
}

function renderProducts() {
  const productGrid = document.getElementById("productGrid");
  productGrid.innerHTML = "";

  // Filter Logic
  const filtered = PRODUCTS.filter((p) => {
    const matchesCat =
      state.activeCategory === "All" || p.category === state.activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0)
    productGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#64748b">No products found matching your criteria.</div>';

  filtered.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    // Simplified HTML for product card on homepage
    card.innerHTML = `
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-content">
                <div class="product-title">
                    <h3>${product.name}</h3>
                    <div class="product-desc">${product.desc}</div>
                </div>
            </div>
            <div class="product-footer">
                <button class="btn-primary full-width" onclick="handleProductClick('${product.id}')">
                    View Details & Pricing
                </button>
            </div>
        `;

    productGrid.appendChild(card);
  });

  // Re-initialize icons for new elements
  if (window.lucide) lucide.createIcons();
}

function setCategory(cat) {
  state.activeCategory = cat;
  renderCategories();
  renderProducts();
}

function handleSearch(e) {
  state.searchQuery = e.target.value;
  renderProducts();
  lucide.createIcons();
}

function handleProductClick(productId) {
  if (state.user) {
    renderProductDetailPage(productId);
    navigateTo("product-detail");
  } else {
    showLoginPrompt();
  }
}

function renderProductDetailPage(productId) {
  state.activeProduct = PRODUCTS.find((p) => p.id === productId);
  if (!state.activeProduct) return;

  const product = state.activeProduct;
  const container = document.getElementById("productDetailContent");

  container.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-detail-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="card">
                <div class="product-content">
                    <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${product.name}</h2>
                    <p class="text-muted" style="margin-bottom: 2rem;">${product.desc}</p>
                    
                    <div class="product-inputs">
                        <div class="input-group">
                            <label>Width</label>
                            <input type="number" id="detail-w" placeholder="0" oninput="updateDetailPage()">
                        </div>
                        <div class="input-group">
                            <label>Height</label>
                            <input type="number" id="detail-h" placeholder="0" oninput="updateDetailPage()">
                        </div>
                        <div class="input-group">
                            <label>Unit</label>
                            <select id="detail-u" onchange="updateDetailPage()">
                                <option value="ft" selected>ft</option>
                                <option value="m">m</option>
                                <option value="in">in</option>
                                <option value="cm">cm</option>
                                <option value="mm">mm</option>
                            </select>
                        </div>
                    </div>

                    <div class="sqft-view">
                        <span>Calculated Area:</span>
                        <span id="detail-view-sqft" class="sqft-value">0.00 sqft</span>
                    </div>

                    <div class="rate-display">
                        <span>Rate:</span>
                        <span id="detail-rate" class="rate-value">₹0/sqft</span>
                    </div>
                    
                    <div id="detail-badge" class="bulk-badge invisible">
                        <i data-lucide="trending-down"></i> Bulk Price Applied
                    </div>
                </div>

                <div class="product-footer">
                    <div class="price-row">
                        <span id="detail-sqft" class="product-desc">0 sqft</span>
                        <span id="detail-total" class="total-price">₹0.00</span>
                    </div>
                    <button class="btn-add" id="detail-btn-add" disabled onclick="addToCartFromDetailPage()">
                        <i data-lucide="shopping-cart"></i> Add to Order
                    </button>
                </div>
            </div>
        </div>
    `;
  lucide.createIcons();
  updateDetailPage(); // Initial calculation/state update
}

function updateDetailPage() {
  if (!state.activeProduct) return;
  const id = state.activeProduct.id;

  const wVal = document.getElementById(`detail-w`).value;
  const hVal = document.getElementById(`detail-h`).value;
  const unit = document.getElementById(`detail-u`).value;

  const wFt = convertToFeet(wVal, unit);
  const hFt = convertToFeet(hVal, unit);

  const calc = calculatePrice(id, wFt, hFt);

  // Update UI Elements
  document.getElementById(`detail-rate`).textContent = `₹${calc.rate}/sqft`;
  document.getElementById(`detail-sqft`).textContent = `${calc.sqft} sqft`;
  document.getElementById(`detail-view-sqft`).textContent = `${calc.sqft} sqft`;
  document.getElementById(`detail-total`).textContent = `₹${calc.total}`;

  const badge = document.getElementById(`detail-badge`);
  if (calc.isDiscounted) badge.classList.remove("invisible");
  else badge.classList.add("invisible");

  const btn = document.getElementById(`detail-btn-add`);
  btn.disabled = calc.sqft <= 0;

  const rateSpan = document.getElementById(`detail-rate`);
  if (calc.isDiscounted) rateSpan.classList.add("discounted");
  else rateSpan.classList.remove("discounted");
}

function addToCartFromDetailPage() {
  if (!state.activeProduct) return;
  const product = state.activeProduct;
  const id = product.id;

  const wVal = document.getElementById(`detail-w`).value;
  const hVal = document.getElementById(`detail-h`).value;
  const unit = document.getElementById(`detail-u`).value;

  const wFt = convertToFeet(wVal, unit);
  const hFt = convertToFeet(hVal, unit);
  const calc = calculatePrice(id, wFt, hFt);

  const item = {
    id: Date.now(),
    product: product,
    width: wVal,
    height: hVal,
    unit: unit,
    sqft: calc.sqft,
    rate: calc.rate,
    total: calc.total,
  };

  addToCart(item);
  navigateTo("home"); // Go back to products after adding to cart
}

// --- Admin Logic ---
function renderAdminPanel() {
  const container = document.getElementById("adminRatesContainer");
  container.innerHTML = "";

  // Helper to create input
  const createInput = (key, val, parentKey = null) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    const label = parentKey ? `${parentKey} - ${key}` : key;
    const id = parentKey ? `admin-${parentKey}-${key}` : `admin-${key}`;

    wrapper.innerHTML = `
            <label style="text-transform:capitalize">${label.replace(/([A-Z])/g, " $1")}</label>
            <input type="number" id="${id}" value="${val}" step="0.1">
        `;
    return wrapper;
  };

  for (const [key, value] of Object.entries(RATES)) {
    if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value)) {
        container.appendChild(createInput(subKey, subValue, key));
      }
    } else {
      container.appendChild(createInput(key, value));
    }
  }
}

function saveAdminRates() {
  const newRates = JSON.parse(JSON.stringify(RATES)); // Deep copy

  for (const [key, value] of Object.entries(newRates)) {
    if (typeof value === "object") {
      for (const subKey of Object.keys(value)) {
        const input = document.getElementById(`admin-${key}-${subKey}`);
        if (input) newRates[key][subKey] = parseFloat(input.value);
      }
    } else {
      const input = document.getElementById(`admin-${key}`);
      if (input) newRates[key] = parseFloat(input.value);
    }
  }

  RATES = newRates;
  localStorage.setItem("pk_rates", JSON.stringify(RATES));
  alert("Rates updated successfully!");
  renderProducts(); // Refresh UI with new rates
}

function resetRates() {
  if (confirm("Reset all rates to default?")) {
    RATES = JSON.parse(JSON.stringify(DEFAULT_RATES));
    localStorage.setItem("pk_rates", JSON.stringify(RATES));
    renderAdminPanel();
    renderProducts();
  }
}

// --- FAQ Data & Logic ---
const FAQS = [
    {
        q: "What is the turnaround time for orders?",
        a: "Standard orders are typically processed and shipped within 2-3 business days. Bulk orders may require additional time. You will receive an email notification once your order is shipped."
    },
    {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 1 hour of placement. Due to the custom nature of our products, we cannot cancel orders once they have entered the production phase. Please see our Cancellation Policy for more details."
    },
    {
        q: "What file formats do you accept for designs?",
        a: "We recommend high-resolution PDF, AI, or EPS files for the best quality. We also accept high-quality JPG and PNG files. Ensure all text is converted to outlines to avoid font issues."
    },
    {
        q: "Do you offer design services?",
        a: "Currently, we are a print-only service and do not offer design services. You must provide a print-ready file for your order."
    },
    {
        q: "What is your return policy?",
        a: "We do not accept returns on custom-printed items. However, if there is a manufacturing defect or your order is incorrect, please contact us within 24 hours of delivery with photographic evidence, and we will arrange for a reprint or refund."
    }
];

function renderFaqPage() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = FAQS.map((faq, index) => `
        <div class="faq-item" id="faq-${index}">
            <div class="faq-question" onclick="toggleFaq(${index})">
                <span>${faq.q}</span>
                <i data-lucide="plus" class="icon"></i>
            </div>
            <div class="faq-answer">
                <p>${faq.a}</p>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function toggleFaq(index) {
    const item = document.getElementById(`faq-${index}`);
    if (item) {
        item.classList.toggle('active');
    }
}

// --- Scroll to Top Logic ---
function handleScroll() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;
    if (window.scrollY > 300) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}
window.addEventListener('scroll', handleScroll);

// --- Three.js Background ---
function initThreeBackground() {
  const container = document.getElementById("canvas-container");
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Create floating particles
  const geometry = new THREE.BufferGeometry();
  const count = 600;
  const posArray = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 25;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  const material = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x1e293b, // Dark blue/slate
    transparent: true,
    opacity: 0.8,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    renderer.render(scene, camera);
  };

  animate();
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --- Init ---
renderCategories();
renderProducts();
initThreeBackground();
lucide.createIcons();

// --- Policies Logic ---
const POLICIES = {
  terms: {
    title: "Terms & Conditions",
    content: `
      <p class="text-muted">Last updated: October 2024</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">1. Introduction</h4>
      <p>Welcome to PrintVaan. These Terms and Conditions govern your use of our website and services. By accessing or using our services, you agree to be bound by these terms.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">2. Dealer Accounts</h4>
      <p>To access wholesale pricing, you must register as a dealer. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">3. Orders & Payments</h4>
      <p>All orders are subject to acceptance. Prices are subject to change without notice based on raw material costs. Payment must be completed via the available methods (Card, UPI, Net Banking) before production begins.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">4. Limitation of Liability</h4>
      <p>PrintVaan shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
    `,
  },
  privacy: {
    title: "Privacy Policy",
    content: `
      <p class="text-muted">Last updated: October 2024</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">1. Information We Collect</h4>
      <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact support. This includes your name, company details, email, and phone number.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">2. How We Use Your Information</h4>
      <p>We use your information to process orders, communicate with you regarding order status, and improve our services. We do not sell your personal data to third parties.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">3. Data Security</h4>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
    `,
  },
  refund: {
    title: "Refund & Cancellation Policy",
    content: `
      <p class="text-muted">Last updated: October 2024</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">1. Order Cancellation</h4>
      <p>Orders can only be cancelled within 1 hour of placement. Once production has started, orders cannot be cancelled due to the customized nature of the products.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">2. Returns & Refunds</h4>
      <p>We do not accept returns for custom printed materials (Flex, Vinyl, etc.) as they are made to specific dimensions. However, if you receive a defective or incorrect item, please contact us within 24 hours of delivery with photographic evidence.</p>
      <h4 style="margin-top:1rem;margin-bottom:0.5rem;">3. Resolution</h4>
      <p>If a defect is verified by our quality team, we will reprint the order at no additional cost or provide a refund to your original payment method within 5-7 business days.</p>
    `,
  },
};

function showPolicy(type) {
  const policy = POLICIES[type];
  if (!policy) return;

  const container = document.getElementById("policy-content");
  if (container) {
    container.innerHTML = `
      <h2 class="section-title">${policy.title}</h2>
      <div class="policy-body" style="color: #475569;">
        ${policy.content}
      </div>
    `;
  }
  navigateTo("policies");
}
