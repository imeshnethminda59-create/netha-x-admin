'use strict';

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDI4FTCYDV33LUunaUGvYfqHWbCMIKZqUg",
    authDomain: "netha-x-admin.firebaseapp.com",
    projectId: "netha-x-admin",
    storageBucket: "netha-x-admin.firebasestorage.app",
    messagingSenderId: "270834163488",
    appId: "1:270834163488:web:414206ee37e88a55fe4145",
    measurementId: "G-YZSXGNY813"
};

const ADMIN_UID = "vtWnHMHtWkYaNUkIIh7ziuWAzhF2";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appearanceRef = doc(db, "appConfig", "appearance");

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const ALLOWED_EFFECTS = ["snow", "flower", "leaf", "gem"];

// THEME PRESETS
const THEME_PRESETS = {
    "netha-original": {
        name: "NETHA Original",
        themeColor: "#00d9ff",
        accentColor: "#a855f7",
        background: "#090713",
        panel: "#171327",
        border: "#34304a",
        text: "#f1efff"
    },

    "neon-blue": {
        name: "Neon Blue",
        themeColor: "#3985ff",
        accentColor: "#00e5ff",
        background: "#080d19",
        panel: "#111c30",
        border: "#29476e",
        text: "#edf6ff"
    },

    "emerald": {
        name: "Emerald",
        themeColor: "#00d68f",
        accentColor: "#65ffbf",
        background: "#07130f",
        panel: "#10231c",
        border: "#285442",
        text: "#edfff6"
    },

    "ruby-red": {
        name: "Ruby Red",
        themeColor: "#ff3867",
        accentColor: "#ff78a5",
        background: "#160910",
        panel: "#28121d",
        border: "#633044",
        text: "#fff0f5"
    },

    "golden": {
        name: "Golden",
        themeColor: "#ffbd35",
        accentColor: "#ff8c32",
        background: "#151006",
        panel: "#282013",
        border: "#66502b",
        text: "#fff8e8"
    }
};

// DEFAULT SETTINGS
const defaultSettings = {
    themePreset: "netha-original",

    themeColor: "#00d9ff",
    accentColor: "#a855f7",

    backgroundColor: "#090713",
    panelColor: "#171327",
    borderColor: "#34304a",
    textColor: "#f1efff",

    backgroundStyle: "midnight",
    animations: true,
    glowIntensity: 50,
    buttonStyle: "gradient",

    fallingEffects: {
        enabled: false,
        types: ["snow"],
        speed: 50,
        density: 30
    }
};

let currentSettings = { ...defaultSettings };

// LOGIN ERROR
function showLoginError(message) {
    loginMessage.textContent = message;
}

// NORMALIZE SETTINGS
function normalizeSettings(settings = {}) {

    if (!settings || typeof settings !== "object") {
        settings = {};
    }

    const savedEffects =
        settings.fallingEffects &&
        typeof settings.fallingEffects === "object"
            ? settings.fallingEffects
            : {};

    const savedTypes = Array.isArray(savedEffects.types)
        ? savedEffects.types.filter(type =>
            ALLOWED_EFFECTS.includes(type)
        )
        : [...defaultSettings.fallingEffects.types];

    const speed = Number(savedEffects.speed);
    const density = Number(savedEffects.density);
    const glow = Number(settings.glowIntensity);

    const themePreset = Object.prototype.hasOwnProperty.call(
        THEME_PRESETS,
        settings.themePreset
    )
        ? settings.themePreset
        : "netha-original";

    const selectedTheme = THEME_PRESETS[themePreset];

    return {
        ...defaultSettings,
        ...settings,

        // COMPLETE THEME PRESET
        themePreset: themePreset,

        themeColor: selectedTheme.themeColor,
        accentColor: selectedTheme.accentColor,

        backgroundColor: selectedTheme.background,
        panelColor: selectedTheme.panel,
        borderColor: selectedTheme.border,
        textColor: selectedTheme.text,

        // BACKGROUND STYLE
        backgroundStyle: [
            "midnight",
            "dark",
            "gradient"
        ].includes(settings.backgroundStyle)
            ? settings.backgroundStyle
            : defaultSettings.backgroundStyle,

        // BUTTON STYLE
        buttonStyle: [
            "gradient",
            "solid",
            "outline"
        ].includes(settings.buttonStyle)
            ? settings.buttonStyle
            : defaultSettings.buttonStyle,

        // ANIMATIONS
        animations: typeof settings.animations === "boolean"
            ? settings.animations
            : defaultSettings.animations,

        // GLOW INTENSITY
        glowIntensity: Number.isFinite(glow)
            ? Math.max(0, Math.min(100, glow))
            : defaultSettings.glowIntensity,

        // FALLING EFFECTS
        fallingEffects: {
            enabled: typeof savedEffects.enabled === "boolean"
                ? savedEffects.enabled
                : defaultSettings.fallingEffects.enabled,

            types: savedTypes,

            speed: Number.isFinite(speed)
                ? Math.max(0, Math.min(100, speed))
                : defaultSettings.fallingEffects.speed,

            density: Number.isFinite(density)
                ? Math.max(0, Math.min(100, density))
                : defaultSettings.fallingEffects.density
        }
    };
}

