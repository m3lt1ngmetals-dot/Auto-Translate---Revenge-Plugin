/**
 * @name AutoTranslate
 * @description Automatically translates messages inline with settings
 * @version 1.1.0
 */

const { franc } = require("franc");
const translate = require("@vitalets/google-translate-api");

module.exports = class AutoTranslate {
  constructor() {
    this.defaultSettings = {
      enabled: true,
      targetLang: "en",
      ignoreShort: true,
      minLength: 3
    };

    this.settings = this.loadSettings();
  }

  // ================= SETTINGS =================

  loadSettings() {
    const saved = localStorage.getItem("autoTranslateSettings");
    return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : this.defaultSettings;
  }

  saveSettings() {
    localStorage.setItem("autoTranslateSettings", JSON.stringify(this.settings));
  }

  getSettingsPanel() {
    const panel = document.createElement("div");

    panel.innerHTML = `
      <h2>🌍 Auto Translate Settings</h2>

      <label>
        <input type="checkbox" id="enabled" ${this.settings.enabled ? "checked" : ""}/>
        Enable Auto Translate
      </label>
      <br/><br/>

      <label>Target Language:</label>
      <select id="lang">
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
      </select>
      <br/><br/>

      <label>
        <input type="checkbox" id="ignoreShort" ${this.settings.ignoreShort ? "checked" : ""}/>
        Ignore Short Messages
      </label>
      <br/><br/>

      <label>Minimum Length:</label>
      <input type="number" id="minLength" value="${this.settings.minLength}" min="1" max="20"/>
    `;

    setTimeout(() => {
      panel.querySelector("#lang").value = this.settings.targetLang;

      panel.querySelector("#enabled").onchange = (e) => {
        this.settings.enabled = e.target.checked;
        this.saveSettings();
      };

      panel.querySelector("#lang").onchange = (e) => {
        this.settings.targetLang = e.target.value;
        this.saveSettings();
      };

      panel.querySelector("#ignoreShort").onchange = (e) => {
        this.settings.ignoreShort = e.target.checked;
        this.saveSettings();
      };

      panel.querySelector("#minLength").onchange = (e) => {
        this.settings.minLength = Number(e.target.value);
        this.saveSettings();
      };

    }, 0);

    return panel;
  }

  // ================= CORE =================

  start() {
    this.processNode = this.processNode.bind(this);

    this.observer = new MutationObserver((mutations) => {
      if (!this.settings.enabled) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          this.processNode(node);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async processNode(node) {
    try {
      if (!node || !node.innerText) return;

      const text = node.innerText;

      if (this.settings.ignoreShort && text.length < this.settings.minLength) return;
      if (text.startsWith("http")) return;

      const detected = franc(text);

      if (detected === "und" || detected.startsWith(this.settings.targetLang)) return;

      const res = await translate(text, { to: this.settings.targetLang });

      if (!res || !res.text) return;

      if (node.querySelector(".auto-translate")) return;

      const div = document.createElement("div");
      div.className = "auto-translate";
      div.style.opacity = "0.7";
      div.style.fontSize = "12px";
      div.style.marginTop = "4px";
      div.innerText = "🌐 " + res.text;

      node.appendChild(div);

    } catch (err) {
      console.error("AutoTranslate error:", err);
    }
  }

  stop() {
    if (this.observer) this.observer.disconnect();
  }
};
