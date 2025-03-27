
// js/common/actions/custom-button.js
import { animate, timeline as timeline2, stagger } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var CustomButton = class extends HTMLButtonElement {
  static get observedAttributes() {
    return ["aria-busy"];
  }
  constructor() {
    super();
    if (this.type === "submit" && this.form) {
      this.form.addEventListener("submit", () => this.setAttribute("aria-busy", "true"));
    }
    this.append(this.contentElement, this.animationElement);
    window.addEventListener("pageshow", () => this.removeAttribute("aria-busy"));
  }
  get contentElement() {
    if (this._contentElement) {
      return this._contentElement;
    }
    this._contentElement = document.createElement("div");
    this._contentElement.append(...this.childNodes);
    return this._contentElement = this._contentElement || document.createElement("div").append();
  }
  get animationElement() {
    return this._animationElement = this._animationElement || document.createRange().createContextualFragment(`
      <span class="button__loader">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `).firstElementChild;
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === "true") {
      timeline2([
        [this.contentElement, { transform: ["translateY(0)", "translateY(-10px)"], opacity: 0 }, { duration: 0.15 }],
        [this.animationElement, { transform: ["translateY(10px)", "translateY(0)"], opacity: 1 }, { duration: 0.15 }]
      ]);
      animate(this.animationElement.children, { opacity: [1, 0.1] }, { duration: 0.35, delay: stagger(0.35 / 3), direction: "alternate", repeat: Infinity });
    } else {
      timeline2([
        [this.animationElement, { transform: ["translateY(0)", "translateY(-10px)"], opacity: 0 }, { duration: 0.15 }],
        [this.contentElement, { transform: ["translateY(10px)", "translateY(0)"], opacity: 1 }, { duration: 0.15 }]
      ]);
    }
  }
};
if (!window.customElements.get("custom-button")) {
  window.customElements.define("custom-button", CustomButton, { extends: "button" });
}

// js/common/actions/share-button.js
var ShareButton = class extends HTMLButtonElement {
  constructor() {
    super();
    if (navigator.share) {
      this.addEventListener("click", this._showSystemShare);
    }
  }
  _showSystemShare() {
    navigator.share({
      title: this.hasAttribute("share-title") ? this.getAttribute("share-title") : document.title,
      url: this.hasAttribute("share-url") ? this.getAttribute("share-url") : window.location.href
    });
  }
};
if (!window.customElements.get("share-button")) {
  window.customElements.define("share-button", ShareButton, { extends: "button" });
}

// js/common/behavior/visibility-progress.js
import { scroll } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var VisibilityProgress = class extends HTMLElement {
  connectedCallback() {
    scroll((info) => {
      this.style.setProperty("--visibility-progress", info.y.progress);
    }, {
      target: this,
      offset: ["start end", "end start"]
    });
  }
};
if (!window.customElements.get("visibility-progress")) {
  window.customElements.define("visibility-progress", VisibilityProgress);
}

// js/common/carousel/effect-carousel.js
import { timeline as timeline3, inView as inView3 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";

// js/common/carousel/base-carousel.js
var BaseCarousel = class extends HTMLElement {
  connectedCallback() {
    this._abortController = new AbortController();
    this._reloaded = false;
    if (Shopify.designMode) {
      this.closest(".shopify-section").addEventListener("shopify:section:select", (event) => this._reloaded = event.detail.load);
    }
    if (this.items.length > 1) {
      if (Shopify.designMode) {
        this.addEventListener("shopify:block:select", (event) => this.select(this.items.indexOf(event.target), { animate: !event.detail.load }));
      }
      if (this.hasAttribute("adaptive-height")) {
        this.addEventListener("carousel:settle", this._adjustHeight);
        this._adjustHeight();
      }
      this.addEventListener("carousel:select", this._preloadImages, { signal: this._abortController.signal });
      this.addEventListener("carousel:filter", this._filterItems, { signal: this._abortController.signal });
      this.addEventListener("control:prev", this.previous, { signal: this._abortController.signal });
      this.addEventListener("control:next", this.next, { signal: this._abortController.signal });
      this.addEventListener("control:select", (event) => this.select(event.detail.index), { signal: this._abortController.signal });
    }
    if (this.selectedIndex === 0) {
      this._dispatchEvent("carousel:select", 0);
    } else {
      this.select(this.selectedIndex, { animate: false, force: true });
    }
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
  get items() {
    if (this.hasAttribute("reversed")) {
      return this._items = this._items || Array.from(this.hasAttribute("selector") ? this.querySelectorAll(this.getAttribute("selector")) : this.children).reverse();
    } else {
      return this._items = this._items || Array.from(this.hasAttribute("selector") ? this.querySelectorAll(this.getAttribute("selector")) : this.children);
    }
  }
  get visibleItems() {
    return this.items.filter((item) => item.offsetParent !== null);
  }
  get selectedIndex() {
    return this._selectedIndex = this._selectedIndex ?? parseInt(this.getAttribute("initial-index") || 0);
  }
  get selectedIndexAmongVisible() {
    return this.visibleItems.indexOf(this.selectedSlide);
  }
  get loop() {
    return false;
  }
  get selectedSlide() {
    return this.items[this.selectedIndex];
  }
  get previousSlide() {
    return this.visibleItems[this.loop ? (this.selectedIndexAmongVisible - 1 + this.visibleItems.length) % this.visibleItems.length : Math.max(this.selectedIndexAmongVisible - 1, 0)];
  }
  get nextSlide() {
    return this.visibleItems[this.loop ? (this.selectedIndexAmongVisible + 1 + this.visibleItems.length) % this.visibleItems.length : Math.min(this.selectedIndexAmongVisible + 1, this.visibleItems.length - 1)];
  }
  previous(animate11 = true) {
    this.select(this.items.indexOf(this.previousSlide), { direction: "previous", animate: animate11 });
  }
  next(animate11 = true) {
    this.select(this.items.indexOf(this.nextSlide), { direction: "next", animate: animate11 });
  }
  _transitionTo(fromSlide, toSlide, options = {}) {
  }
  _adjustHeight() {
    if (this.hasAttribute("adaptive-height") && this.selectedSlide.clientHeight !== this.clientHeight) {
      this.style.maxHeight = `${this.selectedSlide.clientHeight}px`;
    }
  }
  _filterItems(event) {
    this.items.forEach((item, index) => item.hidden = event.detail.filteredIndexes.includes(index));
  }
  _preloadImages() {
    [this.previousSlide, this.nextSlide].forEach((item) => {
      if (item) {
        Array.from(item.querySelectorAll('img[loading="lazy"]')).forEach((img) => img.setAttribute("loading", "eager"));
      }
    });
  }
  _dispatchEvent(eventName, index) {
    this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail: { slide: this.items[index], index } }));
  }
};

// js/common/carousel/effect-carousel.js
var EffectCarousel = class extends BaseCarousel {
  connectedCallback() {
    super.connectedCallback();
    if (this.items.length > 1) {
      if (this.swipeable) {
        new GestureArea(this, { signal: this._abortController.signal });
        this.addEventListener("swipeleft", this.next, { signal: this._abortController.signal });
        this.addEventListener("swiperight", this.previous, { signal: this._abortController.signal });
      }
      if (this.hasAttribute("autoplay")) {
        this._player = new Player(this.getAttribute("autoplay"));
        this._player.addEventListener("player:end", this.next.bind(this));
        inView3(this, () => this._player.resume(true));
        if (Shopify.designMode) {
          this.addEventListener("shopify:block:select", () => this._player.stop(), { signal: this._abortController.signal });
          this.addEventListener("shopify:block:deselect", () => this._player.start(), { signal: this._abortController.signal });
        }
      }
    }
  }
  get player() {
    return this._player;
  }
  get loop() {
    return true;
  }
  get swipeable() {
    return this.getAttribute("swipeable") !== "false";
  }
  async select(index, { direction, animate: animate11 = true } = {}) {
    const indexBeforeChange = this.selectedIndex;
    this._selectedIndex = index;
    this._dispatchEvent("carousel:select", index);
    if (!direction) {
      direction = index > indexBeforeChange ? "next" : "previous";
    }
    if (index !== indexBeforeChange) {
      const [fromSlide, toSlide] = [this.items[indexBeforeChange], this.items[index]];
      this._dispatchEvent("carousel:change", index);
      this.player?.pause();
      await this._transitionTo(fromSlide, toSlide, { direction, animate: animate11 });
      this.player?.resume(true);
      this._dispatchEvent("carousel:settle", index);
    }
  }
  /**
   * Perform a simple fade animation. For more complex animations, you should implement your own custom elements
   * that extends the EffectCarousel, and implement your own transition. You should make sure to return a promise
   * that resolves when the animation is finished
   */
  _transitionTo(fromSlide, toSlide, { direction = "next", animate: animate11 = true } = {}) {
    fromSlide.classList.remove("is-selected");
    toSlide.classList.add("is-selected");
    const timelineControls = timeline3([
      [fromSlide, { opacity: [1, 0], visibility: ["visible", "hidden"], zIndex: 0 }, { zIndex: { easing: "step-end" } }],
      [toSlide, { opacity: [0, 1], visibility: ["hidden", "visible"], zIndex: 1 }, { at: "<", zIndex: { easing: "step-end" } }]
    ], { duration: animate11 ? 0.3 : 0 });
    return timelineControls.finished;
  }
};
if (!window.customElements.get("effect-carousel")) {
  window.customElements.define("effect-carousel", EffectCarousel);
}

// js/common/carousel/scroll-carousel.js
var ScrollCarousel = class extends BaseCarousel {
  constructor() {
    super();
    if (window.ResizeObserver) {
      new ResizeObserver(throttle(this._adjustHeight.bind(this))).observe(this);
    }
  }
  connectedCallback() {
    this._hasPendingProgrammaticScroll = false;
    this._scrollArea = new ScrollArea(this, this._abortController);
    super.connectedCallback();
    this.addEventListener("scroll", throttle(this._onCarouselScroll.bind(this)), { signal: this._abortController.signal });
    this.addEventListener("scrollend", this._onScrollSettled, { signal: this._abortController.signal });
  }
  get itemOffset() {
    return this.visibleItems.length < 2 ? 0 : this.visibleItems[1].offsetLeft - this.visibleItems[0].offsetLeft;
  }
  get slidesPerPage() {
    return this.visibleItems.length < 2 ? 1 : Math.floor((this.clientWidth - this.visibleItems[0].offsetLeft) / (Math.abs(this.itemOffset) - (parseInt(getComputedStyle(this).gap) || 0)));
  }
  get totalPages() {
    return this.visibleItems.length < 2 ? 1 : this.visibleItems.length - this.slidesPerPage + 1;
  }
  select(index, { animate: animate11 = true, force = false } = {}) {
    const indexBeforeChange = this.selectedIndex;
    if (!this.offsetParent || this._scrollArea.scrollDirection === "none") {
      return this._selectedIndex = index;
    }
    const indexAmongVisible = this.visibleItems.indexOf(this.items[index]);
    index = this.items.indexOf(this.visibleItems[Math.min(this.totalPages, indexAmongVisible)]);
    this._selectedIndex = index;
    this._dispatchEvent("carousel:select", index);
    if (index !== indexBeforeChange || force) {
      const [fromSlide, toSlide] = [this.items[indexBeforeChange], this.items[index]];
      this._dispatchEvent("carousel:change", index);
      this._transitionTo(fromSlide, toSlide, { animate: animate11 });
    }
  }
  /**
   * Transition using the scrollTo method. To prevent the intersection observer to caught up the change, we set up
   * a "hasPendingProgrammaticScroll" variable to true, that is set back to false once the scroll has settled
   */
  _transitionTo(fromSlide, toSlide, { animate: animate11 = true } = {}) {
    fromSlide.classList.remove("is-selected");
    toSlide.classList.add("is-selected");
    let slideAlign = this._extractSlideAlign(toSlide), scrollAmount = 0;
    switch (slideAlign) {
      case "start":
        scrollAmount = this.itemOffset * this.visibleItems.indexOf(toSlide);
        break;
      case "center":
        scrollAmount = toSlide.offsetLeft - (this.clientWidth / 2 - (parseInt(getComputedStyle(this).scrollPaddingInline) || 0)) + toSlide.clientWidth / 2;
        break;
    }
    this._hasPendingProgrammaticScroll = animate11;
    this.scrollTo({ left: scrollAmount, behavior: animate11 ? "smooth" : "auto" });
  }
  /**
   * Update the index when manually scrolling (which allows to update the controls)
   */
  _onCarouselScroll() {
    if (this._hasPendingProgrammaticScroll || this._scrollArea.scrollDirection === "none") {
      return;
    }
    const newIndex = this.items.indexOf(this.visibleItems[Math.round(this.scrollLeft / this.itemOffset)]);
    if (newIndex !== this.selectedIndex) {
      this._selectedIndex = newIndex;
      this._dispatchEvent("carousel:select", this.selectedIndex);
      this._dispatchEvent("carousel:change", this.selectedIndex);
    }
  }
  /**
   * On the scroll has settled we dispatch the event (which covers both programmatic scroll and swipe)
   */
  _onScrollSettled() {
    this._hasPendingProgrammaticScroll = false;
    this._dispatchEvent("carousel:settle", this.selectedIndex);
  }
  _adjustHeight() {
    this.style.maxHeight = null;
    if (this._scrollArea.scrollDirection !== "none") {
      super._adjustHeight();
    }
  }
  _extractSlideAlign(slide) {
    return getComputedStyle(slide).scrollSnapAlign === "center" ? "center" : "start";
  }
};
if (!window.customElements.get("scroll-carousel")) {
  window.customElements.define("scroll-carousel", ScrollCarousel);
}

// js/common/cart/cart-count.js
import { animate as animate3 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";

// js/common/cart/fetch-cart.js
var createCartPromise = () => {
  return new Promise(async (resolve) => {
    resolve(await (await fetch(`${Shopify.routes.root}cart.js`)).json());
  });
};
var fetchCart = createCartPromise();
document.addEventListener("cart:change", (event) => {
  fetchCart = event.detail["cart"];
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    fetchCart = createCartPromise();
  }
});

// js/common/cart/cart-count.js
var CartCount = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(document.createRange().createContextualFragment("<span><slot></slot></span>"));
  }
  connectedCallback() {
    this._abortController = new AbortController();
    document.addEventListener("cart:change", (event) => this.itemCount = event.detail["cart"]["item_count"], { signal: this._abortController.signal });
    document.addEventListener("cart:refresh", this._updateFromServer.bind(this), { signal: this._abortController.signal });
    window.addEventListener("pageshow", this._updateFromServer.bind(this));
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
  async _updateFromServer() {
    this.itemCount = (await fetchCart)["item_count"];
  }
  get itemCount() {
    return parseInt(this.innerText);
  }
  set itemCount(count) {
    if (this.itemCount === count) {
      return;
    }
    if (count === 0) {
      animate3(this, { opacity: 0 }, { duration: 0.1 });
      this.innerText = count;
    } else if (this.itemCount === 0) {
      animate3(this, { opacity: 1 }, { duration: 0.1 });
      this.innerText = count;
    } else {
      (async () => {
        await animate3(this.shadowRoot.firstElementChild, { transform: ["translateY(-50%)"], opacity: 0 }, { duration: 0.25, easing: [1, 0, 0, 1] }).finished;
        this.innerText = count;
        animate3(this.shadowRoot.firstElementChild, { transform: ["translateY(50%)", "translateY(0)"], opacity: 1 }, { duration: 0.25, easing: [1, 0, 0, 1] });
      })();
    }
  }
};
if (!window.customElements.get("cart-count")) {
  window.customElements.define("cart-count", CartCount);
}