// DASHBOARD
function renderDashboard(user) {

    dashboardScreen.innerHTML = `
        <div class="dashboard-header">
            <div>
                <div class="dashboard-brand">
                    <span class="brand-icon">NX</span>
                    <div>
                        <h1>NETHA X ADMIN</h1>
                        <p class="dashboard-subtitle">
                            ULTIMATE CONTROL PANEL
                        </p>
                    </div>
                </div>
            </div>

            <button type="button" id="logoutButton" class="logout-button">
                LOGOUT
            </button>
        </div>

        <div class="welcome-panel">
            <div>
                <span class="status-dot"></span>
                <span class="online-label">
                    ADMIN SESSION ACTIVE
                </span>

                <h2>Dashboard Overview</h2>

                <p>
                    Manage the visual appearance of NETHA X ULTIMATE.
                </p>
            </div>

            <div class="admin-account">
                <span>ADMIN ACCOUNT</span>
                <strong id="adminEmailDisplay"></strong>
            </div>
        </div>

        <!-- APPEARANCE CONTROL -->

        <div class="section-heading">
            <span>01</span>
            <div>
                <h2>Appearance Control</h2>
                <p>Customize the app's visual settings</p>
            </div>
        </div>

        <div class="settings-grid">

            <!-- THEME PRESETS -->

            <div class="setting-card full-card">
                <label for="themePreset">
                    Choose App Theme
                </label>

                <p>
                    Select one of the five NETHA X themes
                </p>

                <select id="themePreset">
                    <option value="netha-original">
                        NETHA Original
                    </option>

                    <option value="neon-blue">
                        Neon Blue
                    </option>

                    <option value="emerald">
                        Emerald
                    </option>

                    <option value="ruby-red">
                        Ruby Red
                    </option>

                    <option value="golden">
                        Golden
                    </option>
                </select>

                <div
                    id="themePresetPreview"
                    class="theme-preset-preview"
                >
                    <div class="theme-preview-colors">
                        <span id="themePreviewPrimary"></span>
                        <span id="themePreviewAccent"></span>
                    </div>

                    <strong id="themePreviewName">
                        NETHA Original
                    </strong>

                    <span>THEME PREVIEW</span>
                </div>
            </div>

            <!-- BACKGROUND STYLE -->

            <div class="setting-card">
                <label for="backgroundStyle">
                    Background Style
                </label>

                <p>Choose the app background</p>

                <select id="backgroundStyle">
                    <option value="midnight">Midnight</option>
                    <option value="dark">Dark</option>
                    <option value="gradient">Cyber Gradient</option>
                </select>
            </div>

            <!-- BUTTON STYLE -->

            <div class="setting-card">
                <label for="buttonStyle">
                    Button Style
                </label>

                <p>Choose button appearance</p>

                <select id="buttonStyle">
                    <option value="gradient">Gradient</option>
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                </select>
            </div>

            <!-- ANIMATIONS -->

            <div class="setting-card full-card">
                <div class="setting-row">
                    <div>
                        <label for="animations">
                            App Animations
                        </label>

                        <p>Enable or disable app animations</p>
                    </div>

                    <label class="switch">
                        <input
                            type="checkbox"
                            id="animations"
                            checked
                        >

                        <span class="switch-track"></span>
                    </label>
                </div>
            </div>

            <!-- GLOW INTENSITY -->

            <div class="setting-card full-card">
                <label for="glowIntensity">
                    Glow Intensity
                    <strong id="glowValue">50%</strong>
                </label>

                <p>Adjust the visual glow intensity</p>

                <input
                    type="range"
                    id="glowIntensity"
                    min="0"
                    max="100"
                    value="50"
                >
            </div>

        </div>

        <!-- FALLING EFFECTS CONTROL -->

        <div class="section-heading">
            <span>02</span>
            <div>
                <h2>Falling Effects Control</h2>
                <p>
                    Manage animated foreground effects in the app
                </p>
            </div>
        </div>

        <div class="settings-grid">

            <div class="setting-card full-card">
                <div class="setting-row">
                    <div>
                        <label for="fallingEffectsEnabled">
                            Falling Effects
                        </label>

                        <p>
                            Enable or disable all falling effects
                        </p>
                    </div>

                    <label class="switch">
                        <input
                            type="checkbox"
                            id="fallingEffectsEnabled"
                        >

                        <span class="switch-track"></span>
                    </label>
                </div>
            </div>

            <div class="setting-card full-card">
                <label>Choose Effects</label>

                <p>
                    You can enable multiple effects together
                </p>

                <div class="effects-options">

                    <label class="effect-option">
                        <input
                            type="checkbox"
                            name="fallingEffect"
                            value="snow"
                        >
                        <span>❄️ Snow</span>
                    </label>

                    <label class="effect-option">
                        <input
                            type="checkbox"
                            name="fallingEffect"
                            value="flower"
                        >
                        <span>🌸 Flowers</span>
                    </label>

                    <label class="effect-option">
                        <input
                            type="checkbox"
                            name="fallingEffect"
                            value="leaf"
                        >
                        <span>🍂 Leaves</span>
                    </label>

                    <label class="effect-option">
                        <input
                            type="checkbox"
                            name="fallingEffect"
                            value="gem"
                        >
                        <span>💎 Gems</span>
                    </label>

                </div>
            </div>

            <div class="setting-card full-card">
                <label for="effectSpeed">
                    Effect Speed
                    <strong id="effectSpeedValue">50%</strong>
                </label>

                <p>Adjust how fast the effects fall</p>

                <input
                    type="range"
                    id="effectSpeed"
                    min="0"
                    max="100"
                    value="50"
                >
            </div>

            <div class="setting-card full-card">
                <label for="effectDensity">
                    Effect Density
                    <strong id="effectDensityValue">30%</strong>
                </label>

                <p>
                    Adjust how many effects appear on screen
                </p>

                <input
                    type="range"
                    id="effectDensity"
                    min="0"
                    max="100"
                    value="30"
                >
            </div>

        </div>

        <!-- APPEARANCE PREVIEW -->

        <div class="preview-panel">
            <div class="preview-heading">
                <div>
                    <h2>Appearance Preview</h2>
                    <p>
                        Preview the selected dashboard settings
                    </p>
                </div>

                <span class="preview-indicator">
                    LIVE PREVIEW
                </span>
            </div>

            <div
                id="appearancePreview"
                class="appearance-preview"
            >
                <div class="preview-logo">NX</div>

                <h3>NETHA X ULTIMATE</h3>

                <p>YOUR APP APPEARANCE PREVIEW</p>

                <button
                    type="button"
                    id="previewButton"
                >
                    PREVIEW BUTTON
                </button>
            </div>
        </div>

        <!-- SAVE SETTINGS -->

        <div class="save-area">
            <p id="saveMessage" role="status"></p>

            <button
                type="button"
                id="saveSettingsButton"
            >
                SAVE APPEARANCE SETTINGS
            </button>

            <button
                type="button"
                id="resetSettingsButton"
            >
                RESET TO DEFAULTS
            </button>
        </div>

        <div class="dashboard-footer">
            NETHA X ULTIMATE · ADMIN CONTROL SYSTEM
        </div>
    `;

    document.getElementById("adminEmailDisplay").textContent =
        user.email || "Admin";

    document.getElementById("logoutButton")
        .addEventListener("click", async () => {
            try {
                await signOut(auth);
            } catch (error) {
                alert("Logout failed. Please try again.");
            }
        });

    connectAppearanceControls();
    loadAppearanceSettings();
}

