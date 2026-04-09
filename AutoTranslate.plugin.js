/**
 * @name AutoTranslate
 * @author notttkarma.
 * @version 1.3.0
 * @description Auto detects and translates messages (now includes Russian)
 */

module.exports = class AutoTranslate {
  constructor() {
    this.settings = {
      enabled: true,
      targetLang: "en",
      autoDetect: true
    };
  }

  start() {
    this.observer = new MutationObserver(mutations => {
      if (!this.settings.enabled) return;

      for (const m of mutations) {
        for (const node of m.addedNodes) {
          this.process(node);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  stop() {
    if (this.observer) this.observer.disconnect();
  }

  async process(node) {
    try {
      if (!node || !node.innerText) return;

      const text = node.innerText;
      if (text.length < 3) return;

      const detected = this.detectLang(text);
      const target = this.settings.targetLang;

      if (!detected || detected === target) return;

      const translated = await this.translate(text, target);
      if (!translated) return;

      if (node.querySelector(".auto-translate")) return;

      const div = document.createElement("div");
      div.className = "auto-translate";
      div.style.opacity = "0.7";
      div.style.fontSize = "12px";
      div.innerText = "🌐 " + translated;

      node.appendChild(div);

    } catch (e) {
      console.error(e);
    }
  }

  // 🌍 Language Detection (UPDATED)
  detectLang(text) {
    // Russian (Cyrillic)
    if (/[а-яА-ЯЁё]/.test(text)) return "ru";

    // Spanish
    if (/[¿¡ñ]/.test(text)) return "es";

    // French
    if (/[éèà]/.test(text)) return "fr";

    // German
    if (/[ß]/.test(text)) return "de";

    // Default English
    if (/^[a-zA-Z\s]+$/.test(text)) return "en";

    return null;
  }

  async translate(text, to) {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
      );

      const data = await res.json();
      return data[0].map(x => x[0]).join("");
    } catch {
      return null;
    }
  }
};