// js/common/cart/cart-drawer.js
import { animate as animate4 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";

// js/common/overlay/dialog-element.js
import { FocusTrap, Delegate } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var _lockLayerCount, _isLocked;
var _DialogElement = class _DialogElement extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _isLocked, false);
    this.addEventListener("dialog:force-close", (event) => {
      this.hide();
      event.stopPropagation();
    });
  }
  static get observedAttributes() {
    return ["id", "open"];
  }
  connectedCallback() {
    if (this.id) {
      this.delegate.off().on("click", `[aria-controls="${this.id}"]`, this._onToggleClicked.bind(this));
    }
    this._abortController = new AbortController();
    this.setAttribute("role", "dialog");
    if (Shopify.designMode) {
      this.addEventListener("shopify:block:select", (event) => this.show(!event.detail.load), { signal: this._abortController.signal });
      this.addEventListener("shopify:block:deselect", this.hide, { signal: this._abortController.signal });
      this._shopifySection = this._shopifySection || this.closest(".shopify-section");
      if (this._shopifySection) {
        if (this.hasAttribute("handle-section-events")) {
          this._shopifySection.addEventListener("shopify:section:select", (event) => this.show(!event.detail.load), { signal: this._abortController.signal });
          this._shopifySection.addEventListener("shopify:section:deselect", this.hide.bind(this), { signal: this._abortController.signal });
        }
        this._shopifySection.addEventListener("shopify:section:unload", () => this.remove(), { signal: this._abortController.signal });
      }
    }
  }
  disconnectedCallback() {
    this._abortController.abort();
    this.delegate.off();
    this.focusTrap?.deactivate({ onDeactivate: false });
    if (__privateGet(this, _isLocked)) {
      __privateSet(this, _isLocked, false);
      document.documentElement.classList.toggle("lock", --__privateWrapper(_DialogElement, _lockLayerCount)._ > 0);
    }
  }
  show(animate11 = true) {
    if (this.open) {
      return;
    }
    this.setAttribute("open", animate11 ? "" : "immediate");
    return waitForEvent(this, "dialog:after-show");
  }
  hide() {
    if (!this.open) {
      return;
    }
    this.removeAttribute("open");
    return waitForEvent(this, "dialog:after-hide");
  }
  get delegate() {
    return this._delegate = this._delegate || new Delegate(document.body);
  }
  get controls() {
    return Array.from(this.getRootNode().querySelectorAll(`[aria-controls="${this.id}"]`));
  }
  get open() {
    return this.hasAttribute("open");
  }
  get shouldTrapFocus() {
    return true;
  }
  get shouldLock() {
    return false;
  }
  /**
   * Sometimes (especially for drawer) we need to ensure that an element is on top of everything else. To do that,
   * we need to move the element to the body. We are doing that on open, and then restore the initial position on
   * close
   */
  get shouldAppendToBody() {
    return false;
  }
  get initialFocus() {
    return this.hasAttribute("initial-focus") ? this.getAttribute("initial-focus") : this.hasAttribute("tabindex") ? this : this.querySelector('input:not([type="hidden"])') || false;
  }
  get preventScrollWhenTrapped() {
    return true;
  }
  get focusTrap() {
    return this._focusTrap = this._focusTrap || new FocusTrap.createFocusTrap([this, this.shadowRoot], {
      onDeactivate: this.hide.bind(this),
      allowOutsideClick: this._allowOutsideClick.bind(this),
      initialFocus: window.matchMedia("screen and (pointer: fine)").matches ? this.initialFocus : false,
      fallbackFocus: this,
      preventScroll: this.preventScrollWhenTrapped
    });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "id":
        if (newValue) {
          this.delegate.off().on("click", `[aria-controls="${this.id}"]`, this._onToggleClicked.bind(this));
        }
        break;
      case "open":
        this.controls.forEach((toggle) => toggle.setAttribute("aria-expanded", newValue === null ? "false" : "true"));
        if (oldValue === null && (newValue === "" || newValue === "immediate")) {
          this.removeAttribute("inert");
          this._originalParentBeforeAppend = null;
          if (this.shouldAppendToBody && this.parentElement !== document.body) {
            this._originalParentBeforeAppend = this.parentElement;
            document.body.append(this);
          }
          const showTransitionPromise = this._showTransition(newValue !== "immediate") || Promise.resolve();
          showTransitionPromise.then(() => {
            this.dispatchEvent(new CustomEvent("dialog:after-show", { bubbles: true }));
          });
          if (this.shouldTrapFocus) {
            this.focusTrap.activate({
              checkCanFocusTrap: () => showTransitionPromise
            });
          }
          if (this.shouldLock) {
            __privateSet(_DialogElement, _lockLayerCount, __privateGet(_DialogElement, _lockLayerCount) + 1);
            __privateSet(this, _isLocked, true);
            document.documentElement.classList.add("lock");
          }
        } else if (oldValue !== null && newValue === null) {
          this.setAttribute("inert", "");
          const hideTransitionPromise = this._hideTransition() || Promise.resolve();
          hideTransitionPromise.then(() => {
            if (this.parentElement === document.body && this._originalParentBeforeAppend) {
              this._originalParentBeforeAppend.appendChild(this);
              this._originalParentBeforeAppend = null;
            }
            this.dispatchEvent(new CustomEvent("dialog:after-hide", { bubbles: true }));
          });
          this.focusTrap?.deactivate({
            checkCanReturnFocus: () => hideTransitionPromise
          });
          if (this.shouldLock) {
            __privateSet(this, _isLocked, false);
            document.documentElement.classList.toggle("lock", --__privateWrapper(_DialogElement, _lockLayerCount)._ > 0);
          }
        }
        this.dispatchEvent(new CustomEvent("toggle", { bubbles: true }));
        break;
    }
  }
  /* Those methods are used to perform custom show/hide transition, and must return a promise */
  _showTransition(animate11 = true) {
  }
  _hideTransition() {
  }
  /* By default, a focus element is deactivated when you click outside it */
  _allowOutsideClick(event) {
    if ("TouchEvent" in window && event instanceof TouchEvent) {
      return this._allowOutsideClickTouch(event);
    } else {
      return this._allowOutsideClickMouse(event);
    }
  }
  _allowOutsideClickTouch(event) {
    event.target.addEventListener("touchend", (subEvent) => {
      const endTarget = document.elementFromPoint(subEvent.changedTouches.item(0).clientX, subEvent.changedTouches.item(0).clientY);
      if (!this.contains(endTarget)) {
        this.hide();
      }
    }, { once: true });
    return false;
  }
  _allowOutsideClickMouse(event) {
    if (event.type !== "click") {
      return false;
    }
    if (!this.contains(event.target)) {
      this.hide();
    }
    let target = event.target, closestControl = event.target.closest("[aria-controls]");
    if (closestControl && closestControl.getAttribute("aria-controls") === this.id) {
      target = closestControl;
    }
    return this.id !== target.getAttribute("aria-controls");
  }
  _onToggleClicked(event) {
    event?.preventDefault();
    this.open ? this.hide() : this.show();
  }
};
_lockLayerCount = new WeakMap();
_isLocked = new WeakMap();
__privateAdd(_DialogElement, _lockLayerCount, 0);
var DialogElement = _DialogElement;
var CloseButton = class extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", () => this.dispatchEvent(new CustomEvent("dialog:force-close", { bubbles: true, cancelable: true, composed: true })));
  }
};
if (!window.customElements.get("dialog-element")) {
  window.customElements.define("dialog-element", DialogElement);
}
if (!window.customElements.get("close-button")) {
  window.customElements.define("close-button", CloseButton, { extends: "button" });
}

// js/common/overlay/drawer.js
import { animate as motionAnimate, timeline as motionTimeline } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var reduceDrawerAnimation = window.matchMedia("(prefers-reduced-motion: reduce)").matches || JSON.parse("false");
var Drawer = class extends DialogElement {
  constructor() {
    super();
    const template2 = document.getElementById(this.template).content.cloneNode(true);
    this.attachShadow({ mode: "open" }).appendChild(template2);
    this.shadowRoot.addEventListener("slotchange", (event) => this._updateSlotVisibility(event.target));
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-modal", "true");
    this.shadowRoot.querySelector('[part="overlay"]')?.addEventListener("click", this.hide.bind(this), { signal: this._abortController.signal });
    Array.from(this.shadowRoot.querySelectorAll("slot")).forEach((slot) => this._updateSlotVisibility(slot));
  }
  get template() {
    return this.getAttribute("template") || "drawer-default-template";
  }
  get shouldLock() {
    return true;
  }
  get shouldAppendToBody() {
    return true;
  }
  get openFrom() {
    return window.matchMedia(`${window.themeVariables.breakpoints["sm-max"]}`).matches ? "bottom" : this.getAttribute("open-from") || "right";
  }
  _getClipPathProperties() {
    switch (this.openFrom) {
      case "left":
        return document.dir === "ltr" ? ["inset(0 100% 0 0 round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm))"] : ["inset(0 0 0 100% round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm))"];
      case "right":
        return document.dir === "ltr" ? ["inset(0 0 0 100% round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm)"] : ["inset(0 100% 0 0 round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm))"];
      case "bottom":
        return ["inset(100% 0 0 0 round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm))"];
      case "top":
        return ["inset(0 0 100% 0 round var(--rounded-sm))", "inset(0 0 0 0 round var(--rounded-sm))"];
    }
  }
  _setInitialPosition() {
    this.style.left = document.dir === "ltr" && this.openFrom === "left" || document.dir === "rtl" && this.openFrom === "right" ? "0px" : null;
    this.style.right = this.style.left === "" ? "0px" : null;
    this.style.bottom = this.openFrom === "bottom" ? "0px" : null;
    this.style.top = this.style.bottom === "" ? "0px" : null;
  }
  _showTransition(animate11 = true) {
    let animationControls;
    this._setInitialPosition();
    if (reduceDrawerAnimation) {
      animationControls = motionAnimate(this, { opacity: [0, 1], visibility: ["hidden", "visible"] }, { duration: 0.2 });
    } else {
      let content = this.shadowRoot.querySelector('[part="content"]'), closeButton = this.shadowRoot.querySelector('[part="outside-close-button"]');
      animationControls = motionTimeline([
        [this, { opacity: [0, 1], visibility: ["hidden", "visible"] }, { duration: 0.15 }],
        [content, { clipPath: this._getClipPathProperties() }, { duration: 0.4, easing: [0.86, 0, 0.07, 1] }],
        [content.children, { opacity: [0, 1] }, { duration: 0.15 }],
        [closeButton, { opacity: [0, 1] }, { at: "<", duration: 0.15 }]
      ]);
    }
    animate11 ? animationControls.play() : animationControls.finish();
    return animationControls.finished.then(() => this.classList.add("show-close-cursor"));
  }
  _hideTransition() {
    let animationControls;
    if (reduceDrawerAnimation) {
      animationControls = motionAnimate(this, { opacity: [1, 0], visibility: ["visibility", "hidden"] }, { duration: 0.2 });
    } else {
      let content = this.shadowRoot.querySelector('[part="content"]'), closeButton = this.shadowRoot.querySelector('[part="outside-close-button"]');
      animationControls = motionTimeline([
        [closeButton, { opacity: [null, 0] }, { duration: 0.15 }],
        [content.children, { opacity: [null, 0] }, { at: "<", duration: 0.15 }],
        [content, { clipPath: this._getClipPathProperties().reverse() }, { duration: 0.4, easing: [0.86, 0, 0.07, 1] }],
        [this, { opacity: [null, 0], visibility: ["visible", "hidden"] }, { duration: 0.15 }]
      ]);
    }
    return animationControls.finished.then(() => this.classList.remove("show-close-cursor"));
  }
  _updateSlotVisibility(slot) {
    if (!["header", "footer", "body"].includes(slot.name)) {
      return;
    }
    slot.parentElement.hidden = slot.assignedElements({ flatten: true }).length === 0;
  }
};
if (!window.customElements.get("x-drawer")) {
  window.customElements.define("x-drawer", Drawer);
}

// js/common/overlay/popover.js
import { animate as motionAnimate2, timeline as motionTimeline2 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var Popover = class extends DialogElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(document.getElementById(this.template).content.cloneNode(true));
  }
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.querySelector('[part="overlay"]')?.addEventListener("click", this.hide.bind(this), { signal: this._abortController.signal });
    this.controls.forEach((control) => control.setAttribute("aria-haspopup", "dialog"));
    if (this.hasAttribute("close-on-listbox-select")) {
      this.addEventListener("listbox:select", this.hide, { signal: this._abortController.signal });
    }
  }
  get template() {
    return this.getAttribute("template") || "popover-default-template";
  }
  get shouldLock() {
    return window.matchMedia("screen and (max-width: 999px)").matches;
  }
  get shouldAppendToBody() {
    return window.matchMedia("screen and (max-width: 999px)").matches;
  }
  get anchor() {
    return {
      vertical: this.getAttribute("anchor-vertical") || "start",
      horizontal: this.getAttribute("anchor-horizontal") || "end"
    };
  }
  _showTransition(animate11 = true) {
    let animationControls, content = this.shadowRoot.querySelector('[part="content"]'), closeButton = this.shadowRoot.querySelector('[part="outside-close-button"]');
    this.style.display = "block";
    if (window.matchMedia("screen and (max-width: 999px)").matches) {
      this.style.left = "0px";
      this.style.right = null;
      this.style.bottom = "0px";
      this.style.top = null;
      animationControls = motionTimeline2([
        [this, { opacity: [0, 1], visibility: ["hidden", "visible"] }, { duration: 0.15 }],
        [content, { clipPath: ["inset(100% 0 0 0 round 8px)", "inset(0 0 0 0 round 8px"] }, { duration: 0.4, easing: [0.86, 0, 0.07, 1] }],
        [content.children, { opacity: [0, 1] }, { duration: 0.15 }],
        [closeButton, { opacity: [0, 1] }, { at: "<", duration: 0.15 }]
      ]);
    } else {
      let spacingBlockValue = "var(--popover-anchor-block-spacing)", spacingInlineValue = "var(--popover-anchor-inline-spacing)";
      this.style.left = this.anchor.horizontal === "start" ? spacingInlineValue : null;
      this.style.right = this.anchor.horizontal === "end" ? spacingInlineValue : null;
      if (this.anchor.vertical === "center") {
        this.style.top = `calc(50% - ${parseInt(this.clientHeight / 2)}px)`;
        this.style.bottom = null;
      } else {
        this.style.top = this.anchor.vertical === "end" ? `calc(100% + ${spacingBlockValue})` : null;
        this.style.bottom = this.anchor.vertical === "start" ? `calc(100% + ${spacingBlockValue})` : null;
      }
      animationControls = motionTimeline2([
        [this, { opacity: [0, 1], visibility: ["hidden", "visible"] }, { duration: 0.15 }],
        [content, { clipPath: "none" }, { at: "<", duration: 0 }],
        [content.children, { opacity: 1 }, { at: "<", duration: 0 }]
      ]);
    }
    animate11 ? animationControls.play() : animationControls.finish();
    return animationControls.finished;
  }
  _hideTransition() {
    let animationControls;
    if (window.matchMedia("screen and (max-width: 999px)").matches) {
      let content = this.shadowRoot.querySelector('[part="content"]'), closeButton = this.shadowRoot.querySelector('[part="outside-close-button"]');
      animationControls = motionTimeline2([
        [closeButton, { opacity: [null, 0] }, { duration: 0.15 }],
        [content.children, { opacity: [null, 0] }, { at: "<", duration: 0.15 }],
        [content, { clipPath: [null, "inset(100% 0 0 0 round 8px)"] }, { duration: 0.4, easing: [0.86, 0, 0.07, 1] }],
        [this, { opacity: [null, 0], visibility: ["visible", "hidden"] }, { duration: 0.15 }]
      ]);
    } else {
      animationControls = motionAnimate2(this, { opacity: [null, 0], visibility: ["visible", "hidden"] }, { duration: 0.15 });
    }
    return animationControls.finished.then(() => this.style.display = "none");
  }
};
if (!window.customElements.get("x-popover")) {
  window.customElements.define("x-popover", Popover);
}

