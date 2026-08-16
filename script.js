// 导航栏滚动状态
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 滚动进场动画
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// 数字滚动计数
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      countObserver.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * ease(p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// ---------- 收款与客服配置 ----------
// TODO：把这里改成你自己的客服联系方式
const SHOP = {
  contact: "Orgc 服务中心", // 客服微信号 / 客服称呼
  images: {
    wechat: "assets/pay-wechat.png",
    alipay: "assets/pay-alipay.png",
  },
};

// ---------- 付款弹窗 ----------
const payModal = document.getElementById("pay-modal");
const payPlan = document.getElementById("pay-plan");
const payPrice = document.getElementById("pay-price");
const payContact = document.getElementById("pay-contact");
const payWei = document.getElementById("pay-wei");
const payAli = document.getElementById("pay-ali");
const qrPlaceholder = document.getElementById("qr-placeholder");
const payTabs = document.getElementById("pay-tabs");

payContact.textContent = SHOP.contact;

// 收款码图片加载失败时，记录缺失渠道并显示占位提示
const missingQr = new Set();
let currentChannel = "wechat";
[["wechat", payWei], ["alipay", payAli]].forEach(([ch, img]) => {
  img.addEventListener("error", () => {
    missingQr.add(ch);
    refreshQr();
  });
});

const refreshQr = () => {
  payWei.hidden = currentChannel !== "wechat" || missingQr.has("wechat");
  payAli.hidden = currentChannel !== "alipay" || missingQr.has("alipay");
  qrPlaceholder.hidden = !missingQr.has(currentChannel);
};

const switchChannel = (channel) => {
  currentChannel = channel;
  payTabs.querySelectorAll(".ptab").forEach((t) => {
    const on = t.dataset.ch === channel;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on);
  });
  refreshQr();
};

payTabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".ptab");
  if (tab) switchChannel(tab.dataset.ch);
});

const openPayModal = (plan, price) => {
  payPlan.textContent = plan;
  payPrice.innerHTML = `<b>${price}</b>`;
  switchChannel("wechat");
  payModal.classList.add("open");
  payModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-lock");
};
const closePayModal = () => {
  payModal.classList.remove("open");
  payModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-lock");
};

document.querySelectorAll(".pay-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openPayModal(btn.dataset.plan, btn.dataset.price);
  });
});

payModal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closePayModal)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePayModal();
});

// ---------- 申请表单 ----------
const form = document.getElementById("apply-form");
const msg = document.getElementById("form-msg");

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const nick = form.nick.value.trim();
  const contact = form.contact.value.trim();
  const game = form.game.value;

  if (!nick || !contact || !game) {
    msg.className = "form-msg err";
    msg.textContent = "请填写你的称呼、联系方式，并选择服务器类型。";
    return;
  }
  msg.className = "form-msg ok";
  msg.textContent = `已收悉！请在下单免费版后，添加客服「${SHOP.contact}」发送你的申请信息，我们将在 24 小时内为你开通。`;
  form.reset();
});