// CONNECT CONTROLS
function connectAppearanceControls() {

    const ids = [
        "themePreset",
        "backgroundStyle",
        "buttonStyle",
        "animations",
        "glowIntensity",
        "fallingEffectsEnabled",
        "effectSpeed",
        "effectDensity"
    ];

    ids.forEach(id => {
        const element = document.getElementById(id);

        if (!element) {
            console.error("Missing dashboard element:", id);
            return;
        }

        element.addEventListener("input", updatePreview);
        element.addEventListener("change", updatePreview);
    });

    document.querySelectorAll('input[name="fallingEffect"]')
        .forEach(element => {
            element.addEventListener("change", updatePreview);
        });

    document.getElementById("saveSettingsButton")
        .addEventListener("click", saveAppearanceSettings);

    document.getElementById("resetSettingsButton")
        .addEventListener("click", () => {

            applySettings(defaultSettings);
            updatePreview();

            setSaveMessage(
                "Defaults restored locally. Press Save to publish.",
                false
            );
        });

    updatePreview();
}

// READ SETTINGS
function readSettingsFromControls() {

    const selectedEffects = Array.from(
        document.querySelectorAll(
            'input[name="fallingEffect"]:checked'
        )
    ).map(element => element.value);

    const themePreset =
        document.getElementById("themePreset").value;

    const selectedTheme =
        THEME_PRESETS[themePreset] ||
        THEME_PRESETS["netha-original"];

    return {
        themePreset: themePreset,

        // COMPLETE THEME PRESET COLORS
        themeColor: selectedTheme.themeColor,
        accentColor: selectedTheme.accentColor,

        backgroundColor: selectedTheme.background,
        panelColor: selectedTheme.panel,
        borderColor: selectedTheme.border,
        textColor: selectedTheme.text,

        backgroundStyle:
            document.getElementById("backgroundStyle").value,

        buttonStyle:
            document.getElementById("buttonStyle").value,

        animations:
            document.getElementById("animations").checked,

        glowIntensity: Number(
            document.getElementById("glowIntensity").value
        ),

        fallingEffects: {
            enabled: document.getElementById(
                "fallingEffectsEnabled"
            ).checked,

            types: selectedEffects,

            speed: Number(
                document.getElementById("effectSpeed").value
            ),

            density: Number(
                document.getElementById("effectDensity").value
            )
        }
    };
}