// js/common/overlay/privacy-bar.js
import { Delegate as Delegate2 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var PrivacyBar = class extends HTMLElement {
  constructor() {
    super();
    this._delegate = new Delegate2(this);
    window.Shopify.loadFeatures([{
      name: "consent-tracking-api",
      version: "0.1",
      onLoad: this._onConsentLibraryLoaded.bind(this)
    }]);
    if (Shopify.designMode) {
      const section = this.closest(".shopify-section");
      section.addEventListener("shopify:section:select", this.show.bind(this));
      section.addEventListener("shopify:section:deselect", this.hide.bind(this));
    }
  }
  connectedCallback() {
    this._delegate.on("click", '[data-action="accept"]', this._acceptPolicy.bind(this));
    this._delegate.on("click", '[data-action="decline"]', this._declinePolicy.bind(this));
    this._delegate.on("click", '[data-action="close"]', this.hide.bind(this));
  }
  disconnectedCallback() {
    this._delegate.off();
  }
  show() {
    this.hidden = false;
  }
  hide() {
    this.hidden = true;
  }
  _onConsentLibraryLoaded() {
    if (window.Shopify.customerPrivacy?.shouldShowBanner()) {
      this.show();
    }
  }
  _acceptPolicy() {
    window.Shopify.customerPrivacy?.setTrackingConsent(true, this.hide.bind(this));
  }
  _declinePolicy() {
    window.Shopify.customerPrivacy?.setTrackingConsent(false, this.hide.bind(this));
  }
};
if (!window.customElements.get("privacy-bar")) {
  window.customElements.define("privacy-bar", PrivacyBar);
}

// js/common/cart/cart-drawer.js
var CartDrawer = class extends Drawer {
  constructor() {
    super();
    this._onPrepareBundledSectionsListener = this._onPrepareBundledSections.bind(this);
    this._onCartChangedListener = this._onCartChanged.bind(this);
    this._onCartRefreshListener = this._onCartRefresh.bind(this);
    this._onVariantAddedListener = this._onVariantAdded.bind(this);
    window.addEventListener("pageshow", this._onPageShow.bind(this));
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("cart:prepare-bundled-sections", this._onPrepareBundledSectionsListener);
    document.addEventListener("cart:change", this._onCartChangedListener);
    document.addEventListener("cart:refresh", this._onCartRefreshListener);
    document.addEventListener("variant:add", this._onVariantAddedListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("cart:prepare-bundled-sections", this._onPrepareBundledSectionsListener);
    document.removeEventListener("cart:change", this._onCartChangedListener);
    document.removeEventListener("cart:refresh", this._onCartRefreshListener);
    document.removeEventListener("variant:add", this._onVariantAddedListener);
  }
  get shouldAppendToBody() {
    return false;
  }
  get openFrom() {
    return "right";
  }
  _onPrepareBundledSections(event) {
    event.detail.sections.push(extractSectionId(this));
  }
  /**
   * Update the cart drawer content when cart content changes.
   */
  async _onCartChanged(event) {
    const updatedDrawerContent = new DOMParser().parseFromString(event.detail.cart["sections"][extractSectionId(this)], "text/html");
    if (event.detail.cart["item_count"] > 0) {
      const currentLineItemsElement = this.querySelector(".cart-drawer__line-items"), updatedLineItemsElement = updatedDrawerContent.querySelector(".cart-drawer__line-items");
      if (!currentLineItemsElement) {
        this.replaceChildren(document.createRange().createContextualFragment(updatedDrawerContent.querySelector(".cart-drawer").innerHTML));
      } else {
        setTimeout(() => {
          currentLineItemsElement.innerHTML = updatedLineItemsElement.innerHTML;
        }, event.detail.baseEvent === "variant:add" ? 0 : 1250);
        this.querySelector('[slot="footer"]').replaceChildren(...updatedDrawerContent.querySelector('[slot="footer"]').childNodes);
      }
    } else {
      await animate4(this.children, { opacity: 0 }, { duration: 0.15 }).finished;
      this.replaceChildren(...updatedDrawerContent.querySelector(".cart-drawer").childNodes);
      animate4(this.querySelector(".empty-state"), { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0)"] }, { duration: 0.15 });
    }
  }
  /**
   * Handle the case when the page is served from BF cache
   */
  _onPageShow(event) {
    if (!event.persisted) {
      return;
    }
    this._onCartRefresh();
  }
  /**
   * Listeners called when a new variant has been added
   */
  _onVariantAdded(event) {
    if (window.themeVariables.settings.cartType !== "drawer" || event.detail?.blockCartDrawerOpening) {
      return;
    }
    this.show();
  }
  /**
   * Force a complete refresh of the cart drawer (this is called by dispatching the 'cart:refresh' on the document)
   */
  async _onCartRefresh() {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = await (await fetch(`${window.Shopify.routes.root}?section_id=${extractSectionId(this)}`)).text();
    this.replaceChildren(...tempDiv.querySelector("#cart-drawer").children);
  }
};
var CartNotificationDrawer = class extends Drawer {
  constructor() {
    super();
    this._onVariantAddedListener = this._onVariantAdded.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("variant:add", this._onVariantAddedListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("variant:add", this._onVariantAddedListener);
  }
  async show() {
    this.style.display = "block";
    return super.show();
  }
  async hide() {
    super.hide()?.then(() => {
      this.style.display = "none";
    });
  }
  _onVariantAdded(event) {
    if (window.themeVariables.settings.cartType !== "popover" || event.detail?.blockCartDrawerOpening) {
      return;
    }
    const tempContent = document.createElement("div");
    tempContent.innerHTML = event.detail.cart["sections"]["variant-added"];
    this.replaceChildren(...tempContent.querySelector(".shopify-section").children);
    this.show();
  }
};
var LineItem = class extends HTMLElement {
  connectedCallback() {
    this.pillLoaderElement = this.querySelector("pill-loader");
    this.addEventListener("line-item:will-change", this._onWillChange.bind(this));
    this.addEventListener("line-item:change", this._onChanged.bind(this));
  }
  _onWillChange() {
    this.pillLoaderElement.setAttribute("aria-busy", "true");
  }
  async _onChanged(event) {
    this.pillLoaderElement.removeAttribute("aria-busy");
    if (event.detail.cart["item_count"] === 0 || event.detail.quantity !== 0) {
      return;
    }
    let marginCompensation = 0;
    if (this.nextElementSibling) {
      marginCompensation = `-${getComputedStyle(this.nextElementSibling).paddingTop}`;
    }
    await animate4(this, { height: [`${this.clientHeight}px`, 0], marginBottom: [0, marginCompensation], overflow: "hidden", opacity: [1, 0] }, { duration: 0.2, easing: "ease" }).finished;
    this.remove();
  }
};
if (!window.customElements.get("cart-drawer")) {
  window.customElements.define("cart-drawer", CartDrawer);
}
if (!window.customElements.get("cart-notification-drawer")) {
  window.customElements.define("cart-notification-drawer", CartNotificationDrawer);
}
if (!window.customElements.get("line-item")) {
  window.customElements.define("line-item", LineItem);
}

// js/common/cart/cart-note.js
var CartNote = class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this._onNoteChanged);
  }
  _onNoteChanged(event) {
    if (event.target.getAttribute("name") !== "note") {
      return;
    }
    fetch(`${Shopify.routes.root}cart/update.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: event.target.value }),
      keepalive: true
      // Allows to make sure the request is fired even when submitting the form
    });
  }
};
var CartNoteDialog = class extends DialogElement {
  constructor() {
    super();
    this.addEventListener("change", this._onNoteChanged);
  }
  _onNoteChanged(event) {
    if (event.target.value === "") {
      this.controls.forEach((control) => control.innerHTML = `<span class="link text-sm text-subdued">${window.themeVariables.strings.addOrderNote}</span>`);
    } else {
      this.controls.forEach((control) => control.innerHTML = `<span class="link text-sm text-subdued">${window.themeVariables.strings.editOrderNote}</span>`);
    }
  }
};
if (!window.customElements.get("cart-note")) {
  window.customElements.define("cart-note", CartNote);
}
if (!window.customElements.get("cart-note-dialog")) {
  window.customElements.define("cart-note-dialog", CartNoteDialog);
}

// js/common/cart/free-shipping-bar.js
var FreeShippingBar = class extends HTMLElement {
  static get observedAttributes() {
    return ["threshold", "total-price"];
  }
  constructor() {
    super();
    this._onCartChangedListener = this._onCartChanged.bind(this);
  }
  async connectedCallback() {
    this.threshold = Math.round(this.threshold * (Shopify.currency.rate || 1));
    document.addEventListener("cart:change", this._onCartChangedListener);
  }
  disconnectedCallback() {
    document.removeEventListener("cart:change", this._onCartChangedListener);
  }
  get threshold() {
    return parseFloat(this.getAttribute("threshold"));
  }
  set threshold(value) {
    this.setAttribute("threshold", value);
  }
  get totalPrice() {
    return parseFloat(this.getAttribute("total-price"));
  }
  set totalPrice(value) {
    this.setAttribute("total-price", value);
  }
  async attributeChangedCallback(attribute, oldValue, newValue) {
    await window.customElements.whenDefined("progress-bar");
    const progressBarElement = this.querySelector("progress-bar");
    switch (attribute) {
      case "threshold":
        progressBarElement.valueMax = newValue;
        break;
      case "total-price":
        progressBarElement.valueNow = newValue;
        break;
    }
    this._updateMessage();
  }
  _updateMessage() {
    const messageElement = this.querySelector("span");
    if (this.totalPrice >= this.threshold) {
      messageElement.innerHTML = this.getAttribute("reached-message");
    } else {
      const replacement = `<span class="bold text-accent">${formatMoney(this.threshold - this.totalPrice).replace(/\$/g, "$$$$")}</span>`;
      messageElement.innerHTML = this.getAttribute("unreached-message").replace(new RegExp("({{.*}})", "g"), replacement);
    }
  }
  _onCartChanged(event) {
    const priceForItems = event.detail["cart"]["items"].filter((item) => item["requires_shipping"]).reduce((sum, item) => sum + item["final_line_price"], 0), cartDiscount = event.detail["cart"]["cart_level_discount_applications"].reduce((sum, discountAllocation) => sum + discountAllocation["total_allocated_amount"], 0);
    this.totalPrice = priceForItems - cartDiscount;
  }
};
if (!window.customElements.get("free-shipping-bar")) {
  window.customElements.define("free-shipping-bar", FreeShippingBar);
}

// js/common/cart/line-item-quantity.js
var LineItemQuantity = class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this._onQuantityChanged);
    this.addEventListener("click", this._onRemoveLinkClicked);
  }
  _onQuantityChanged(event) {
    if (!event.target.hasAttribute("data-line-key")) {
      return;
    }
    this._changeLineItemQuantity(event.target.getAttribute("data-line-key"), parseInt(event.target.value));
  }
  _onRemoveLinkClicked(event) {
    if (event.target.tagName !== "A" || !event.target.href.includes("/cart/change")) {
      return;
    }
    event.preventDefault();
    const url = new URL(event.target.href);
    this._changeLineItemQuantity(url.searchParams.get("id"), parseInt(url.searchParams.get("quantity")));
  }
  async _changeLineItemQuantity(lineKey, targetQuantity) {
    if (window.themeVariables.settings.pageType === "cart") {
      window.location.href = `${Shopify.routes.root}cart/change?id=${lineKey}&quantity=${targetQuantity}`;
    } else {
      const lineItem = this.closest("line-item");
      lineItem?.dispatchEvent(new CustomEvent("line-item:will-change", { bubbles: true, detail: { targetQuantity } }));
      let sectionsToBundle = [];
      document.documentElement.dispatchEvent(new CustomEvent("cart:prepare-bundled-sections", { bubbles: true, detail: { sections: sectionsToBundle } }));
      const cartContent = await (await fetch(`${Shopify.routes.root}cart/change.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: lineKey,
          quantity: targetQuantity,
          sections: sectionsToBundle
        })
      })).json();
      const lineItemAfterChange = cartContent["items"].filter((lineItem2) => lineItem2["key"] === lineKey);
      lineItem?.dispatchEvent(new CustomEvent("line-item:change", {
        bubbles: true,
        detail: {
          quantity: lineItemAfterChange.length === 0 ? 0 : lineItemAfterChange[0]["quantity"],
          cart: cartContent
        }
      }));
      document.documentElement.dispatchEvent(new CustomEvent("cart:change", {
        bubbles: true,
        detail: {
          baseEvent: "line-item:change",
          cart: cartContent
        }
      }));
    }
  }
};
if (!window.customElements.get("line-item-quantity")) {
  window.customElements.define("line-item-quantity", LineItemQuantity);
}

// js/common/cart/shipping-estimator.js
var ShippingEstimator = class extends HTMLElement {
  constructor() {
    super();
    this._estimateShippingListener = this._estimateShipping.bind(this);
  }
  connectedCallback() {
    this.submitButton = this.querySelector('[type="submit"]');
    this.resultsElement = this.lastElementChild;
    this.submitButton.addEventListener("click", this._estimateShippingListener);
  }
  disconnectedCallback() {
    this.submitButton.removeEventListener("click", this._estimateShippingListener);
  }
  /**
   * @doc https://shopify.dev/docs/themes/ajax-api/reference/cart#generate-shipping-rates
   */
  async _estimateShipping(event) {
    event.preventDefault();
    const zip = this.querySelector('[name="address[zip]"]').value, country = this.querySelector('[name="address[country]"]').value, province = this.querySelector('[name="address[province]"]').value;
    this.submitButton.setAttribute("aria-busy", "true");
    const prepareResponse = await fetch(`${Shopify.routes.root}cart/prepare_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`, { method: "POST" });
    if (prepareResponse.ok) {
      const shippingRates = await this._getAsyncShippingRates(zip, country, province);
      this._formatShippingRates(shippingRates);
    } else {
      const jsonError = await prepareResponse.json();
      this._formatError(jsonError);
    }
    this.resultsElement.hidden = false;
    this.submitButton.removeAttribute("aria-busy");
  }
  async _getAsyncShippingRates(zip, country, province) {
    const response = await fetch(`${Shopify.routes.root}cart/async_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`);
    const responseAsText = await response.text();
    if (responseAsText === "null") {
      return this._getAsyncShippingRates(zip, country, province);
    } else {
      return JSON.parse(responseAsText)["shipping_rates"];
    }
  }
  _formatShippingRates(shippingRates) {
    let formattedShippingRates = shippingRates.map((shippingRate) => {
      return `<li>${shippingRate["presentment_name"]}: ${shippingRate["currency"]} ${shippingRate["price"]}</li>`;
    });
    this.resultsElement.innerHTML = `
      <div class="v-stack gap-2">
        <p>${shippingRates.length === 0 ? window.themeVariables.strings.shippingEstimatorNoResults : shippingRates.length === 1 ? window.themeVariables.strings.shippingEstimatorOneResult : window.themeVariables.strings.shippingEstimatorMultipleResults}</p>
        ${formattedShippingRates === "" ? "" : `<ul class="list-disc" role="list">${formattedShippingRates.join("")}</ul>`}
      </div>
    `;
  }
  _formatError(errors) {
    let formattedShippingRates = Object.keys(errors).map((errorKey) => {
      return `<li>${errors[errorKey]}</li>`;
    });
    this.resultsElement.innerHTML = `
      <div class="v-stack gap-2">
        <p>${window.themeVariables.strings.shippingEstimatorError}</p>
        <ul class="list-disc" role="list">${formattedShippingRates}</ul>
      </div>
    `;
  }
};
if (!window.customElements.get("shipping-estimator")) {
  window.customElements.define("shipping-estimator", ShippingEstimator);
}

// js/common/facets/facet-apply-button.js
var FacetApplyButton = class extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", this._closeDrawer);
    this.form.addEventListener("change", this._updateCount.bind(this));
    this.filterCountElement = document.createElement("span");
    this.appendChild(this.filterCountElement);
  }
  connectedCallback() {
    this._updateCount();
  }
  _updateCount() {
    const form = new FormData(this.form);
    this.filterCountElement.innerText = ` (${Array.from(form.values()).filter((item) => item !== "").length})`;
  }
  async _closeDrawer() {
    this.closest("facet-drawer").hide();
  }
};
if (!window.customElements.get("facet-apply-button")) {
  window.customElements.define("facet-apply-button", FacetApplyButton, { extends: "button" });
}

// js/common/facets/facet-dialog.js
var FacetDialog = class extends DialogElement {
  get initialFocus() {
    return false;
  }
};
if (!window.customElements.get("facet-dialog")) {
  window.customElements.define("facet-dialog", FacetDialog);
}

