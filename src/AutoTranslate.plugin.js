/**
 * @name AutoTranslate
 * @description Automatically translates messages inline
 * @version 1.0.0
 */

const { franc } = require("franc");
const translate = require("@vitalets/google-translate-api");

module.exports = class AutoTranslate {
  start() {
    this.processNode = this.processNode.bind(this);

    this.observer = new MutationObserver((mutations) => {
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

      if (text.length < 3) return;
      if (text.startsWith("http")) return;

      const detected = franc(text);

      if (detected === "eng" || detected === "und") return;

      const res = await translate(text, { to: "en" });

      if (!res || !res.text) return;

      const existing = node.querySelector(".auto-translate");
      if (existing) return;

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
