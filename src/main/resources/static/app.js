// ============================================
// RailGo Frontend — Talks to Spring Boot Backend
// ============================================

const API = "";  // same origin — Spring Boot serves both

// ---------- STORAGE HELPERS ----------
function getUser() {
    const raw = localStorage.getItem("rg_user");
    return raw ? JSON.parse(raw) : null;
}
function setUser(user) {
    localStorage.setItem("rg_user", JSON.stringify(user));
}
function clearUser() {
    localStorage.removeItem("rg_user");
}
function setSelectedTrain(train) {
    localStorage.setItem("rg_train", JSON.stringify(train));
}
function getSelectedTrain() {
    const raw = localStorage.getItem("rg_train");
    return raw ? JSON.parse(raw) : null;
}
function clearSelectedTrain() {
    localStorage.removeItem("rg_train");
}

// ---------- NAV RENDERING ----------
function renderNav() {
    const nav = document.getElementById("topnav");
    if (!nav) return;

    const user = getUser();
    const path = window.location.pathname.split("/").pop() || "index.html";

    const link = (href, label) =>
        `<a href="${href}" class="${path === href ? "active" : ""}">${label}</a>`;

    if (user) {
        const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
        nav.innerHTML = `
            ${link("index.html", "Home")}
            ${link("search.html", "Search")}
            ${link("parcel.html", "Parcel")}
            ${link("my-bookings.html", "Bookings")}
            ${link("my-parcels.html", "Parcels")}
            <div class="user-chip">
                <div class="avatar">${initial}</div>
                ${user.name.split(" ")[0]}
            </div>
            <button class="logout-btn" onclick="handleLogout()">Logout</button>
        `;
    } else {
        nav.innerHTML = `
            ${link("index.html", "Home")}
            ${link("search.html", "Search")}
            ${link("parcel.html", "Parcel")}
            ${link("login.html", "Login")}
            <a href="register.html" style="background:var(--accent); color:var(--bg);">Sign Up</a>
        `;
    }
}

function handleLogout() {
    clearUser();
    window.location.href = "index.html";
}

// ---------- RENDER HTML HELPERS ----------
function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function showError(container, message) {
    container.innerHTML = `
        <div class="result error">
            <div class="result-header">
                <div class="result-icon">✕</div>
                <h2>Something went wrong</h2>
            </div>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    renderNav();

    // Auto-fill user email on booking form
    const user = getUser();
    const emailField = document.getElementById("pEmail");
    if (user && emailField) {
        emailField.value = user.email;
        emailField.readOnly = true;
    }

    // Wire up per-page
    wireRegister();
    wireLogin();
    wireQuickSearch();
    wireSearch();
    wireBooking();
    wireParcel();
    wireMyBookings();
    wireMyParcels();
    loadSelectedTrain();
});

// ============================================
// REGISTER
// ============================================
function wireRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            name: document.getElementById("regName").value.trim(),
            email: document.getElementById("regEmail").value.trim(),
            phone: document.getElementById("regPhone").value.trim(),
            password: document.getElementById("regPassword").value
        };

        try {
            const res = await fetch(`${API}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert("Registration failed: " + (err.message || "Unknown error"));
                return;
            }

            alert("Account created! Please sign in.");
            window.location.href = "login.html";
        } catch (err) {
            console.error(err);
            alert("Could not reach the server.");
        }
    });
}

// ============================================
// LOGIN
// ============================================
function wireLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            email: document.getElementById("loginEmail").value.trim(),
            password: document.getElementById("loginPassword").value
        };

        try {
            const res = await fetch(`${API}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                alert("Invalid email or password.");
                return;
            }

            const user = await res.json();
            setUser(user);
            alert("Welcome back, " + user.name + "!");
            window.location.href = "index.html";
        } catch (err) {
            console.error(err);
            alert("Could not reach the server.");
        }
    });
}

// ============================================
// HOME QUICK SEARCH — redirects to search page
// ============================================
function wireQuickSearch() {
    const form = document.getElementById("quickSearchForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const from = document.getElementById("quickFrom").value.trim();
        const to = document.getElementById("quickTo").value.trim();
        const date = document.getElementById("quickDate").value;

        window.location.href = `search.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    });
}