// js/common/facets/facet-drawer.js
var FacetDrawer = class extends Drawer {
  constructor() {
    super();
    this.addEventListener("dialog:after-hide", this._submitForm);
  }
  _submitForm() {
    this.querySelector("#facet-form").dispatchEvent(new Event("submit"));
  }
};
if (!window.customElements.get("facet-drawer")) {
  window.customElements.define("facet-drawer", FacetDrawer);
}

// js/common/facets/facet-floating-filter.js
import { animate as animate5 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var FacetFloatingFilter = class extends HTMLElement {
  connectedCallback() {
    new IntersectionObserver(this._onFooterVisibilityChanged.bind(this), { rootMargin: "50px 0px" }).observe(document.querySelector(".shopify-section--footer"));
  }
  _onFooterVisibilityChanged(entries) {
    if (entries[0].isIntersecting) {
      animate5(this, { opacity: 0, transform: [null, "translateY(15px)"], visibility: "hidden" }, { duration: 0.15 });
    } else {
      animate5(this, { opacity: 1, transform: [null, "translateY(0)"], visibility: "visible" }, { duration: 0.15 });
    }
  }
};
if (!window.customElements.get("facet-floating-filter")) {
  window.customElements.define("facet-floating-filter", FacetFloatingFilter);
}

// js/common/facets/facet-form.js
var abortController = null;
var openElements = /* @__PURE__ */ new Set();
document.addEventListener("facet:update", async (event) => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  const url = event.detail.url, shopifySection = document.getElementById(`shopify-section-${url.searchParams.get("section_id")}`);
  shopifySection.classList.add("is-loading");
  const clonedUrl = new URL(url);
  clonedUrl.searchParams.delete("section_id");
  history.replaceState({}, "", clonedUrl.toString());
  try {
    const tempContent = new DOMParser().parseFromString(await (await cachedFetch(url.toString(), { signal: abortController.signal })).text(), "text/html");
    Array.from(tempContent.querySelectorAll("details, facet-dialog")).forEach((item) => {
      if (openElements.has(item.id)) {
        item.setAttribute("open", "");
      }
    });
    shopifySection.replaceChildren(...document.importNode(tempContent.querySelector(".shopify-section"), true).childNodes);
    shopifySection.classList.remove("is-loading");
    const scrollToElement = window.matchMedia("(min-width: 700px) and (max-width: 999px)").matches ? shopifySection.querySelector(".collection__results") : shopifySection.querySelector(".collection__results product-list"), scrollToBoundingRect = scrollToElement.getBoundingClientRect();
    if (scrollToBoundingRect.top < parseInt(getComputedStyle(scrollToElement).scrollPaddingTop || 0)) {
      scrollToElement.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  } catch (e) {
  }
});
var FacetForm = class extends HTMLFormElement {
  constructor() {
    super();
    this._isDirty = false;
    this.addEventListener("change", this._onFormChanged);
    this.addEventListener("submit", this._onFormSubmitted);
  }
  connectedCallback() {
    Array.from(this.querySelectorAll("details, facet-dialog")).forEach((disclosureElement) => {
      if (disclosureElement.open) {
        openElements.add(disclosureElement.id);
      }
      disclosureElement.addEventListener("toggle", () => {
        if (disclosureElement.open) {
          openElements.add(disclosureElement.id);
        } else {
          openElements.delete(disclosureElement.id);
        }
      });
    });
  }
  _buildUrl() {
    const searchParams = new URLSearchParams(new FormData(this)), url = new URL(this.action);
    url.search = "";
    searchParams.forEach((value, key) => url.searchParams.append(key, value));
    ["page", "filter.v.price.gte", "filter.v.price.lte"].forEach((optionToClear) => {
      if (url.searchParams.get(optionToClear) === "") {
        url.searchParams.delete(optionToClear);
      }
    });
    url.searchParams.set("section_id", this.getAttribute("section-id"));
    return url;
  }
  _onFormChanged() {
    this._isDirty = true;
    if (this.hasAttribute("update-on-change")) {
      this.dispatchEvent(new Event("submit", { cancelable: true }));
    } else {
      cachedFetch(this._buildUrl().toString());
    }
  }
  _onFormSubmitted(event) {
    event.preventDefault();
    if (!this._isDirty) {
      return;
    }
    this.dispatchEvent(new CustomEvent("facet:update", {
      bubbles: true,
      detail: {
        url: this._buildUrl()
      }
    }));
    this._isDirty = false;
  }
};
if (!window.customElements.get("facet-form")) {
  window.customElements.define("facet-form", FacetForm, { extends: "form" });
}

// js/common/facets/facet-link.js
var FacetLink = class extends HTMLAnchorElement {
  constructor() {
    super();
    this.addEventListener("click", this._onFacetUpdate);
  }
  _onFacetUpdate(event) {
    event.preventDefault();
    const sectionId = event.target.closest(".shopify-section").id.replace("shopify-section-", ""), url = new URL(this.href);
    url.searchParams.set("section_id", sectionId);
    this.dispatchEvent(new CustomEvent("facet:update", {
      bubbles: true,
      detail: {
        url
      }
    }));
  }
};
if (!window.customElements.get("facet-link")) {
  window.customElements.define("facet-link", FacetLink, { extends: "a" });
}

// js/common/facets/facet-sort-by.js
var FacetSortBy = class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("listbox:change", this._onValueChanged);
  }
  _onValueChanged(event) {
    const url = new URL(location.href), sectionId = event.target.closest(".shopify-section").id.replace("shopify-section-", "");
    url.searchParams.set("sort_by", event.detail.value);
    url.searchParams.set("section_id", sectionId);
    url.searchParams.delete("page");
    this.dispatchEvent(new CustomEvent("facet:update", {
      bubbles: true,
      detail: {
        url
      }
    }));
  }
};
if (!window.customElements.get("facet-sort-by")) {
  window.customElements.define("facet-sort-by", FacetSortBy);
}

