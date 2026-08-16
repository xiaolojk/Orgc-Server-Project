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
// TODO：把这里改成你自己的邮箱，用于接收申请 / 开通消息
const SHOP = {
  email: "这里填写你的邮箱@example.com", // 接收申请信息的邮箱
  qr: "assets/pay-wechat.png",
};

// ---------- 付款弹窗 ----------
const payModal = document.getElementById("pay-modal");
const payPlan = document.getElementById("pay-plan");
const payPrice = document.getElementById("pay-price");
const payContact = document.getElementById("pay-contact");
const payWei = document.getElementById("pay-wei");
const qrPlaceholder = document.getElementById("qr-placeholder");

payContact.textContent = SHOP.email;

// 收款码图片加载失败时，显示占位提示
payWei.addEventListener("error", () => {
  qrPlaceholder.hidden = false;
});
payWei.addEventListener("load", () => {
  qrPlaceholder.hidden = true;
});

const openPayModal = (plan, price) => {
  payPlan.textContent = plan;
  payPrice.innerHTML = `<b>${price}</b>`;
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

// ---------- 表单中转（FormSubmit → 发到你邮箱） ----------
const form = document.getElementById("apply-form");
const msg = document.getElementById("form-msg");

function setMsg(ok, text) {
  msg.className = ok ? "form-msg ok" : "form-msg err";
  msg.textContent = text;
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const nick = form.nick.value.trim();
  const email = form.email.value.trim();
  const game = form.game.value;
  const desc = form.desc.value.trim();

  if (!nick || !email || !game) {
    setMsg(false, "请填写你的称呼、常用邮箱，并选择服务器类型。");
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    setMsg(false, "请填写有效的邮箱地址。");
    return;
  }

  const btn = form.querySelector("[type=submit]");
  btn.disabled = true;
  setMsg(true, "正在提交…");

  try {
    // 通过 FormSubmit 中转，把申请发到 SHOP.email 对应的邮箱
    const res = await fetch(`https://formsubmit.co/ajax/${SHOP.email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _captcha: "false",
        _subject: `[Orgc 开通申请] ${nick} · ${game}`,
        称呼昵称: nick,
        邮箱: email,
        服务器类型: game,
        详细介绍: desc || "（未填写）",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success === "false") throw new Error(data.message || "发送失败");
    setMsg(true, "申请已提交！我们会在 24 小时内通过邮件为你开通。");
    form.reset();
  } catch (err) {
    setMsg(false, "提交失败，请重试，或直接邮件联系 " + SHOP.email);
  } finally {
    btn.disabled = false;
  }
});