// ============================================
// SEARCH PAGE
// ============================================
function wireSearch() {
    const form = document.getElementById("searchForm");
    if (!form) return;

    // Pre-fill from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get("from")) document.getElementById("src").value = params.get("from");
    if (params.get("to")) document.getElementById("dest").value = params.get("to");
    if (params.get("date")) document.getElementById("jdate").value = params.get("date");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const source = document.getElementById("src").value.trim();
        const destination = document.getElementById("dest").value.trim();
        const jdate = document.getElementById("jdate").value;

        if (source.toLowerCase() === destination.toLowerCase()) {
            alert("Source and destination cannot be the same.");
            return;
        }

        const results = document.getElementById("searchResults");
        results.innerHTML = `<div class="empty"><p>Searching trains...</p></div>`;

        try {
            const res = await fetch(
                `${API}/api/trains/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`
            );
            const trains = await res.json();

            if (!trains.length) {
                results.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">🚫</div>
                        <h3>No trains found</h3>
                        <p>No trains available from ${escapeHtml(source)} to ${escapeHtml(destination)}.</p>
                    </div>
                `;
                return;
            }

            results.innerHTML = trains.map(t => `
                <div class="train-row">
                    <div class="train-info">
                        <h3>${escapeHtml(t.trainName)}</h3>
                        <div class="train-meta">
                            <span><strong>${escapeHtml(t.trainNumber)}</strong></span>
                            <span>Departs <strong>${escapeHtml(t.departure)}</strong></span>
                            <span>Arrives <strong>${escapeHtml(t.arrival)}</strong></span>
                            <span>Class <strong>${escapeHtml(t.trainClass)}</strong></span>
                        </div>
                    </div>
                    <div class="train-side">
                        <span class="train-fare">₹${t.fare}</span>
                        <div class="train-seats">${t.availableSeats} seats left</div>
                        <button class="btn btn-primary btn-sm"
                            onclick="selectTrain('${escapeHtml(t.trainNumber)}','${escapeHtml(t.trainName)}','${escapeHtml(t.source)}','${escapeHtml(t.destination)}','${escapeHtml(jdate)}','${escapeHtml(t.trainClass)}',${t.fare})">
                            Book →
                        </button>
                    </div>
                </div>
            `).join("");
        } catch (err) {
            console.error(err);
            showError(results, "Could not fetch trains.");
        }
    });
}

// Called from search results
window.selectTrain = function(number, name, source, destination, date, cls, fare) {
    setSelectedTrain({
        trainNumber: number, trainName: name,
        source, destination, journeyDate: date,
        trainClass: cls, fare
    });
    window.location.href = "booking.html";
};

// ============================================
// LOAD SELECTED TRAIN ON BOOKING PAGE
// ============================================
function loadSelectedTrain() {
    const box = document.getElementById("selectedTrainBox");
    const train = getSelectedTrain();
    if (!box || !train) return;

    box.innerHTML = `
        <div class="panel" style="border-left:4px solid var(--accent);">
            <div class="panel-title">Selected Train</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:12px;">${escapeHtml(train.trainName)}</h3>
            <div class="train-meta" style="margin-bottom:0;">
                <span>Train <strong>${escapeHtml(train.trainNumber)}</strong></span>
                <span>From <strong>${escapeHtml(train.source)}</strong></span>
                <span>To <strong>${escapeHtml(train.destination)}</strong></span>
                <span>Date <strong>${escapeHtml(train.journeyDate)}</strong></span>
                <span>Class <strong>${escapeHtml(train.trainClass)}</strong></span>
                <span>Fare <strong>₹${train.fare}</strong></span>
            </div>
        </div>
    `;
}

// ============================================
// BOOKING FORM
// ============================================
function wireBooking() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = getUser();
        if (!user) {
            alert("Please sign in first.");
            window.location.href = "login.html";
            return;
        }

        const train = getSelectedTrain();
        if (!train) {
            alert("No train selected. Please search again.");
            window.location.href = "search.html";
            return;
        }

        const body = {
            passengerName: document.getElementById("pName").value.trim(),
            passengerAge: parseInt(document.getElementById("pAge").value),
            gender: document.getElementById("pGender").value,
            passengerPhone: document.getElementById("pPhone").value.trim(),
            passengerEmail: document.getElementById("pEmail").value.trim(),
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            source: train.source,
            destination: train.destination,
            journeyDate: train.journeyDate,
            trainClass: train.trainClass,
            fare: train.fare
        };

        const result = document.getElementById("bookingResult");
        result.innerHTML = `<div class="empty"><p>Processing...</p></div>`;

        try {
            const res = await fetch(`${API}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                showError(result, err.message || "Booking failed.");
                return;
            }

            const saved = await res.json();
            document.getElementById("passengerPanel").style.display = "none";
            clearSelectedTrain();

            result.innerHTML = `
                <div class="result">
                    <div class="result-header">
                        <div class="result-icon">✓</div>
                        <h2>Booking Confirmed</h2>
                    </div>

                    <div class="result-section">
                        <h4>Booking</h4>
                        <div class="result-row"><span>PNR</span><span>${escapeHtml(saved.pnr)}</span></div>
                        <div class="result-row"><span>Status</span><span>${escapeHtml(saved.status)}</span></div>
                    </div>

                    <div class="result-section">
                        <h4>Passenger</h4>
                        <div class="result-row"><span>Name</span><span>${escapeHtml(saved.passengerName)}</span></div>
                        <div class="result-row"><span>Age / Gender</span><span>${saved.passengerAge} / ${escapeHtml(saved.gender)}</span></div>
                        <div class="result-row"><span>Phone</span><span>${escapeHtml(saved.passengerPhone)}</span></div>
                        <div class="result-row"><span>Email</span><span>${escapeHtml(saved.passengerEmail)}</span></div>
                    </div>

                    <div class="result-section">
                        <h4>Journey</h4>
                        <div class="result-row"><span>Train</span><span>${escapeHtml(saved.trainName)} (${escapeHtml(saved.trainNumber)})</span></div>
                        <div class="result-row"><span>Route</span><span>${escapeHtml(saved.source)} → ${escapeHtml(saved.destination)}</span></div>
                        <div class="result-row"><span>Date</span><span>${escapeHtml(saved.journeyDate)}</span></div>
                        <div class="result-row"><span>Class</span><span>${escapeHtml(saved.trainClass)}</span></div>
                        <div class="result-row"><span>Fare</span><span>₹${saved.fare}</span></div>
                    </div>

                    <div class="result-actions">
                        <a href="my-bookings.html" class="btn btn-primary">View My Bookings</a>
                        <a href="search.html" class="btn btn-ghost">Book Another</a>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error(err);
            showError(result, "Could not reach the server.");
        }
    });
}

// ============================================
// PARCEL FORM
// ============================================
function wireParcel() {
    const form = document.getElementById("parcelForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = getUser();
        if (!user) {
            alert("Please sign in first.");
            window.location.href = "login.html";
            return;
        }

        const weight = parseFloat(document.getElementById("pWeight").value);
        const source = document.getElementById("pFrom").value.trim();
        const destination = document.getElementById("pTo").value.trim();

        if (weight <= 0) {
            alert("Weight must be greater than 0.");
            return;
        }
        if (source.toLowerCase() === destination.toLowerCase()) {
            alert("Source and destination cannot be the same.");
            return;
        }

        const parcelCharge = weight * 20;

        const body = {
            senderName: document.getElementById("sName").value.trim(),
            senderPhone: document.getElementById("sPhone").value.trim(),
            receiverName: document.getElementById("rName").value.trim(),
            receiverPhone: document.getElementById("rPhone").value.trim(),
            source,
            destination,
            parcelType: document.getElementById("pType").value,
            weight,
            journeyDate: document.getElementById("pDate").value,
            parcelCharge,
            bookedByEmail: user.email
        };

        const result = document.getElementById("parcelResult");
        result.innerHTML = `<div class="empty"><p>Processing...</p></div>`;

        try {
            const res = await fetch(`${API}/api/parcels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                showError(result, err.message || "Parcel booking failed.");
                return;
            }

            const saved = await res.json();
            document.getElementById("parcelPanel").style.display = "none";

            result.innerHTML = `
                <div class="result">
                    <div class="result-header">
                        <div class="result-icon">✓</div>
                        <h2>Parcel Reserved</h2>
                    </div>

                    <div class="result-section">
                        <h4>Parcel</h4>
                        <div class="result-row"><span>Parcel ID</span><span>${escapeHtml(saved.parcelId)}</span></div>
                        <div class="result-row"><span>Status</span><span>${escapeHtml(saved.status)}</span></div>
                        <div class="result-row"><span>Type</span><span>${escapeHtml(saved.parcelType)}</span></div>
                        <div class="result-row"><span>Weight</span><span>${saved.weight} kg</span></div>
                        <div class="result-row"><span>Charge</span><span>₹${saved.parcelCharge}</span></div>
                    </div>

                    <div class="result-section">
                        <h4>Sender</h4>
                        <div class="result-row"><span>Name</span><span>${escapeHtml(saved.senderName)}</span></div>
                        <div class="result-row"><span>Phone</span><span>${escapeHtml(saved.senderPhone)}</span></div>
                    </div>

                    <div class="result-section">
                        <h4>Receiver</h4>
                        <div class="result-row"><span>Name</span><span>${escapeHtml(saved.receiverName)}</span></div>
                        <div class="result-row"><span>Phone</span><span>${escapeHtml(saved.receiverPhone)}</span></div>
                    </div>

                    <div class="result-section">
                        <h4>Shipment</h4>
                        <div class="result-row"><span>Route</span><span>${escapeHtml(saved.source)} → ${escapeHtml(saved.destination)}</span></div>
                        <div class="result-row"><span>Journey Date</span><span>${escapeHtml(saved.journeyDate)}</span></div>
                    </div>

                    <div class="result-actions">
                        <a href="my-parcels.html" class="btn btn-primary">View My Parcels</a>
                        <a href="parcel.html" class="btn btn-ghost">Send Another</a>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error(err);
            showError(result, "Could not reach the server.");
        }
    });
}

// ============================================
// MY BOOKINGS
// ============================================
async function wireMyBookings() {
    const container = document.getElementById("bookingsList");
    if (!container) return;

    const user = getUser();
    if (!user) {
        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🔒</div>
                <h3>Please sign in</h3>
                <p><a href="login.html" class="link">Sign in</a> to view your bookings.</p>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API}/api/bookings/email/${encodeURIComponent(user.email)}`);
        const bookings = await res.json();

        if (!bookings.length) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">🎫</div>
                    <h3>No bookings yet</h3>
                    <p>Your booked journeys will appear here.</p>
                    <div style="margin-top:20px;">
                        <a href="search.html" class="btn btn-primary">Search Trains</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = bookings.map(b => `
            <div class="list-card">
                <div class="list-card-header">
                    <div>
                        <div class="list-card-id">PNR ${escapeHtml(b.pnr)}</div>
                        <div class="list-card-title">${escapeHtml(b.trainName)} · ${escapeHtml(b.trainNumber)}</div>
                    </div>
                    <span class="badge badge-success">${escapeHtml(b.status)}</span>
                </div>
                <div class="result-section" style="margin-bottom:0;">
                    <div class="result-row"><span>Passenger</span><span>${escapeHtml(b.passengerName)}</span></div>
                    <div class="result-row"><span>Route</span><span>${escapeHtml(b.source)} → ${escapeHtml(b.destination)}</span></div>
                    <div class="result-row"><span>Date</span><span>${escapeHtml(b.journeyDate)}</span></div>
                    <div class="result-row"><span>Class</span><span>${escapeHtml(b.trainClass)}</span></div>
                    <div class="result-row"><span>Fare</span><span>₹${b.fare}</span></div>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error(err);
        showError(container, "Could not load bookings.");
    }
}

// ============================================
// MY PARCELS
// ============================================
async function wireMyParcels() {
    const container = document.getElementById("parcelsList");
    if (!container) return;

    const user = getUser();
    if (!user) {
        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🔒</div>
                <h3>Please sign in</h3>
                <p><a href="login.html" class="link">Sign in</a> to view your parcels.</p>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API}/api/parcels/email/${encodeURIComponent(user.email)}`);
        const parcels = await res.json();

        if (!parcels.length) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">📦</div>
                    <h3>No parcels yet</h3>
                    <p>Your booked parcels will appear here.</p>
                    <div style="margin-top:20px;">
                        <a href="parcel.html" class="btn btn-primary">Book a Parcel</a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = parcels.map(p => `
            <div class="list-card">
                <div class="list-card-header">
                    <div>
                        <div class="list-card-id">${escapeHtml(p.parcelId)}</div>
                        <div class="list-card-title">${escapeHtml(p.parcelType)} · ${p.weight} kg</div>
                    </div>
                    <span class="badge badge-info">${escapeHtml(p.status)}</span>
                </div>
                <div class="result-section" style="margin-bottom:0;">
                    <div class="result-row"><span>Sender</span><span>${escapeHtml(p.senderName)}</span></div>
                    <div class="result-row"><span>Receiver</span><span>${escapeHtml(p.receiverName)}</span></div>
                    <div class="result-row"><span>Route</span><span>${escapeHtml(p.source)} → ${escapeHtml(p.destination)}</span></div>
                    <div class="result-row"><span>Date</span><span>${escapeHtml(p.journeyDate)}</span></div>
                    <div class="result-row"><span>Charge</span><span>₹${p.parcelCharge}</span></div>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error(err);
        showError(container, "Could not load parcels.");
    }
}