// js/common/feedback/pill-loader.js
import { animate as animate6, timeline as timeline4, stagger as stagger4 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var PillLoader = class extends HTMLElement {
  static get observedAttributes() {
    return ["aria-busy"];
  }
  connectedCallback() {
    this.innerHTML = `
      <div class="loader-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <svg class="loader-checkmark" fill="none" width="9" height="8" viewBox="0 0 9 8">
        <path d="M1 3.5 3.3 6 8 1" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === "true") {
      timeline4([
        [this, { opacity: [0, 1], visibility: "visible", transform: ["translateY(5px)", "translateY(0)"] }, { duration: 0.15 }],
        [this.firstElementChild, { opacity: 1, transform: ["translateY(0)"] }, { duration: 0.15, at: "<" }],
        [this.lastElementChild, { opacity: 0 }, { duration: 0, at: "<" }]
      ]);
      animate6(this.firstElementChild.querySelectorAll("span"), { opacity: [1, 0.1] }, { duration: 0.35, delay: stagger4(0.35 / 3), direction: "alternate", repeat: Infinity });
    } else {
      timeline4([
        [this.firstElementChild, { opacity: 0, transform: ["translateY(0)", "translateY(-2px)"] }, { duration: 0.15 }],
        [this.lastElementChild, { opacity: 1, transform: ["translateY(2px)", "translateY(0)"] }, { duration: 0.15 }],
        [this, { opacity: 0, transform: ["translateY(0)", "translateY(-5px)"], visibility: "hidden" }, { duration: 0.15, at: "+0.8" }]
      ]);
    }
  }
};
if (!window.customElements.get("pill-loader")) {
  window.customElements.define("pill-loader", PillLoader);
}

// js/common/feedback/progress-bar.js
var ProgressBar = class extends HTMLElement {
  static get observedAttributes() {
    return ["aria-valuenow", "aria-valuemax"];
  }
  set valueMax(value) {
    this.setAttribute("aria-valuemax", value);
  }
  set valueNow(value) {
    this.setAttribute("aria-valuenow", value);
  }
  attributeChangedCallback() {
    this.style.setProperty("--progress", `${Math.min(1, this.getAttribute("aria-valuenow") / this.getAttribute("aria-valuemax"))}`);
  }
};
if (!window.customElements.get("progress-bar")) {
  window.customElements.define("progress-bar", ProgressBar);
}

// js/common/form/price-range.js
var PriceRange = class extends HTMLElement {
  connectedCallback() {
    this._abortController = new AbortController();
    this.rangeLowerBound = this.querySelector('input[type="range"]:first-child');
    this.rangeHigherBound = this.querySelector('input[type="range"]:last-child');
    this.textInputLowerBound = this.querySelector('input[name="filter.v.price.gte"]');
    this.textInputHigherBound = this.querySelector('input[name="filter.v.price.lte"]');
    this.textInputLowerBound.addEventListener("focus", () => this.textInputLowerBound.select(), { signal: this._abortController.signal });
    this.textInputHigherBound.addEventListener("focus", () => this.textInputHigherBound.select(), { signal: this._abortController.signal });
    this.textInputLowerBound.addEventListener("change", (event) => {
      event.preventDefault();
      event.target.value = Math.max(Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1), event.target.min);
      this.rangeLowerBound.value = event.target.value;
      this.rangeLowerBound.parentElement.style.setProperty("--range-min", `${parseInt(this.rangeLowerBound.value) / parseInt(this.rangeLowerBound.max) * 100}%`);
    }, { signal: this._abortController.signal });
    this.textInputHigherBound.addEventListener("change", (event) => {
      event.preventDefault();
      event.target.value = Math.min(Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1), event.target.max);
      this.rangeHigherBound.value = event.target.value;
      this.rangeHigherBound.parentElement.style.setProperty("--range-max", `${parseInt(this.rangeHigherBound.value) / parseInt(this.rangeHigherBound.max) * 100}%`);
    }, { signal: this._abortController.signal });
    this.rangeLowerBound.addEventListener("change", (event) => {
      event.stopPropagation();
      this.textInputLowerBound.value = event.target.value;
      this.textInputLowerBound.dispatchEvent(new Event("change", { bubbles: true }));
    }, { signal: this._abortController.signal });
    this.rangeHigherBound.addEventListener("change", (event) => {
      event.stopPropagation();
      this.textInputHigherBound.value = event.target.value;
      this.textInputHigherBound.dispatchEvent(new Event("change", { bubbles: true }));
    }, { signal: this._abortController.signal });
    this.rangeLowerBound.addEventListener("input", (event) => {
      event.target.value = Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1);
      event.target.parentElement.style.setProperty("--range-min", `${parseInt(event.target.value) / parseInt(event.target.max) * 100}%`);
      this.textInputLowerBound.value = event.target.value;
    }, { signal: this._abortController.signal });
    this.rangeHigherBound.addEventListener("input", (event) => {
      event.target.value = Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1);
      event.target.parentElement.style.setProperty("--range-max", `${parseInt(event.target.value) / parseInt(event.target.max) * 100}%`);
      this.textInputHigherBound.value = event.target.value;
    }, { signal: this._abortController.signal });
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
};
if (!window.customElements.get("price-range")) {
  window.customElements.define("price-range", PriceRange);
}

// js/common/form/quantity-selector.js
var QuantitySelector = class extends HTMLElement {
  connectedCallback() {
    this._abortController = new AbortController();
    this.inputElement = this.querySelector("input");
    this.querySelector("button:first-of-type").addEventListener("click", () => this.inputElement.quantity = this.inputElement.quantity - 1, { signal: this._abortController.signal });
    this.querySelector("button:last-of-type").addEventListener("click", () => this.inputElement.quantity = this.inputElement.quantity + 1, { signal: this._abortController.signal });
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
};
var QuantityInput = class extends HTMLInputElement {
  constructor() {
    super();
    this.addEventListener("input", this._onValueInput);
    this.addEventListener("change", this._onValueChanged);
    this.addEventListener("keydown", this._onKeyDown);
    this.addEventListener("focus", this.select);
  }
  disconnectedCallback() {
    this._abortController?.abort();
  }
  get quantity() {
    return parseInt(this.value);
  }
  set quantity(quantity) {
    const isNumeric = (typeof quantity === "number" || typeof quantity === "string" && quantity.trim() !== "") && !isNaN(quantity);
    if (quantity === "") {
      return;
    }
    if (!isNumeric || quantity < 0) {
      quantity = parseInt(quantity) || 1;
    }
    this.value = Math.max(this.min || 1, Math.min(quantity, this.max || Number.MAX_VALUE)).toString();
    this.size = Math.max(this.value.length + 1, 2);
  }
  _onValueInput() {
    this.quantity = this.value;
  }
  _onValueChanged() {
    if (this.value === "") {
      this.quantity = 1;
    }
  }
  _onKeyDown(event) {
    event.stopPropagation();
    const originalQuantity = this.quantity;
    if (event.key === "ArrowUp") {
      this.quantity = this.quantity + 1;
    } else if (event.key === "ArrowDown") {
      this.quantity = this.quantity - 1;
    }
    if (originalQuantity !== this.quantity) {
      this._abortController = new AbortController();
      this.addEventListener("blur", () => this.dispatchEvent(new Event("change", { bubbles: true })), { once: true, signal: this._abortController.signal });
    }
  }
};
if (!window.customElements.get("quantity-selector")) {
  window.customElements.define("quantity-selector", QuantitySelector);
}
if (!window.customElements.get("quantity-input")) {
  window.customElements.define("quantity-input", QuantityInput, { extends: "input" });
}

// js/common/form/resizable-textarea.js
var ResizableTextarea = class extends HTMLTextAreaElement {
  constructor() {
    super();
    this.addEventListener("input", this._onInput);
  }
  _onInput() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + 2 + "px";
  }
};
if (!window.customElements.get("resizable-textarea")) {
  window.customElements.define("resizable-textarea", ResizableTextarea, { extends: "textarea" });
}

// js/common/list/listbox.js
var _accessibilityInitialized, _hiddenInput, _onOptionClicked, onOptionClicked_fn, _onInputChanged, onInputChanged_fn, _onKeyDown, onKeyDown_fn;
var Listbox = class extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _onOptionClicked);
    __privateAdd(this, _onInputChanged);
    __privateAdd(this, _onKeyDown);
    __privateAdd(this, _accessibilityInitialized, false);
    __privateAdd(this, _hiddenInput, void 0);
    this.addEventListener("keydown", __privateMethod(this, _onKeyDown, onKeyDown_fn));
  }
  static get observedAttributes() {
    return ["aria-activedescendant"];
  }
  connectedCallback() {
    if (!__privateGet(this, _accessibilityInitialized)) {
      this.setAttribute("role", "listbox");
      __privateSet(this, _hiddenInput, this.querySelector('input[type="hidden"]'));
      __privateGet(this, _hiddenInput)?.addEventListener("change", __privateMethod(this, _onInputChanged, onInputChanged_fn).bind(this));
      Array.from(this.querySelectorAll('[role="option"]')).forEach((option) => {
        option.addEventListener("click", __privateMethod(this, _onOptionClicked, onOptionClicked_fn).bind(this));
        option.id = "option-" + (crypto.randomUUID ? crypto.randomUUID() : Math.floor(Math.random() * 1e4));
        if (option.getAttribute("aria-selected") === "true") {
          this.setAttribute("aria-activedescendant", option.id);
        }
      });
      __privateSet(this, _accessibilityInitialized, true);
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "aria-activedescendant" && oldValue !== null && newValue !== oldValue) {
      Array.from(this.querySelectorAll('[role="option"]')).forEach((option) => {
        if (option.id === newValue) {
          option.setAttribute("aria-selected", "true");
          if (__privateGet(this, _hiddenInput) && __privateGet(this, _hiddenInput).value !== option.value) {
            __privateGet(this, _hiddenInput).value = option.value;
            __privateGet(this, _hiddenInput).dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (this.hasAttribute("aria-owns")) {
            this.getAttribute("aria-owns").split(" ").forEach((boundId) => {
              document.getElementById(boundId).textContent = option.getAttribute("title") || option.innerText || option.value;
            });
          }
          option.dispatchEvent(new CustomEvent("listbox:change", {
            bubbles: true,
            detail: {
              value: option.value
            }
          }));
        } else {
          option.setAttribute("aria-selected", "false");
        }
      });
    }
  }
};
_accessibilityInitialized = new WeakMap();
_hiddenInput = new WeakMap();
_onOptionClicked = new WeakSet();
onOptionClicked_fn = function(event) {
  this.setAttribute("aria-activedescendant", event.currentTarget.id);
  event.currentTarget.dispatchEvent(new CustomEvent("listbox:select", {
    bubbles: true,
    detail: {
      value: event.currentTarget.value
    }
  }));
};
_onInputChanged = new WeakSet();
onInputChanged_fn = function(event) {
  this.setAttribute("aria-activedescendant", this.querySelector(`[role="option"][value="${CSS.escape(event.target.value)}"]`).id);
};
_onKeyDown = new WeakSet();
onKeyDown_fn = function(event) {
  if (event.key === "ArrowUp") {
    event.target.previousElementSibling?.focus();
    event.preventDefault();
  } else if (event.key === "ArrowDown") {
    event.target.nextElementSibling?.focus();
    event.preventDefault();
  }
};
if (!window.customElements.get("x-listbox")) {
  window.customElements.define("x-listbox", Listbox);
}

// js/common/media/image.js
function imageLoaded(imageOrArray) {
  if (!imageOrArray) {
    return Promise.resolve();
  }
  imageOrArray = imageOrArray instanceof Element ? [imageOrArray] : Array.from(imageOrArray);
  return Promise.all(imageOrArray.map((image) => {
    return new Promise((resolve) => {
      if (image.tagName === "IMG" && image.complete || !image.offsetParent) {
        resolve();
      } else {
        image.onload = () => resolve();
      }
    });
  }));
}
function generateSrcset(imageObject, widths = []) {
  const imageUrl = new URL(imageObject["src"]);
  return widths.filter((width) => width <= imageObject["width"]).map((width) => {
    imageUrl.searchParams.set("width", width.toString());
    return `${imageUrl.href} ${width}w`;
  }).join(", ");
}
function createMediaImg(media, widths = [], properties = {}) {
  const image = new Image(media["preview_image"]["width"], media["preview_image"]["height"]), featuredMediaUrl = new URL(media["preview_image"]["src"]);
  for (const propertyKey in properties) {
    image.setAttribute(propertyKey, properties[propertyKey]);
  }
  image.alt = media["alt"];
  image.src = featuredMediaUrl.href;
  image.srcset = generateSrcset(media["preview_image"], widths);
  return image;
}

// js/common/product/gift-card-recipient.js
var _recipientCheckbox, _recipientOtherProperties, _recipientFieldsContainer, _synchronizeProperties, synchronizeProperties_fn;
var GiftCardRecipient = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _synchronizeProperties);
    __privateAdd(this, _recipientCheckbox, void 0);
    __privateAdd(this, _recipientOtherProperties, []);
    __privateAdd(this, _recipientFieldsContainer, void 0);
  }
  connectedCallback() {
    const properties = Array.from(this.querySelectorAll('[name*="properties"]')), checkboxPropertyName = "properties[__shopify_send_gift_card_to_recipient]";
    __privateSet(this, _recipientCheckbox, properties.find((input) => input.name === checkboxPropertyName));
    __privateSet(this, _recipientOtherProperties, properties.filter((input) => input.name !== checkboxPropertyName));
    __privateSet(this, _recipientFieldsContainer, this.querySelector(".gift-card-recipient__fields"));
    __privateGet(this, _recipientCheckbox)?.addEventListener("change", __privateMethod(this, _synchronizeProperties, synchronizeProperties_fn).bind(this));
    __privateMethod(this, _synchronizeProperties, synchronizeProperties_fn).call(this);
  }
};
_recipientCheckbox = new WeakMap();
_recipientOtherProperties = new WeakMap();
_recipientFieldsContainer = new WeakMap();
_synchronizeProperties = new WeakSet();
synchronizeProperties_fn = function() {
  __privateGet(this, _recipientOtherProperties).forEach((property) => property.disabled = !__privateGet(this, _recipientCheckbox).checked);
  __privateGet(this, _recipientFieldsContainer).classList.toggle("js:hidden", !__privateGet(this, _recipientCheckbox).checked);
};
if (!window.customElements.get("gift-card-recipient")) {
  window.customElements.define("gift-card-recipient", GiftCardRecipient);
}

// js/common/product/product-loader.js
var ProductLoader = class {
  static load(productHandle) {
    if (!productHandle) {
      return;
    }
    if (this.loadedProducts[productHandle]) {
      return this.loadedProducts[productHandle];
    }
    this.loadedProducts[productHandle] = new Promise(async (resolve, reject) => {
      const response = await fetch(`${Shopify.routes.root}products/${productHandle}.js`);
      if (response.ok) {
        const responseAsJson = await response.json();
        resolve(responseAsJson);
      } else {
        reject(`
          Attempted to load information for product with handle ${productHandle}, but this product is in "draft" mode. You won't be able to
          switch between variants or access to per-variant information. To fully preview this product, change temporarily its status
          to "active".
        `);
      }
    });
    return this.loadedProducts[productHandle];
  }
};
__publicField(ProductLoader, "loadedProducts", {});

// js/common/product/product-card.js
import { Delegate as Delegate3 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var ProductCard = class extends HTMLElement {
  constructor() {
    super();
    this._delegate = new Delegate3(this);
    this.addEventListener("pointerover", () => ProductLoader.load(this.getAttribute("handle")), { once: true });
  }
  connectedCallback() {
    this._delegate.on("change", '[type="radio"]', this._onSwatchChanged.bind(this));
    this._delegate.on("pointerover", '[type="radio"] + label', this._onSwatchHovered.bind(this), true);
  }
  disconnectedCallback() {
    this._delegate.off();
  }
  async _onSwatchHovered(event, target) {
    const firstMatchingVariant = await this._getMatchingVariant(target.control), primaryMediaElement = this.querySelector(".product-card__image--primary");
    if (firstMatchingVariant.hasOwnProperty("featured_media")) {
      this._createImageElement(firstMatchingVariant["featured_media"], primaryMediaElement.className, primaryMediaElement.sizes);
    }
  }
  async _onSwatchChanged(event, target) {
    const firstMatchingVariant = await this._getMatchingVariant(target);
    this.querySelectorAll(`a[href^="${this.product["url"]}"`).forEach((link) => {
      const url = new URL(link.href);
      url.searchParams.set("variant", firstMatchingVariant["id"]);
      link.href = `${url.pathname}${url.search}${url.hash}`;
    });
    if (!firstMatchingVariant.hasOwnProperty("featured_media")) {
      return;
    }
    const primaryMediaElement = this.querySelector(".product-card__image--primary"), secondaryMediaElement = this.querySelector(".product-card__image--secondary");
    const newPrimaryMediaElement = this._createImageElement(firstMatchingVariant["featured_media"], primaryMediaElement.className, primaryMediaElement.sizes);
    if (primaryMediaElement.src !== newPrimaryMediaElement.src) {
      secondaryMediaElement ? secondaryMediaElement.replaceWith(this._createImageElement(this.product["media"][firstMatchingVariant["featured_media"]["position"]] || this.product["media"][1], secondaryMediaElement.className, secondaryMediaElement.sizes)) : null;
      await primaryMediaElement.animate({ opacity: [1, 0] }, { duration: 250, easing: "ease-in", fill: "forwards" }).finished;
      await new Promise((resolve) => newPrimaryMediaElement.complete ? resolve() : newPrimaryMediaElement.onload = () => resolve());
      primaryMediaElement.replaceWith(newPrimaryMediaElement);
      newPrimaryMediaElement.animate({ opacity: [0, 1] }, { duration: 250, easing: "ease-in" });
    }
  }
  _createImageElement(media, classes, sizes) {
    const previewImage = media["preview_image"], image = new Image(previewImage["width"], previewImage["height"]);
    image.className = classes;
    image.alt = media["alt"];
    image.sizes = sizes;
    image.src = previewImage["src"];
    image.srcset = generateSrcset(previewImage, [200, 300, 400, 500, 600, 700, 800, 1e3, 1200, 1400, 1600, 1800]);
    return image;
  }
  async _getMatchingVariant(target) {
    this.product = await ProductLoader.load(this.getAttribute("handle"));
    return this.product["variants"].find((variant) => variant[`option${target.closest("[data-option-position]").getAttribute("data-option-position")}`] === target.value);
  }
};
if (!window.customElements.get("product-card")) {
  window.customElements.define("product-card", ProductCard);
}

// js/common/product/product-form.js
var ProductForm = class extends HTMLFormElement {
  constructor() {
    super();
    this.addEventListener("submit", this._onSubmit);
  }
  connectedCallback() {
    this.id.disabled = false;
  }
  async _onSubmit(event) {
    event.preventDefault();
    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }
    const submitButtons = Array.from(this.elements).filter((button) => button.type === "submit");
    submitButtons.forEach((submitButton) => {
      submitButton.setAttribute("disabled", "disabled");
      submitButton.setAttribute("aria-busy", "true");
    });
    let sectionsToBundle = ["variant-added"];
    document.documentElement.dispatchEvent(new CustomEvent("cart:prepare-bundled-sections", { bubbles: true, detail: { sections: sectionsToBundle } }));
    const formData = new FormData(this);
    formData.set("sections", sectionsToBundle.join(","));
    formData.set("sections_url", `${Shopify.routes.root}variants/${this.id.value}`);
    const response = await fetch(`${Shopify.routes.root}cart/add.js`, {
      body: formData,
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
        // Needed for Shopify to check inventory
      }
    });
    submitButtons.forEach((submitButton) => {
      submitButton.removeAttribute("disabled");
      submitButton.removeAttribute("aria-busy");
    });
    const responseJson = await response.json();
    if (response.ok) {
      if (window.themeVariables.settings.cartType === "page" || window.themeVariables.settings.pageType === "cart") {
        return window.location.href = `${Shopify.routes.root}cart`;
      }
      const cartContent = await (await fetch(`${Shopify.routes.root}cart.js`)).json();
      cartContent["sections"] = responseJson["sections"];
      this.dispatchEvent(new CustomEvent("variant:add", {
        bubbles: true,
        detail: {
          items: responseJson.hasOwnProperty("items") ? responseJson["items"] : [responseJson],
          cart: cartContent
        }
      }));
      document.documentElement.dispatchEvent(new CustomEvent("cart:change", {
        bubbles: true,
        detail: {
          baseEvent: "variant:add",
          cart: cartContent
        }
      }));
    } else {
      this.dispatchEvent(new CustomEvent("cart:error", {
        bubbles: true,
        detail: {
          error: responseJson["description"]
        }
      }));
    }
  }
};
if (!window.customElements.get("product-form")) {
  window.customElements.define("product-form", ProductForm, { extends: "form" });
}

// js/common/product/product-form-listeners.js
var BuyButtons = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
    this._onCartErrorListener = this._onCartError.bind(this);
  }
  connectedCallback() {
    this._productForm = document.forms[this.getAttribute("form")];
    this._productForm?.addEventListener("variant:change", this._onVariantChangedListener);
    this._productForm?.addEventListener("cart:error", this._onCartErrorListener);
  }
  disconnectedCallback() {
    this._productForm?.removeEventListener("variant:change", this._onVariantChangedListener);
    this._productForm?.removeEventListener("cart:error", this._onCartErrorListener);
  }
  _onVariantChanged(event) {
    const addToCartButton = this.querySelector('button[type="submit"]'), paymentButton = this.querySelector(".shopify-payment-button");
    addToCartButton.classList.remove("button--secondary", "button--subdued");
    addToCartButton.disabled = !event.detail.variant || !event.detail.variant["available"];
    const addToCartButtonText = addToCartButton.getAttribute("is") === "custom-button" ? addToCartButton.firstElementChild : addToCartButton;
    if (!event.detail.variant) {
      addToCartButtonText.innerHTML = window.themeVariables.strings.unavailableButton;
      addToCartButton.classList.add("button--subdued");
      if (paymentButton) {
        paymentButton.style.display = "none";
      }
    } else {
      addToCartButton.classList.add(event.detail.variant["available"] ? paymentButton || this.hasAttribute("force-secondary-button") ? "button--secondary" : "button" : "button--subdued");
      addToCartButtonText.innerHTML = event.detail.variant["available"] ? this.getAttribute("template").includes("pre-order") ? window.themeVariables.strings.preOrderButton : window.themeVariables.strings.addToCartButton : window.themeVariables.strings.soldOutButton;
      if (paymentButton) {
        paymentButton.style.display = event.detail.variant["available"] ? "block" : "none";
      }
    }
  }
  _onCartError(event) {
    const errorBanner = document.createElement("div");
    errorBanner.classList.add("banner", "banner--error", "justify-center");
    errorBanner.setAttribute("role", "alert");
    errorBanner.style.gridColumn = "1/-1";
    errorBanner.style.marginBottom = "1rem";
    errorBanner.innerHTML = `
      <svg role="presentation" focusable="false" width="18" height="18" class="offset-icon icon icon-error" style="--icon-height: 18px" viewBox="0 0 18 18">
        <path d="M0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9Z" fill="currentColor"></path>
        <path d="M5.29289 6.70711L11.2929 12.7071L12.7071 11.2929L6.70711 5.29289L5.29289 6.70711ZM6.70711 12.7071L12.7071 6.70711L11.2929 5.2929L5.29289 11.2929L6.70711 12.7071Z" fill="#ffffff"></path>
      </svg>
      
      <p>${event.detail.error}</p>
    `;
    this.before(errorBanner);
    setTimeout(async () => {
      await errorBanner.animate({ opacity: [1, 0] }, { duration: 250, fill: "forwards" }).finished;
      errorBanner.remove();
    }, 5e3);
  }
};
if (!window.customElements.get("buy-buttons")) {
  window.customElements.define("buy-buttons", BuyButtons);
}
var PaymentTerms = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    if (event.detail.variant) {
      const element = this.querySelector('[name="id"]');
      element.value = event.detail.variant["id"];
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
};
if (!window.customElements.get("payment-terms")) {
  window.customElements.define("payment-terms", PaymentTerms);
}
var PickupAvailability = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  async _onVariantChanged(event) {
    if (!event.detail.variant) {
      this.innerHTML = "";
    } else {
      const element = document.createElement("div");
      element.innerHTML = await (await fetch(`${Shopify.routes.root}variants/${event.detail.variant["id"]}?section_id=pickup-availability`)).text();
      this.replaceChildren(...element.querySelector("pickup-availability").childNodes);
    }
  }
};
if (!window.customElements.get("pickup-availability")) {
  window.customElements.define("pickup-availability", PickupAvailability);
}
var currencyFormat = window.themeVariables.settings.currencyCodeEnabled ? window.themeVariables.settings.moneyWithCurrencyFormat : window.themeVariables.settings.moneyFormat;
var SalePrice = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    const variant = event.detail.variant;
    this.lastChild.replaceWith(document.createRange().createContextualFragment(formatMoney(variant["price"], currencyFormat)));
    this.classList.toggle("text-on-sale", variant["compare_at_price"] > variant["price"]);
  }
};
var CompareAtPrice = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    const variant = event.detail.variant;
    this.lastChild.replaceWith(document.createRange().createContextualFragment(formatMoney(variant["compare_at_price"], currencyFormat)));
    this.hidden = !(variant["compare_at_price"] > variant["price"]);
  }
};
var UnitPrice = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    const variant = event.detail.variant;
    if (!variant["unit_price"]) {
      return this.hidden = true;
    }
    const referenceValue = variant["unit_price_measurement"]["reference_value"] !== 1 ? variant["unit_price_measurement"]["reference_value"] : "";
    const node = document.createRange().createContextualFragment(
      `${formatMoney(variant["unit_price"])}/${referenceValue}${variant["unit_price_measurement"]["reference_unit"]}`
    );
    this.lastChild.replaceWith(node);
    this.hidden = false;
  }
};
if (!window.customElements.get("sale-price")) {
  window.customElements.define("sale-price", SalePrice);
}
if (!window.customElements.get("compare-at-price")) {
  window.customElements.define("compare-at-price", CompareAtPrice);
}
if (!window.customElements.get("unit-price")) {
  window.customElements.define("unit-price", UnitPrice);
}
var _onVariantChanged, onVariantChanged_fn;
var SoldOutBadge = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _onVariantChanged);
    __publicField(this, "_onVariantChangedListener", __privateMethod(this, _onVariantChanged, onVariantChanged_fn).bind(this));
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
};
_onVariantChanged = new WeakSet();
onVariantChanged_fn = function(event) {
  this.hidden = event.detail.variant["available"];
};
var _onVariantChanged2, onVariantChanged_fn2;
var OnSaleBadge = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _onVariantChanged2);
    __publicField(this, "_onVariantChangedListener", __privateMethod(this, _onVariantChanged2, onVariantChanged_fn2).bind(this));
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
};
_onVariantChanged2 = new WeakSet();
onVariantChanged_fn2 = function(event) {
  const variant = event.detail.variant;
  if (variant["compare_at_price"] > variant["price"]) {
    this.hidden = false;
    if (this.hasAttribute("discount-mode")) {
      const savings = this.getAttribute("discount-mode") === "percentage" ? `${Math.round((variant["compare_at_price"] - variant["price"]) * 100 / variant["compare_at_price"])}%` : formatMoney(variant["compare_at_price"] - variant["price"]);
      this.innerHTML = `${window.themeVariables.strings.discountBadge.replace("@@", savings)}`;
    }
  } else {
    this.hidden = true;
  }
};
if (!window.customElements.get("sold-out-badge")) {
  window.customElements.define("sold-out-badge", SoldOutBadge);
}
if (!window.customElements.get("on-sale-badge")) {
  window.customElements.define("on-sale-badge", OnSaleBadge);
}
var VariantInventory = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    const variantId = event.detail.variant ? event.detail.variant["id"] : null;
    Array.from(this.children).forEach((item) => item.toggleAttribute("hidden", variantId !== parseInt(item.getAttribute("data-variant-id"))));
  }
};
if (!window.customElements.get("variant-inventory")) {
  window.customElements.define("variant-inventory", VariantInventory);
}
var VariantMedia = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    this.sizesAttribute = this.querySelector("img").sizes;
    this.classAttribute = this.querySelector("img").className;
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  get widths() {
    return this.getAttribute("widths").split(",").map((width) => parseInt(width));
  }
  _onVariantChanged(event) {
    if (!event.detail.variant || !event.detail.variant["featured_media"]) {
      return;
    }
    this.replaceChildren(createMediaImg(event.detail.variant["featured_media"], this.widths, { "class": this.classAttribute, "sizes": this.sizesAttribute }));
  }
};
if (!window.customElements.get("variant-media")) {
  window.customElements.define("variant-media", VariantMedia);
}
var VariantSku = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    if (!event.detail.variant) {
      this.hidden = true;
    } else {
      this.innerText = `${window.themeVariables.strings.sku} ${event.detail.variant["sku"]}`;
      this.hidden = !event.detail.variant["sku"];
    }
  }
};
if (!window.customElements.get("variant-sku")) {
  window.customElements.define("variant-sku", VariantSku);
}

// js/common/product/product-gallery.js
import { PhotoSwipeLightbox } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var ProductGallery = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
    this._carousels = Array.from(this.querySelectorAll("media-carousel"));
    this._pageDots = Array.from(this.querySelectorAll("page-dots"));
    this._viewInSpaceButton = this.querySelector("[data-shopify-xr]");
    this._customCursor = this.querySelector(".product-gallery__cursor");
    this.addEventListener("carousel:change", this._onCarouselChanged);
    if (this._viewInSpaceButton) {
      this.addEventListener("carousel:settle", this._updateViewInSpaceButton);
    }
    if (this.hasAttribute("allow-zoom")) {
      this.addEventListener("lightbox:open", (event) => this.openZoom(event.detail.index));
    }
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  get photoswipe() {
    if (this._photoswipe) {
      return this._photoswipe;
    }
    const photoswipe = new PhotoSwipeLightbox({
      pswpModule: () => import("//www.pedenuvem.com.br/cdn/shop/t/9/assets/photoswipe.min.js?v=96595610301167188461712663639"),
      bgOpacity: 1,
      maxZoomLevel: parseInt(this.getAttribute("allow-zoom")) || 3,
      closeTitle: window.themeVariables.strings.closeGallery,
      zoomTitle: window.themeVariables.strings.zoomGallery,
      errorMsg: window.themeVariables.strings.errorGallery,
      // UX
      arrowPrev: false,
      arrowNext: false,
      counter: false,
      zoom: false,
      closeSVG: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
        <path d="M56 28C56 12.536 43.464 0 28 0S0 12.536 0 28s12.536 28 28 28 28-12.536 28-28Z" fill="#fff"/>
        <path d="M55.5 28C55.5 12.812 43.188.5 28 .5S.5 12.812.5 28 12.812 55.5 28 55.5 55.5 43.188 55.5 28Z" stroke="#252627" stroke-opacity=".12"/>
        <path d="m22.344 22.343 11.313 11.314m-11.313 0 11.313-11.313" stroke="#252627" stroke-width="2"/>
      </svg>`
    });
    photoswipe.addFilter("thumbEl", (thumbEl, data) => data["thumbnailElement"]);
    photoswipe.on("uiRegister", () => {
      photoswipe.pswp.ui.registerElement({
        name: "bottom-bar",
        order: 5,
        appendTo: "wrapper",
        html: `
          <div class="pagination">
            <button class="pagination__item group" rel="prev">
              <span class="animated-arrow animated-arrow--reverse"></span>
            </button>
            
            <span class="pagination__current text-sm">
              <span class="pagination__current-page">1</span> / <span class="pagination__page-count"></span>
            </span>
            
            <button class="pagination__item group" rel="next">
              <span class="animated-arrow"></span>
            </button>
          </div>
        `,
        onInit: (el, pswp) => {
          el.querySelector(".pagination__page-count").innerText = pswp.getNumItems();
          el.querySelector('[rel="prev"]')?.addEventListener("click", () => pswp.prev());
          el.querySelector('[rel="next"]')?.addEventListener("click", () => pswp.next());
          pswp.on("change", () => {
            el.querySelector(".pagination__current-page").innerText = pswp.currIndex + 1;
          });
        }
      });
    });
    photoswipe.init();
    return this._photoswipe = photoswipe;
  }
  /**
   * Open the zoom by dynamically creating a data source based on the filtered items
   */
  openZoom(index = 0) {
    const dataSource = Array.from(this.querySelectorAll('.product-gallery__media[data-media-type="image"]:not([hidden]) > img')).map((image) => {
      return {
        thumbnailElement: image,
        src: image.src,
        srcset: image.srcset,
        msrc: image.currentSrc || image.src,
        width: parseInt(image.getAttribute("width")),
        height: parseInt(image.getAttribute("height")),
        alt: image.alt,
        thumbCropped: true
      };
    });
    this.photoswipe.loadAndOpen(index, dataSource);
  }
  _updateViewInSpaceButton(event) {
    if (event.detail.slide.getAttribute("data-media-type") === "model") {
      this._viewInSpaceButton.setAttribute("data-shopify-model3d-id", event.detail.slide.getAttribute("data-media-id"));
    } else {
      this._viewInSpaceButton.setAttribute("data-shopify-model3d-id", this._viewInSpaceButton.getAttribute("data-shopify-model3d-default-id"));
    }
  }
  _onCarouselChanged(event) {
    if (this._customCursor) {
      this._customCursor.toggleAttribute("hidden", event.detail.slide.getAttribute("data-media-type") !== "image");
    }
  }
  _onVariantChanged(event) {
    const filteredIndexes = this._getFilteredMediaIndexes(event.detail.product, event.detail.variant);
    this._carousels.forEach((carousel) => carousel.dispatchEvent(new CustomEvent("carousel:filter", { detail: { filteredIndexes } })));
    this._pageDots.forEach((pageDots) => pageDots.dispatchEvent(new CustomEvent("control:filter", { detail: { filteredIndexes } })));
    if (event.detail.variant["featured_media"] && event.detail.previousVariant["featured_media"] && event.detail.previousVariant["featured_media"]["id"] !== event.detail.variant["featured_media"]["id"] || !event.detail.previousVariant["featured_media"] && event.detail.variant["featured_media"]) {
      this._carousels.forEach((carousel) => carousel.select(event.detail.variant["featured_media"]["position"] - 1, { animate: false }));
    }
  }
  _getFilteredMediaIndexes(product, variant) {
    const filteredMediaIds = [];
    product["media"].forEach((media) => {
      let matchMedia = variant["featured_media"] && media["position"] === variant["featured_media"]["position"];
      if (media["alt"]?.includes("#") && media["alt"] !== product["title"]) {
        if (!matchMedia) {
          const altParts = media["alt"].split("#"), mediaGroupParts = altParts.pop().split("_");
          product["options"].forEach((option) => {
            if (option["name"].toLowerCase() === mediaGroupParts[0].toLowerCase()) {
              if (variant["options"][option["position"] - 1].toLowerCase() !== mediaGroupParts[1].trim().toLowerCase()) {
                filteredMediaIds.push(media["position"] - 1);
              }
            }
          });
        }
      }
    });
    return filteredMediaIds;
  }
};
var MediaCarousel = class extends ScrollCarousel {
  connectedCallback() {
    super.connectedCallback();
    this._onGestureChangedListener = this._onGestureChanged.bind(this);
    this.addEventListener("gesturestart", this._onGestureStart, { capture: false, signal: this._abortController.signal });
    this.addEventListener("carousel:settle", this._onMediaSettled, { signal: this._abortController.signal });
    this.addEventListener("click", this._onGalleryClick);
  }
  _onMediaSettled(event) {
    const media = event.detail.slide;
    this.items.filter((item) => ["video", "external_video", "model"].includes(item.getAttribute("data-media-type"))).forEach((item) => item.firstElementChild.pause());
    switch (media.getAttribute("data-media-type")) {
      case "external_video":
      case "video":
        if (this.hasAttribute("autoplay")) {
          media.firstElementChild.play();
        }
        break;
      case "model":
        if (window.matchMedia("(min-width: 1000px)").matches) {
          media.firstElementChild.play();
        }
        break;
    }
  }
  _onGalleryClick(event) {
    if (event.target.matches("button, a[href], button :scope, a[href] :scope") || !window.matchMedia("screen and (pointer: fine)").matches) {
      return;
    }
    if (this.selectedSlide.getAttribute("data-media-type") !== "image") {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect(), offsetX = event.clientX - rect.left;
    offsetX > this.clientWidth / 2 ? this.next() : this.previous();
  }
  _onGestureStart(event) {
    event.preventDefault();
    this.addEventListener("gesturechange", this._onGestureChangedListener, { capture: false, signal: this._abortController.signal });
  }
  _onGestureChanged(event) {
    event.preventDefault();
    if (event.scale > 1.5) {
      const visibleImages = this.visibleItems.filter((item) => item.getAttribute("data-media-type") === "image"), openIndex = visibleImages.indexOf(this.selectedSlide);
      this.dispatchEvent(new CustomEvent("lightbox:open", { bubbles: true, detail: { index: openIndex } }));
      this.removeEventListener("gesturechange", this._onGestureChangedListener);
    }
  }
};
var ProductZoomButton = class extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", this._onButtonClicked);
  }
  _onButtonClicked() {
    let media = this.closest(".product-gallery__media"), openIndex;
    if (media) {
      const visibleImages = this.closest("media-carousel").visibleItems.filter((item) => item.getAttribute("data-media-type") === "image");
      openIndex = visibleImages.indexOf(media);
    } else {
      const carousel = this.closest(".product-gallery__media-list-wrapper").querySelector("media-carousel"), visibleImages = carousel.visibleItems.filter((item) => item.getAttribute("data-media-type") === "image");
      openIndex = visibleImages.indexOf(carousel.selectedSlide);
    }
    this.dispatchEvent(new CustomEvent("lightbox:open", {
      bubbles: true,
      detail: {
        index: openIndex
      }
    }));
  }
};
if (!window.customElements.get("product-gallery")) {
  window.customElements.define("product-gallery", ProductGallery);
}
if (!window.customElements.get("product-zoom-button")) {
  window.customElements.define("product-zoom-button", ProductZoomButton, { extends: "button" });
}
if (!window.customElements.get("media-carousel")) {
  window.customElements.define("media-carousel", MediaCarousel);
}

