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

let RATES = JSON.parse(localStorage.getItem('pk_rates')) || DEFAULT_RATES;

// --- User Database Simulation ---
function getUsers() {
  return JSON.parse(localStorage.getItem('pk_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('pk_users', JSON.stringify(users));
}

function generateId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

const PRODUCTS = [
  {
    id: "flexNormal",
    name: "Flex Normal",
    type: "tiered",
    desc: "Standard banner material",
    img: "https://cdn.dotpe.in/longtail/store-items/5486466/9ETy9xoa.jpeg",
  },
  {
    id: "starFlex",
    name: "Star Flex",
    type: "tiered",
    desc: "Premium heavy duty",
    img: "https://cpimg.tistatic.com/7550376/b/4/star-flex-media.jpg",
  },
  {
    id: "vinylNormal",
    name: "Vinyl Normal",
    type: "tiered",
    desc: "Standard adhesive vinyl",
    img: "https://octangle.co.za/wp-content/uploads/2025/05/Custom-Vinyl-Sticker-Printing.webp",
  },
  {
    id: "vinylOneWay",
    name: "Vinyl OneWay",
    type: "fixed",
    desc: "Perforated window film",
    img: "https://image.made-in-china.com/202f0j00kIWcCJdsPHbj/Affordable-Window-Film-One-Way-Vision-Vinyl-with-Special-Material-Made-Surface.webp",
  },
  {
    id: "vinylReflective",
    name: "Vinyl Reflective",
    type: "fixed",
    desc: "High visibility reflective",
    img: "https://weallight.com/wp-content/uploads/2018/11/Reflective-Outdoor-Vinyl.jpg",
  },
  {
    id: "clearMatte",
    name: "Clear Matte",
    type: "fixed",
    desc: "Non-glare lamination",
    img: "https://www.maizey.co.za/wp-content/uploads/2023/04/self-adhesive-vinyl-avery-frosted-glass.jpg",
  },
  {
    id: "clearGlossy",
    name: "Clear Glossy",
    type: "fixed",
    desc: "High shine lamination",
    img: "https://www.greatk2.com/uploads/202025332/optically-clear-printable-vinyl18250826580.jpg",
  },
];

// --- State ---
let state = {
  cart: [],
  user: null,
};

// --- Navigation ---
function navigateTo(pageId) {
  // Hide all pages
  document
    .querySelectorAll(".page-section")
    .forEach((el) => el.classList.add("hidden"));

  // Show target page
  document.getElementById(`${pageId}-page`).classList.remove("hidden");

  if (pageId === "cart") renderCart();
  if (pageId === "admin") renderAdminPanel();
  if (pageId === "profile") renderProfilePage();
  if (pageId === "orders") renderOrdersPage();

}

// --- Auth Logic ---
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const isAdmin = email === "admin@printvan.com";
  const password = document.getElementById("loginPassword").value;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  state.user = user;

  document.getElementById("loginBtn").classList.add("hidden");
  document.getElementById("userProfile").classList.remove("hidden");
  document.getElementById("userName").textContent = state.user.name;
  document.getElementById("userCompany").textContent = state.user.company;
  
  if(state.user.role === 'admin') {
      document.getElementById("adminBtn").classList.remove("hidden");
  }

  navigateTo("home");
}

function handleRegister(e) {
    e.preventDefault();
    const users = getUsers();
    const newUser = {
        id: generateId(),
        name: document.getElementById('regName').value,
        company: document.getElementById('regCompany').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        password: document.getElementById('regPassword').value,
        role: 'dealer'
    };

    if (users.some(u => u.email === newUser.email)) {
        alert('An account with this email already exists.');
        return;
    }

    users.push(newUser);
    saveUsers(users);
    alert('Registration successful! Please login.');
    navigateTo('login');
}

let otpSession = {}; // Temporary store for OTP flow

function handleForgotPassword(e) {
    e.preventDefault();
    const phone = document.getElementById('forgotPhone').value;
    const users = getUsers();
    const user = users.find(u => u.phone === phone);

    if (!user) {
        alert('No account found with this mobile number.');
        return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpSession = { email: user.email, otp: otp };

    // Simulate sending OTP
    alert(`Your OTP is: ${otp}`);
    navigateTo('verify-otp');
}

function handleVerifyOtp(e) {
    e.preventDefault();
    const enteredOtp = document.getElementById('otpInput').value;
    if (enteredOtp === otpSession.otp) {
        navigateTo('reset-password');
    } else {
        alert('Invalid OTP. Please try again.');
    }
}

function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('resetPassword').value;
    let users = getUsers();
    const userIndex = users.findIndex(u => u.email === otpSession.email);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveUsers(users);
        alert('Password has been reset successfully. Please login.');
        otpSession = {}; // Clear session
        navigateTo('login');
    } else {
        alert('An error occurred. Please try again.');
    }
}