// APPLY SETTINGS TO CONTROLS
function applySettings(settings) {

    const merged = normalizeSettings(settings);

    document.getElementById("themePreset").value =
        merged.themePreset;

    document.getElementById("backgroundStyle").value =
        merged.backgroundStyle;

    document.getElementById("buttonStyle").value =
        merged.buttonStyle;

    document.getElementById("animations").checked =
        merged.animations;

    document.getElementById("glowIntensity").value =
        merged.glowIntensity;

    document.getElementById("glowValue").textContent =
        `${merged.glowIntensity}%`;

    document.getElementById("fallingEffectsEnabled").checked =
        merged.fallingEffects.enabled;

    document.getElementById("effectSpeed").value =
        merged.fallingEffects.speed;

    document.getElementById("effectSpeedValue").textContent =
        `${merged.fallingEffects.speed}%`;

    document.getElementById("effectDensity").value =
        merged.fallingEffects.density;

    document.getElementById("effectDensityValue").textContent =
        `${merged.fallingEffects.density}%`;

    document.querySelectorAll('input[name="fallingEffect"]')
        .forEach(element => {
            element.checked =
                merged.fallingEffects.types.includes(element.value);
        });

    currentSettings = merged;
}

// UPDATE LIVE PREVIEW
function updatePreview() {

    const settings = readSettingsFromControls();

    const preview = document.getElementById("appearancePreview");
    const previewButton = document.getElementById("previewButton");

    const selectedTheme =
        THEME_PRESETS[settings.themePreset] ||
        THEME_PRESETS["netha-original"];

    document.getElementById("glowValue").textContent =
        `${settings.glowIntensity}%`;

    document.getElementById("effectSpeedValue").textContent =
        `${settings.fallingEffects.speed}%`;

    document.getElementById("effectDensityValue").textContent =
        `${settings.fallingEffects.density}%`;

    // THEME PREVIEW COLORS
    document.getElementById("themePreviewPrimary").style.background =
        selectedTheme.themeColor;

    document.getElementById("themePreviewAccent").style.background =
        selectedTheme.accentColor;

    document.getElementById("themePreviewName").textContent =
        selectedTheme.name;

    // MAIN PREVIEW COLORS
    preview.style.setProperty(
        "--preview-primary",
        selectedTheme.themeColor
    );

    preview.style.setProperty(
        "--preview-accent",
        selectedTheme.accentColor
    );

    preview.style.setProperty(
        "--preview-bg",
        selectedTheme.background
    );

    preview.style.setProperty(
        "--preview-panel",
        selectedTheme.panel
    );

    preview.style.setProperty(
        "--preview-border",
        selectedTheme.border
    );

    preview.style.setProperty(
        "--preview-text",
        selectedTheme.text
    );

    preview.style.setProperty(
        "--preview-glow",
        settings.glowIntensity / 100
    );

    // DIRECT PREVIEW STYLING
    preview.style.backgroundColor = selectedTheme.panel;
    preview.style.color = selectedTheme.text;
    preview.style.borderColor = selectedTheme.border;

    preview.classList.toggle(
        "no-animation",
        !settings.animations
    );

    preview.dataset.background = settings.backgroundStyle;
    previewButton.dataset.style = settings.buttonStyle;
}