// js/common/product/quick-add.js
var _scopeFromPassed, _scopeToReached, _intersectionObserver;
var ProductQuickAdd = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _scopeFromPassed, false);
    __privateAdd(this, _scopeToReached, false);
    __privateAdd(this, _intersectionObserver, new IntersectionObserver(this._onObserved.bind(this)));
  }
  connectedCallback() {
    this._scopeFrom = document.getElementById(this.getAttribute("form"));
    this._scopeTo = document.querySelector(".footer");
    if (!this._scopeFrom || !this._scopeTo) {
      return;
    }
    __privateGet(this, _intersectionObserver).observe(this._scopeFrom);
    __privateGet(this, _intersectionObserver).observe(this._scopeTo);
  }
  disconnectedCallback() {
    __privateGet(this, _intersectionObserver).disconnect();
  }
  _onObserved(entries) {
    entries.forEach((entry) => {
      if (entry.target === this._scopeFrom) {
        __privateSet(this, _scopeFromPassed, entry.boundingClientRect.bottom < 0);
      }
      if (entry.target === this._scopeTo) {
        __privateSet(this, _scopeToReached, entry.isIntersecting);
      }
    });
    this.classList.toggle("is-visible", __privateGet(this, _scopeFromPassed) && !__privateGet(this, _scopeToReached));
  }
};
_scopeFromPassed = new WeakMap();
_scopeToReached = new WeakMap();
_intersectionObserver = new WeakMap();
if (!window.customElements.get("product-quick-add")) {
  window.customElements.define("product-quick-add", ProductQuickAdd);
}