function renderProfilePage() {
    if (!state.user) return;
    document.getElementById('profileId').value = state.user.id;
    document.getElementById('profileName').value = state.user.name;
    document.getElementById('profileCompany').value = state.user.company;
    document.getElementById('profileEmail').value = state.user.email;
}

function handleUpdateProfile(e) {
    e.preventDefault();
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === state.user.id);
    
    users[userIndex].name = document.getElementById('profileName').value;
    users[userIndex].company = document.getElementById('profileCompany').value;
    
    saveUsers(users);
    state.user = users[userIndex]; // Update state
    alert('Profile updated successfully!');
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
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        let users = getUsers();
        const updatedUsers = users.filter(u => u.id !== state.user.id);
        saveUsers(updatedUsers);
        alert('Account deleted successfully.');
        logout();
    }
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
  document.querySelectorAll('.method').forEach(el => el.classList.remove('active'));
  element.classList.add('active');

  // Hide all fields
  document.getElementById('card-fields').classList.add('hidden');
  document.getElementById('upi-fields').classList.add('hidden');
  document.getElementById('netbanking-fields').classList.add('hidden');

  // Reset required attributes
  document.querySelectorAll('#card-fields input').forEach(i => i.required = false);
  document.querySelectorAll('#upi-fields input').forEach(i => i.required = false);

  // Show selected and set required
  if (method === 'card') {
    document.getElementById('card-fields').classList.remove('hidden');
    document.querySelectorAll('#card-fields input').forEach(i => i.required = true);
  } else if (method === 'upi') {
    document.getElementById('upi-fields').classList.remove('hidden');
    document.querySelectorAll('#upi-fields input').forEach(i => i.required = true);
  } else if (method === 'netbanking') {
    document.getElementById('netbanking-fields').classList.remove('hidden');
  }
}

function handlePayment(e) {
  e.preventDefault();
  
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = "Processing Order...";
  btn.disabled = true;

  // Save Order
  const orders = JSON.parse(localStorage.getItem('pk_orders')) || [];
  const newOrder = {
      id: generateId(8),
      date: new Date().toLocaleString(),
      items: state.cart,
      total: document.getElementById('cartTotal').textContent,
      userEmail: state.user ? state.user.email : 'guest'
  };
  orders.push(newOrder);
  localStorage.setItem('pk_orders', JSON.stringify(orders));

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
    const container = document.getElementById('ordersList');
    container.innerHTML = '';
    
    const allOrders = JSON.parse(localStorage.getItem('pk_orders')) || [];
    // Filter orders for current user
    const userOrders = state.user ? allOrders.filter(o => o.userEmail === state.user.email) : [];

    if (userOrders.length === 0) {
        container.innerHTML = '<div class="text-muted">No past orders found.</div>';
        return;
    }

    userOrders.reverse().forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'card p-4 mb-4';
        
        let itemsHtml = order.items.map(item => `
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem;border-bottom:1px solid #eee;padding-bottom:0.5rem;">
                <span>${item.product.name} <span class="text-muted">(${item.width}x${item.height} ${item.unit})</span></span>
                <span>₹${item.total}</span>
            </div>
        `).join('');

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
function renderProducts() {
  const productGrid = document.getElementById("productGrid");
  productGrid.innerHTML = "";

  PRODUCTS.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    // HTML Template for Card
    card.innerHTML = `
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-content">
                <div class="product-title">
                    <h3>${product.name}</h3>
                    <div class="product-desc">${product.desc}</div>
                </div>
                
                <!-- Individual Calculator -->
                <div class="product-inputs">
                    <div class="input-group">
                        <label>Width</label>
                        <input type="number" id="w-${product.id}" placeholder="0">
                    </div>
                    <div class="input-group">
                        <label>Height</label>
                        <input type="number" id="h-${product.id}" placeholder="0">
                    </div>
                    <div class="input-group">
                        <label>Unit</label>
                        <select id="u-${product.id}">
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
                    <span id="view-sqft-${product.id}" class="sqft-value">0.00 sqft</span>
                </div>

                <div class="rate-display">
                    <span>Rate:</span>
                    <span id="rate-${product.id}" class="rate-value">
                        ₹0/sqft
                    </span>
                </div>
                
                <div id="badge-${product.id}" class="bulk-badge invisible">
                    <i data-lucide="trending-down"></i> Bulk Price Applied
                </div>
            </div>

            <div class="product-footer">
                <div class="price-row">
                    <span id="sqft-${product.id}" class="product-desc">0 sqft</span>
                    <span id="total-${product.id}" class="total-price">₹0.00</span>
                </div>
                <button class="btn-add" id="btn-${product.id}" disabled>
                    <i data-lucide="shopping-cart"></i> Add to Order
                </button>
            </div>
        `;

    productGrid.appendChild(card);

    // Listeners for Inputs
    const inputs = [
      document.getElementById(`w-${product.id}`),
      document.getElementById(`h-${product.id}`),
      document.getElementById(`u-${product.id}`),
    ];

    inputs.forEach((input) => {
      input.addEventListener("input", () => updateCard(product.id));
    });

    // Listener for Add Button
    document
      .getElementById(`btn-${product.id}`)
      .addEventListener("click", () => {
        addToCartFromCard(product.id);
      });
  });

  // Re-initialize icons for new elements
  lucide.createIcons();
}