// SAVE MESSAGE
function setSaveMessage(message, isError) {

    const element = document.getElementById("saveMessage");

    element.textContent = message;
    element.className = isError
        ? "save-error"
        : "save-success";
}

// LOAD SETTINGS FROM FIRESTORE
async function loadAppearanceSettings() {

    setSaveMessage("Loading saved settings...", false);

    try {

        const snapshot = await getDoc(appearanceRef);

        if (snapshot.exists()) {
            applySettings(snapshot.data());
        } else {
            applySettings(defaultSettings);
        }

        updatePreview();

        setSaveMessage(
            "Appearance settings loaded.",
            false
        );

    } catch (error) {

        console.error("Settings load error:", error);

        applySettings(defaultSettings);
        updatePreview();

        setSaveMessage(
            "Could not load saved settings. Check Firebase connection.",
            true
        );
    }
}

// SAVE SETTINGS TO FIRESTORE
async function saveAppearanceSettings() {

    const button = document.getElementById("saveSettingsButton");

    const settings = normalizeSettings(
        readSettingsFromControls()
    );

    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {

        setSaveMessage(
            "Admin authorization required.",
            true
        );

        return;
    }

    button.disabled = true;
    button.textContent = "SAVING...";

    try {

        await setDoc(appearanceRef, {
            ...settings,
            updatedAt: serverTimestamp()
        }, {
            merge: true
        });

        currentSettings = settings;

        setSaveMessage(
            "Settings saved successfully to Firebase.",
            false
        );

    } catch (error) {

        console.error("Settings save error:", error);

        setSaveMessage(
            "Save failed. Check Firestore Rules and internet connection.",
            true
        );

    } finally {

        button.disabled = false;
        button.textContent = "SAVE APPEARANCE SETTINGS";
    }
}

// LOGIN
loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    if (!email || !password) {

        showLoginError(
            "Enter your email and password."
        );

        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "SIGNING IN...";

    showLoginError("");

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    } catch (error) {

        const messages = {
            "auth/invalid-credential":
                "Incorrect email or password.",

            "auth/invalid-email":
                "Invalid email address.",

            "auth/user-disabled":
                "This account is disabled.",

            "auth/too-many-requests":
                "Too many attempts. Try again later."
        };

        showLoginError(
            messages[error.code] ||
            "Login failed. Please try again."
        );

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN TO DASHBOARD";
    }
});

// AUTHENTICATION STATE
onAuthStateChanged(auth, async user => {

    if (!user) {

        loginScreen.hidden = false;
        dashboardScreen.hidden = true;

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN TO DASHBOARD";

        loginForm.reset();

        showLoginError("");

        return;
    }

    if (user.uid !== ADMIN_UID) {

        showLoginError(
            "This account is not authorized as administrator."
        );

        await signOut(auth);

        return;
    }

    loginScreen.hidden = true;
    dashboardScreen.hidden = false;

    renderDashboard(user);
});

console.log("NETHA X ADMIN Dashboard Ready");

export { app, auth, db };