// js/common/product/quick-buy-drawer.js
import { animate as animate7, timeline as timeline5 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var QuickBuyDrawer = class extends Drawer {
  constructor() {
    super();
    this._hasLoaded = false;
    this.addEventListener("variant:add", this._onVariantAdded.bind(this));
  }
  async show() {
    this.style.display = "block";
    if (!this._hasLoaded) {
      [this, ...this.controls].forEach((control) => control.setAttribute("aria-busy", "true"));
      const responseContent = await (await fetch(`${window.Shopify.routes.root}products/${this.getAttribute("handle")}`)).text();
      [this, ...this.controls].forEach((control) => control.setAttribute("aria-busy", "false"));
      const quickBuyContent = new DOMParser().parseFromString(responseContent, "text/html").getElementById("quick-buy-content").content;
      Array.from(quickBuyContent.querySelectorAll("noscript")).forEach((noScript) => noScript.remove());
      this.replaceChildren(quickBuyContent);
      Shopify.PaymentButton?.init();
      this._hasLoaded = true;
    }
    return super.show();
  }
  async hide() {
    return super.hide()?.then(() => {
      this.style.display = "none";
    });
  }
  _onVariantAdded(event) {
    event.detail.blockCartDrawerOpening = true;
    const contentShadow = this.shadowRoot.querySelector('[part="content"]'), fromHeight = contentShadow.clientHeight;
    animate7(contentShadow.children, { opacity: 0, visibility: "hidden" }, { duration: 0.15 });
    this.replaceChildren(...new DOMParser().parseFromString(event.detail.cart["sections"]["variant-added"], "text/html").querySelector(".shopify-section").children);
    requestAnimationFrame(async () => {
      await timeline5([
        [contentShadow, { height: [`${fromHeight}px`, `${contentShadow.clientHeight}px`] }, { duration: 0.35, easing: [0.86, 0, 0.07, 1] }],
        [contentShadow.children, { opacity: [0, 1], visibility: "visible" }, { duration: 0.15 }]
      ]).finished;
      contentShadow.style.height = null;
    });
    this._hasLoaded = false;
  }
};
if (!window.customElements.get("quick-buy-drawer")) {
  window.customElements.define("quick-buy-drawer", QuickBuyDrawer);
}

// js/common/product/variant-picker.js
var VariantPicker = class extends HTMLElement {
  async connectedCallback() {
    this._abortController = new AbortController();
    this.masterSelector = document.forms[this.getAttribute("form")].id;
    this.optionSelectors = Array.from(this.querySelectorAll("[data-option-selector]"));
    if (!this.masterSelector) {
      console.warn(`The variant selector for product with handle ${this.productHandle} is not linked to any product form.`);
      return;
    }
    this.product = await ProductLoader.load(this.productHandle);
    this.optionSelectors.forEach((optionSelector) => {
      optionSelector.addEventListener("change", this._onOptionChanged.bind(this), { signal: this._abortController.signal });
    });
    this.masterSelector.addEventListener("change", this._onMasterSelectorChanged.bind(this), { signal: this._abortController.signal });
    this._updateDisableSelectors();
    this.selectVariant(this.selectedVariant["id"]);
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
  get selectedVariant() {
    return this._getVariantById(parseInt(this.masterSelector.value));
  }
  get productHandle() {
    return this.getAttribute("handle");
  }
  get hideSoldOutVariants() {
    return this.hasAttribute("hide-sold-out-variants");
  }
  get updateUrl() {
    return this.hasAttribute("update-url");
  }
  /**
   * Select a new variant by its ID
   */
  selectVariant(id) {
    if (!this._isVariantSelectable(this._getVariantById(id))) {
      id = this._getFirstMatchingAvailableOrSelectableVariant()["id"];
    }
    const previousVariant = this.selectedVariant;
    if (previousVariant && previousVariant.id === id) {
      return;
    }
    this.masterSelector.value = id;
    this.masterSelector.dispatchEvent(new Event("change", { bubbles: true }));
    if (this.updateUrl && history.replaceState) {
      const newUrl = new URL(window.location.href);
      if (id) {
        newUrl.searchParams.set("variant", id);
      } else {
        newUrl.searchParams.delete("variant");
      }
      window.history.replaceState({ path: newUrl.toString() }, "", newUrl.toString());
    }
    this._updateDisableSelectors();
    this.masterSelector.form.dispatchEvent(new CustomEvent("variant:change", {
      bubbles: true,
      detail: {
        product: this.product,
        variant: this.selectedVariant,
        previousVariant
      }
    }));
  }
  _onOptionChanged(event) {
    if (!event.target.name.startsWith("option")) {
      return;
    }
    this.selectVariant(this._getVariantFromOptions()?.id);
  }
  _onMasterSelectorChanged() {
    const options = this.selectedVariant?.options || [];
    options.forEach((value, index) => {
      let input = this.optionSelectors[index].querySelector(`input[type="radio"][name="option${index + 1}"][value="${CSS.escape(value)}"], input[type="hidden"][name="option${index + 1}"], select[name="option${index + 1}"]`), triggerChangeEvent = false;
      if (input.tagName === "SELECT" || input.tagName === "INPUT" && input.type === "hidden") {
        triggerChangeEvent = input.value !== value;
        input.value = value;
      } else if (input.tagName === "INPUT" && input.type === "radio") {
        triggerChangeEvent = !input.checked && input.value === value;
        input.checked = input.value === value;
      }
      if (triggerChangeEvent) {
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
  /**
   * Get the product variant by its ID
   */
  _getVariantById(id) {
    return this.product["variants"].find((variant) => variant["id"] === id);
  }
  /**
   * Get the variant based on the options
   */
  _getVariantFromOptions() {
    const options = this._getSelectedOptionValues();
    return this.product["variants"].find((variant) => {
      return variant["options"].every((value, index) => value === options[index]);
    });
  }
  /**
   * Detect if a specific variant is selectable. This is used when the "hide sold out variant" option is enabled, to allow
   * returning true only if the variant is actually available
   */
  _isVariantSelectable(variant) {
    if (!variant) {
      return false;
    } else {
      return variant["available"] || !this.hideSoldOutVariants && !variant["available"];
    }
  }
  /**
   * This method is used internally to select an available or selectable variant, when the current choice does not
   * match the requirements. For instance, if sold out variants are configured to be hidden, but that the choices end
   * up being a non-valid variant, the theme automatically changes the variant to match the requirements. In the case
   * the customer end up on variant combinations that do not exist, it also switches to a valid combination.
   *
   * The algorithm is as follows: if we have for instance three options "Color", "Size" and "Material", we pop the last
   * option (Material) and try to find the first available variant for the given Color and Size. If none is found we
   * remove the second option (Size) and try to find the first available variant for the selected color. Finally, if none
   * is found we return the first available variant independently of any choice.
   */
  _getFirstMatchingAvailableOrSelectableVariant() {
    let options = this._getSelectedOptionValues(), matchedVariant = null, slicedCount = 0;
    do {
      options.pop();
      slicedCount += 1;
      matchedVariant = this.product["variants"].find((variant) => {
        if (this.hideSoldOutVariants) {
          return variant["available"] && variant["options"].slice(0, variant["options"].length - slicedCount).every((value, index) => value === options[index]);
        } else {
          return variant["options"].slice(0, variant["options"].length - slicedCount).every((value, index) => value === options[index]);
        }
      });
    } while (!matchedVariant && options.length > 0);
    return matchedVariant;
  }
  _getSelectedOptionValues() {
    return this.optionSelectors.map((optionSelector) => {
      return optionSelector.querySelector('input[name^="option"][type="hidden"], input[name^="option"]:checked, select[name^="option"]').value;
    });
  }
  /**
   * We add specific class to sold out variants based on the selectors
   */
  _updateDisableSelectors() {
    const selectedVariant = this.selectedVariant;
    if (!selectedVariant) {
      return;
    }
    const applyClassToSelector = (selector, valueIndex, available, hasAtLeastOneCombination) => {
      const optionValue = Array.from(selector.querySelectorAll("[data-option-value]"))[valueIndex];
      optionValue.toggleAttribute("hidden", !hasAtLeastOneCombination);
      if (this.hideSoldOutVariants) {
        optionValue.toggleAttribute("hidden", !available);
      } else {
        optionValue.classList.toggle("is-disabled", !available);
      }
    };
    if (this.optionSelectors && this.optionSelectors[0]) {
      this.product["options"][0]["values"].forEach((value, valueIndex) => {
        const hasAtLeastOneCombination = this.product["variants"].some((variant) => variant["option1"] === value && variant), hasAvailableVariant = this.product["variants"].some((variant) => variant["option1"] === value && variant["available"]);
        applyClassToSelector(this.optionSelectors[0], valueIndex, hasAvailableVariant, hasAtLeastOneCombination);
        if (this.optionSelectors[1]) {
          this.product["options"][1]["values"].forEach((value2, valueIndex2) => {
            const hasAtLeastOneCombination2 = this.product["variants"].some((variant) => variant["option2"] === value2 && variant["option1"] === selectedVariant["option1"] && variant), hasAvailableVariant2 = this.product["variants"].some((variant) => variant["option2"] === value2 && variant["option1"] === selectedVariant["option1"] && variant["available"]);
            applyClassToSelector(this.optionSelectors[1], valueIndex2, hasAvailableVariant2, hasAtLeastOneCombination2);
            if (this.optionSelectors[2]) {
              this.product["options"][2]["values"].forEach((value3, valueIndex3) => {
                const hasAtLeastOneCombination3 = this.product["variants"].some((variant) => variant["option3"] === value3 && variant["option1"] === selectedVariant["option1"] && variant["option2"] === selectedVariant["option2"] && variant), hasAvailableVariant3 = this.product["variants"].some((variant) => variant["option3"] === value3 && variant["option1"] === selectedVariant["option1"] && variant["option2"] === selectedVariant["option2"] && variant["available"]);
                applyClassToSelector(this.optionSelectors[2], valueIndex3, hasAvailableVariant3, hasAtLeastOneCombination3);
              });
            }
          });
        }
      });
    }
  }
};
var VariantOptionValue = class extends HTMLElement {
  constructor() {
    super();
    this._onVariantChangedListener = this._onVariantChanged.bind(this);
  }
  connectedCallback() {
    document.forms[this.getAttribute("form")]?.addEventListener("variant:change", this._onVariantChangedListener);
  }
  disconnectedCallback() {
    document.forms[this.getAttribute("form")]?.removeEventListener("variant:change", this._onVariantChangedListener);
  }
  _onVariantChanged(event) {
    this.innerHTML = event.detail.variant[this.getAttribute("for")];
  }
};
if (!window.customElements.get("variant-picker")) {
  window.customElements.define("variant-picker", VariantPicker);
}
if (!window.customElements.get("variant-option-value")) {
  window.customElements.define("variant-option-value", VariantOptionValue);
}

// js/common/media/base-media.js
import { inView as inView4 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var BaseMedia = class extends HTMLElement {
  static get observedAttributes() {
    return ["playing"];
  }
  connectedCallback() {
    this._abortController = new AbortController();
    if (this.hasAttribute("autoplay")) {
      inView4(this, this.play.bind(this), { margin: "0px 0px 0px 0px" });
    }
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
  get playing() {
    return this.hasAttribute("playing");
  }
  get player() {
    return this._playerProxy = this._playerProxy || new Proxy(this._playerTarget(), {
      get: (target, prop) => {
        return async () => {
          target = await target;
          this._playerHandler(target, prop);
        };
      }
    });
  }
  play() {
    if (!this.playing) {
      this.player.play();
    }
  }
  pause() {
    if (this.playing) {
      this.player.pause();
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "playing") {
      if (oldValue === null && newValue === "") {
        this.dispatchEvent(new CustomEvent("media:play", { bubbles: true }));
        if (this.hasAttribute("group")) {
          Array.from(document.querySelectorAll(`[group="${this.getAttribute("group")}"]`)).filter((item) => item !== this).forEach((itemToPause) => {
            itemToPause.pause();
          });
        }
      } else if (newValue === null) {
        this.dispatchEvent(new CustomEvent("media:pause", { bubbles: true }));
      }
    }
  }
};

// js/common/media/model.js
var ModelMedia = class extends BaseMedia {
  connectedCallback() {
    super.connectedCallback();
    this.player;
  }
  _playerTarget() {
    return new Promise((resolve) => {
      this.setAttribute("loaded", "");
      window.Shopify.loadFeatures([
        {
          name: "shopify-xr",
          version: "1.0",
          onLoad: this._setupShopifyXr.bind(this)
        },
        {
          name: "model-viewer-ui",
          version: "1.0",
          onLoad: () => {
            const modelViewer = this.querySelector("model-viewer");
            modelViewer.addEventListener("shopify_model_viewer_ui_toggle_play", () => this.setAttribute("playing", ""));
            modelViewer.addEventListener("shopify_model_viewer_ui_toggle_pause", () => this.removeAttribute("playing"));
            this.setAttribute("can-play", "");
            resolve(new window.Shopify.ModelViewerUI(modelViewer, { focusOnPlay: true }));
          }
        }
      ]);
    });
  }
  _playerHandler(target, prop) {
    target[prop]();
  }
  async _setupShopifyXr() {
    if (!window.ShopifyXR) {
      document.addEventListener("shopify_xr_initialized", this._setupShopifyXr.bind(this));
    } else {
      const models = (await ProductLoader.load(this.getAttribute("handle")))["media"].filter((media) => media["media_type"] === "model");
      window.ShopifyXR.addModels(models);
      window.ShopifyXR.setupXRElements();
    }
  }
};
if (!window.customElements.get("model-media")) {
  window.customElements.define("model-media", ModelMedia);
}

// js/common/media/video.js
var onYouTubePromise = new Promise((resolve) => {
  window.onYouTubeIframeAPIReady = () => resolve();
});
var VideoMedia = class extends BaseMedia {
  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("autoplay")) {
      this.addEventListener("click", this.play, { once: true, signal: this._abortController.signal });
    }
    if (this.hasAttribute("show-play-button") && !this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(document.createRange().createContextualFragment(`
        <slot></slot>
        
        <svg part="play-button" fill="none" width="48" height="48" viewBox="0 0 48 48">
          <path d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24s10.745 24 24 24 24-10.745 24-24Z" fill="#f0f0f0"/>
          <path d="M18.578 32.629a.375.375 0 0 1-.578-.316V15.687c0-.297.328-.476.578-.316l12.931 8.314c.23.147.23.483 0 .63L18.578 32.63Z" fill="#1a1a1a"/>
          <path d="M24 .5C36.979.5 47.5 11.021 47.5 24S36.979 47.5 24 47.5.5 36.979.5 24 11.021.5 24 .5Z" stroke="#1a1a1a" stroke-opacity=".12"/>
        </svg>
      `));
    }
  }
  _playerTarget() {
    if (this.hasAttribute("host")) {
      this.setAttribute("loaded", "");
      return new Promise(async (resolve) => {
        const templateElement = this.querySelector("template");
        if (templateElement) {
          templateElement.replaceWith(templateElement.content.firstElementChild.cloneNode(true));
        }
        const muteVideo = this.hasAttribute("autoplay") || window.matchMedia("screen and (max-width: 999px)").matches;
        const script = document.createElement("script");
        script.type = "text/javascript";
        if (this.getAttribute("host") === "youtube") {
          if (!window.YT || !window.YT.Player) {
            script.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(script);
            await new Promise((resolve2) => {
              script.onload = resolve2;
            });
          }
          await onYouTubePromise;
          this.setAttribute("can-play", "");
          const player = new YT.Player(this.querySelector("iframe"), {
            events: {
              "onReady": () => {
                if (muteVideo) {
                  player.mute();
                }
                resolve(player);
              },
              "onStateChange": (event) => {
                if (event.data === YT.PlayerState.PLAYING) {
                  this.setAttribute("playing", "");
                } else if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
                  this.removeAttribute("playing");
                }
              }
            }
          });
        }
        if (this.getAttribute("host") === "vimeo") {
          if (!window.Vimeo || !window.Vimeo.Player) {
            script.src = "https://player.vimeo.com/api/player.js";
            document.head.appendChild(script);
            await new Promise((resolve2) => {
              script.onload = resolve2;
            });
          }
          const player = new Vimeo.Player(this.querySelector("iframe"));
          if (muteVideo) {
            player.setMuted(true);
          }
          this.setAttribute("can-play", "");
          player.on("play", () => {
            this.setAttribute("playing", "");
          });
          player.on("pause", () => this.removeAttribute("playing"));
          player.on("ended", () => this.removeAttribute("playing"));
          resolve(player);
        }
      });
    } else {
      const videoElement = this.querySelector("video");
      this.setAttribute("loaded", "");
      this.setAttribute("can-play", "");
      videoElement.addEventListener("play", () => {
        this.setAttribute("playing", "");
        this.removeAttribute("suspended");
      });
      videoElement.addEventListener("pause", () => {
        if (!videoElement.seeking && videoElement.paused) {
          this.removeAttribute("playing");
        }
      });
      return videoElement;
    }
  }
  _playerHandler(target, prop) {
    if (this.getAttribute("host") === "youtube") {
      prop === "play" ? target.playVideo() : target.pauseVideo();
    } else {
      if (prop === "play" && !this.hasAttribute("host")) {
        target.play().catch((error) => {
          if (error.name === "NotAllowedError") {
            this.setAttribute("suspended", "");
            target.controls = true;
            const replacementImageSrc = target.previousElementSibling?.currentSrc;
            if (replacementImageSrc) {
              target.poster = replacementImageSrc;
            }
          }
        });
      } else {
        target[prop]();
      }
    }
  }
};
if (!window.customElements.get("video-media")) {
  window.customElements.define("video-media", VideoMedia);
}

// js/common/navigation/accordion-disclosure.js
import { timeline as timeline6 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";

// js/common/navigation/animated-details.js
var AnimatedDetails = class extends HTMLDetailsElement {
  constructor() {
    super();
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this.summaryElement.addEventListener("click", this._onSummaryClicked.bind(this));
    if (Shopify.designMode) {
      this.addEventListener("shopify:block:select", () => this.open = true);
      this.addEventListener("shopify:block:deselect", () => this.open = false);
    }
  }
  set open(value) {
    if (value !== this._open) {
      this._open = value;
      if (this.isConnected) {
        this._transition(value);
      } else {
        value ? this.setAttribute("open", "") : this.removeAttribute("open");
      }
    }
  }
  get open() {
    return this._open;
  }
  _onSummaryClicked(event) {
    event.preventDefault();
    this.open = !this.open;
  }
  _transition(value) {
  }
};

// js/common/navigation/accordion-disclosure.js
var AccordionDisclosure = class extends AnimatedDetails {
  static get observedAttributes() {
    return ["open"];
  }
  constructor() {
    super();
    this.setAttribute("aria-expanded", this._open ? "true" : "false");
  }
  set open(value) {
    super.open = value;
    this.setAttribute("aria-expanded", value ? "true" : "false");
  }
  get open() {
    return super.open;
  }
  async _transition(value) {
    this.style.overflow = "hidden";
    if (value) {
      this.setAttribute("open", "");
      await timeline6([
        [this, { height: [`${this.summaryElement.clientHeight}px`, `${this.scrollHeight}px`] }, { duration: 0.25, easing: "ease" }],
        [this.contentElement, { opacity: [0, 1], transform: ["translateY(0)", "translateY(-4px)"] }, { duration: 0.15, at: "-0.1" }]
      ]).finished;
    } else {
      await timeline6([
        [this.contentElement, { opacity: 0 }, { duration: 0.15 }],
        [this, { height: [`${this.clientHeight}px`, `${this.summaryElement.clientHeight}px`] }, { duration: 0.25, at: "<", easing: "ease" }]
      ]).finished;
      this.removeAttribute("open");
    }
    this.style.height = "auto";
    this.style.overflow = "visible";
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      this.setAttribute("aria-expanded", newValue === "" ? "true" : "false");
    }
  }
};
if (!window.customElements.get("accordion-disclosure")) {
  window.customElements.define("accordion-disclosure", AccordionDisclosure, { extends: "details" });
}

// js/common/navigation/tabs.js
import { animate as animate8 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var Tabs = class extends HTMLElement {
  static get observedAttributes() {
    return ["selected-index"];
  }
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild(this.querySelector("template").content.cloneNode(true));
    }
    if (Shopify.designMode) {
      this.addEventListener("shopify:block:select", (event) => this.selectedIndex = this.buttons.indexOf(event.target));
    }
    this.addEventListener("keydown", this._handleKeyboard);
  }
  connectedCallback() {
    this._abortController = new AbortController();
    this.buttons = Array.from(this.shadowRoot.querySelector('slot[name="title"]').assignedNodes(), (item) => item.matches("button") && item || item.querySelector("button"));
    this.panels = Array.from(this.shadowRoot.querySelector('slot[name="content"]').assignedNodes());
    this.buttons.forEach((button, index) => button.addEventListener("click", () => this.selectedIndex = index, { signal: this._abortController.signal }));
    this.selectedIndex = this.selectedIndex;
    this._setupAccessibility();
  }
  disconnectedCallback() {
    this._abortController.abort();
  }
  get animationDuration() {
    return this.hasAttribute("animation-duration") ? parseFloat(this.getAttribute("animation-duration")) : 0.15;
  }
  get selectedIndex() {
    return parseInt(this.getAttribute("selected-index")) || 0;
  }
  set selectedIndex(index) {
    this.setAttribute("selected-index", Math.min(Math.max(index, 0), this.buttons.length - 1).toString());
    this.style.setProperty("--selected-index", this.selectedIndex.toString());
    this.style.setProperty("--item-count", this.buttons.length.toString());
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.buttons.forEach((button, index) => button.setAttribute("aria-selected", index === parseInt(newValue) ? "true" : "false"));
    if (name === "selected-index" && oldValue !== null && oldValue !== newValue) {
      this._transition(this.panels[parseInt(oldValue)], this.panels[parseInt(newValue)]);
    }
  }
  _setupAccessibility() {
    const componentID = crypto.randomUUID ? crypto.randomUUID() : Math.floor(Math.random() * 1e4);
    this.buttons.forEach((button, index) => {
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `tab-panel-${componentID}-${index}`);
      button.id = `tab-${componentID}-${index}`;
    });
    this.panels.forEach((panel, index) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `tab-${componentID}-${index}`);
      panel.id = `tab-panel-${componentID}-${index}`;
      panel.hidden = index !== this.selectedIndex;
    });
  }
  /**
   * As per https://www.w3.org/WAI/ARIA/apg/example-index/tabs/tabs-automatic.html, when a tab is currently focused,
   * left and right arrow should switch the tab
   */
  _handleKeyboard(event) {
    const index = this.buttons.indexOf(document.activeElement);
    if (index === -1 || !["ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }
    if (event.key === "ArrowLeft") {
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
    } else {
      this.selectedIndex = (this.selectedIndex + 1 + this.buttons.length) % this.buttons.length;
    }
    this.buttons[this.selectedIndex].focus();
  }
  /**
   * Perform a custom transition (can be overridden in subclasses). To "from" and "to" are hash representing the panel
   */
  async _transition(fromPanel, toPanel) {
    await animate8(fromPanel, { opacity: [1, 0] }, { duration: this.animationDuration }).finished;
    fromPanel.hidden = true;
    toPanel.hidden = false;
    await animate8(toPanel, { opacity: [0, 1] }, { duration: this.animationDuration }).finished;
  }
};
if (!window.customElements.get("x-tabs")) {
  window.customElements.define("x-tabs", Tabs);
}

// js/common/search/predictive-search.js
import { animate as animate9 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var PredictiveSearch = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(document.createRange().createContextualFragment(`<slot name="idle"></slot>`));
  }
  connectedCallback() {
    this._searchForm = this.closest("form");
    this._queryInput = this._searchForm.elements["q"];
    this._searchForm.addEventListener("submit", this._onFormSubmitted.bind(this));
    this._searchForm.addEventListener("reset", this._onSearchCleared.bind(this));
    this._queryInput.addEventListener("input", debounce(this._onInputChanged.bind(this), this.autoCompleteDelay));
  }
  /**
   * Return the delay in ms before we send the autocomplete request. Using a value too low can cause the results to
   * refresh too often, so we recommend to keep the default one
   */
  get autoCompleteDelay() {
    return 280;
  }
  /**
   * Check if the store supports the predictive API (some languages do not). When not supported, the predictive
   * search is simply disabled and only the standard search is used
   */
  supportsPredictiveApi() {
    return JSON.parse(document.getElementById("shopify-features").innerHTML)["predictiveSearch"];
  }
  /**
   * Check if the input is not empty, and if so, trigger the predictive search
   */
  _onInputChanged() {
    if (this._queryInput.value === "") {
      return this._onSearchCleared();
    }
    this._abortController?.abort();
    this._abortController = new AbortController();
    try {
      return this.supportsPredictiveApi() ? this._doPredictiveSearch() : this._doFallbackSearch();
    } catch (e) {
      if (e.name !== "AbortError") {
        throw e;
      }
    }
  }
  /**
   * Prevent the form submission if the query is empty
   */
  _onFormSubmitted(event) {
    if (this._queryInput.value === "") {
      return event.preventDefault();
    }
  }
  /**
   * Do the actual predictive search
   */
  async _doPredictiveSearch() {
    await this._transitionToSlot("loading");
    const queryParams = `q=${this._queryInput.value}&section_id=${this.getAttribute("section-id")}&resources[limit]=10&resources[limit_scope]=each`;
    const nodeElement = new DOMParser().parseFromString(await (await cachedFetch(`${window.Shopify.routes.root}search/suggest?${queryParams}`, { signal: this._abortController.signal })).text(), "text/html");
    this.querySelector('[slot="results"]').replaceWith(document.importNode(nodeElement.querySelector('[slot="results"]'), true));
    return this._transitionToSlot("results");
  }
  /**
   * For merchants using store that do not support the predictive search, we have to fallback to standard search. Unfortunately,
   * the standard search is less convenient, and we have to simulate one request for each desired resource type
   */
  async _doFallbackSearch() {
    await this._transitionToSlot("loading");
    const queryParams = `q=${this._queryInput.value}&section_id=${this.getAttribute("section-id")}&resources[limit]=10&resources[limit_scope]=each`;
    const nodeElement = new DOMParser().parseFromString(await (await cachedFetch(`${window.Shopify.routes.root}search?${queryParams}`, { signal: this._abortController.signal })).text(), "text/html");
    this.querySelector('[slot="results"]').replaceWith(document.importNode(nodeElement.querySelector('[slot="results"]'), true));
    return this._transitionToSlot("results");
  }
  /**
   * If any search is pending, we abort them, and transition to the idle slot
   */
  _onSearchCleared() {
    this._abortController?.abort();
    this._queryInput.focus();
    return this._transitionToSlot("idle");
  }
  /**
   * Transition between different slot. To prevent useless animation, the slot does not transition if we go to the same slot
   */
  async _transitionToSlot(toSlotName) {
    if (this.shadowRoot.firstElementChild.name === toSlotName) {
      return;
    }
    await animate9(this.shadowRoot.firstElementChild.assignedNodes(), { opacity: [1, 0] }, { duration: 0.1 }).finished;
    this.shadowRoot.firstElementChild.setAttribute("name", toSlotName);
    return animate9(this.shadowRoot.firstElementChild.assignedNodes(), { opacity: [0, 1], transform: ["translateY(5px)", "translateY(0)"] }, { duration: 0.1 }).finished;
  }
};
if (!window.customElements.get("predictive-search")) {
  window.customElements.define("predictive-search", PredictiveSearch);
}

// js/common/search/search-drawer.js
var SearchDrawer = class extends Drawer {
  get shouldAppendToBody() {
    return false;
  }
  get openFrom() {
    return window.matchMedia(`${window.themeVariables.breakpoints["sm-max"]}`).matches ? "top" : this.getAttribute("open-from") || "right";
  }
};
if (!window.customElements.get("search-drawer")) {
  window.customElements.define("search-drawer", SearchDrawer);
}

// js/common/text/section-header.js
import { animate as animate10, inView as inView5 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
var _reveal2, reveal_fn2;
var SectionHeader = class extends HTMLElement {
  constructor() {
    super(...arguments);
    __privateAdd(this, _reveal2);
  }
  connectedCallback() {
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      inView5(this, __privateMethod(this, _reveal2, reveal_fn2).bind(this), { margin: "0px 0px -100px 0px" });
    }
  }
};
_reveal2 = new WeakSet();
reveal_fn2 = function() {
  const heading = this.querySelector('h2[reveal-on-scroll="true"]'), headingKeyframe = getHeadingKeyframe(heading);
  animate10(...headingKeyframe);
};
if (!window.customElements.get("section-header")) {
  window.customElements.define("section-header", SectionHeader);
}

// js/common/ui/marquee-text.js
var MarqueeText = class extends HTMLElement {
  constructor() {
    super();
    if (window.ResizeObserver) {
      new ResizeObserver(this._calculateDuration.bind(this)).observe(this);
    }
  }
  _calculateDuration(entries) {
    const scrollingSpeed = parseInt(this.getAttribute("scrolling-speed") || 5), contentWidth = entries[0].contentRect.width, slowFactor = 1 + (Math.min(1600, contentWidth) - 375) / (1600 - 375);
    this.style.setProperty("--marquee-animation-duration", `${(scrollingSpeed * slowFactor * entries[0].target.querySelector("span").clientWidth / contentWidth).toFixed(3)}s`);
  }
};
if (!window.customElements.get("marquee-text")) {
  window.customElements.define("marquee-text", MarqueeText);
}

// js/theme.js
import { Delegate as Delegate4 } from "//www.pedenuvem.com.br/cdn/shop/t/9/assets/vendor.min.js?v=79990547323687692901712663639";
(() => {
  const delegateDocument = new Delegate4(document.documentElement);
  if (window.themeVariables.settings.showPageTransition && "animate" in document.documentElement && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    delegateDocument.on("click", "a", async (event, target) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) {
        return;
      }
      if (target.hostname !== window.location.hostname || target.pathname === window.location.pathname) {
        return;
      }
      event.preventDefault();
      await document.body.animate({ opacity: [1, 0] }, { duration: 75, fill: "forwards" }).finished;
      window.location = target.href;
    });
  }
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    delegateDocument.on("click", 'a[href*="#"]', (event, target) => {
      if (event.defaultPrevented || target.pathname !== window.location.pathname || target.search !== window.location.search) {
        return;
      }
      const url = new URL(target.href);
      if (url.hash === "") {
        return;
      }
      const anchorElement = document.querySelector(url.hash);
      if (anchorElement) {
        event.preventDefault();
        anchorElement.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  }
  const setScrollbarWidth = () => {
    const scrollbarWidth = window.innerWidth - document.body.clientWidth;
    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    }
  };
  setScrollbarWidth();
  window.addEventListener("resize", throttle(setScrollbarWidth));
})();
export {
  AccordionDisclosure,
  AnimatedDetails,
  BuyButtons,
  CartCount,
  CartDrawer,
  CartNote,
  CartNotificationDrawer,
  CompareAtPrice,
  ConfirmButton,
  CopyButton,
  CountrySelector,
  CustomButton,
  CustomCursor,
  DialogElement,
  Drawer,
  EffectCarousel,
  FacetApplyButton,
  FacetDialog,
  FacetDrawer,
  FacetFloatingFilter,
  FacetForm,
  FacetLink,
  FacetSortBy,
  FreeShippingBar,
  GestureArea,
  GiftCardRecipient,
  HeightObserver,
  LineItem,
  LineItemQuantity,
  Listbox,
  MarqueeText,
  MediaCarousel,
  ModelMedia,
  NextButton,
  OnSaleBadge,
  PageDots,
  PaymentTerms,
  PickupAvailability,
  PillLoader,
  Player,
  Popover,
  PredictiveSearch,
  PrevButton,
  PriceRange,
  PrivacyBar,
  ProductCard,
  ProductForm,
  ProductGallery,
  ProductLoader,
  ProductQuickAdd,
  ProductZoomButton,
  ProgressBar,
  QuantitySelector,
  QuickBuyDrawer,
  ResizableTextarea,
  RevealItems,
  SafeSticky,
  SalePrice,
  ScrollArea,
  ScrollCarousel,
  ScrollProgress,
  ScrollShadow,
  SearchDrawer,
  SectionHeader,
  ShareButton,
  ShippingEstimator,
  SoldOutBadge,
  SplitLines,
  Tabs,
  UnitPrice,
  VariantInventory,
  VariantMedia,
  VariantPicker,
  VariantSku,
  VideoMedia,
  VisibilityProgress,
  cachedFetch,
  createMediaImg,
  debounce,
  extractSectionId,
  fetchCart,
  formatMoney,
  generateSrcset,
  getHeadingKeyframe,
  imageLoaded,
  throttle,
  waitForEvent
};


  let lastTotalPrice = 0; // Inicializa com o valor atual do carrinho via Liquid

  function updateTruckPosition() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const totalPrice = cart.total_price;

        if (totalPrice !== lastTotalPrice) {
          lastTotalPrice = totalPrice; // Atualiza o último preço conhecido

          const threshold = 0.0;
          let progressWidth, truckPosition;

          if (totalPrice >= threshold) {
            progressWidth = 100; // O caminhão e a barra de progresso alinham com o final quando o frete grátis é alcançado
            truckPosition = 100;
          } else {
            progressWidth = 80; // A barra mostra 80% de progresso quando o frete grátis não é alcançado
            truckPosition = 82; // Ajuste aqui para 82%, se desejar que o caminhão fique um pouco à frente da barra
          }

          const progressBarFill = document.getElementById('progress-fill');
          if (progressBarFill) {
            progressBarFill.style.width = `${progressWidth}%`;
          const truckContainer = document.querySelector('.container-truck');

                        truckContainer.style.width = `${truckPosition}%`; // Usa a porcentagem para posicionar o caminhão

          }
        }
      })
      .catch(error => console.error('Error fetching cart:', error));
  }

  document.addEventListener('DOMContentLoaded', updateTruckPosition); // Atualiza na carga da página
  setInterval(updateTruckPosition, 1000); // Verifica mudanças a cada 1 segundo