function updateCard(id) {
  const wVal = document.getElementById(`w-${id}`).value;
  const hVal = document.getElementById(`h-${id}`).value;
  const unit = document.getElementById(`u-${id}`).value;

  const wFt = convertToFeet(wVal, unit);
  const hFt = convertToFeet(hVal, unit);

  const calc = calculatePrice(id, wFt, hFt);

  // Update UI Elements
  document.getElementById(`rate-${id}`).textContent = `₹${calc.rate}/sqft`;
  document.getElementById(`sqft-${id}`).textContent = `${calc.sqft} sqft`;
  document.getElementById(`view-sqft-${id}`).textContent = `${calc.sqft} sqft`;
  document.getElementById(`total-${id}`).textContent = `₹${calc.total}`;

  const badge = document.getElementById(`badge-${id}`);
  if (calc.isDiscounted) badge.classList.remove("invisible");
  else badge.classList.add("invisible");

  const btn = document.getElementById(`btn-${id}`);
  btn.disabled = calc.sqft <= 0;

  const rateSpan = document.getElementById(`rate-${id}`);
  if (calc.isDiscounted) rateSpan.classList.add("discounted");
  else rateSpan.classList.remove("discounted");
}

function addToCartFromCard(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  const wVal = document.getElementById(`w-${id}`).value;
  const hVal = document.getElementById(`h-${id}`).value;
  const unit = document.getElementById(`u-${id}`).value;

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
}

// --- Admin Logic ---
function renderAdminPanel() {
    const container = document.getElementById('adminRatesContainer');
    container.innerHTML = '';

    // Helper to create input
    const createInput = (key, val, parentKey = null) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        const label = parentKey ? `${parentKey} - ${key}` : key;
        const id = parentKey ? `admin-${parentKey}-${key}` : `admin-${key}`;
        
        wrapper.innerHTML = `
            <label style="text-transform:capitalize">${label.replace(/([A-Z])/g, ' $1')}</label>
            <input type="number" id="${id}" value="${val}" step="0.1">
        `;
        return wrapper;
    };

    for (const [key, value] of Object.entries(RATES)) {
        if (typeof value === 'object') {
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
        if (typeof value === 'object') {
            for (const subKey of Object.keys(value)) {
                const input = document.getElementById(`admin-${key}-${subKey}`);
                if(input) newRates[key][subKey] = parseFloat(input.value);
            }
        } else {
            const input = document.getElementById(`admin-${key}`);
            if(input) newRates[key] = parseFloat(input.value);
        }
    }
    
    RATES = newRates;
    localStorage.setItem('pk_rates', JSON.stringify(RATES));
    alert('Rates updated successfully!');
    renderProducts(); // Refresh UI with new rates
}

function resetRates() {
    if(confirm('Reset all rates to default?')) {
        RATES = JSON.parse(JSON.stringify(DEFAULT_RATES));
        localStorage.setItem('pk_rates', JSON.stringify(RATES));
        renderAdminPanel();
        renderProducts();
    }
}

// --- Init ---
renderProducts();
lucide.createIcons();
