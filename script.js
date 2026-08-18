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
  email: "3980970310@qq.com", // 接收申请信息的邮箱
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

// ---------- 申请表单（直接把信息发到 QQ 邮箱） ----------
const form = document.getElementById("apply-form");
const msg = document.getElementById("form-msg");

function setMsg(ok, text) {
  msg.className = ok ? "form-msg ok" : "form-msg err";
  msg.textContent = text;
}

function openMail(subject, body) {
  window.location.href =
    `mailto:${SHOP.email}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
}

form.addEventListener("submit", (ev) => {
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

  openMail(
    `[Orgc 开通申请] ${nick} · ${game}`,
    "这是一封来自 Orgc 云网站的申请信息：\n\n" +
      `称呼 / 昵称：${nick}\n` +
      `常用邮箱：${email}\n` +
      `服务器类型：${game}\n` +
      `详细介绍：${desc ? desc : "（未填写）"}\n\n` +
      "请在 24 小时内处理该开通申请，谢谢！"
  );
  setMsg(true, "已为你打开邮件客户端，请点击「发送」，我们会在 24 小时内通过邮件为你开通。");
});

// ---------- 聊天小框 ----------
const fab = document.getElementById("chatFab");
const chatPanel = document.getElementById("chatPanel");
const chatBody = document.getElementById("chatBody");
const chatActions = document.getElementById("chatActions");
const chatText = document.getElementById("chatText");
const chatSend = document.getElementById("chatSend");
const chatMail = document.getElementById("chat-mail");
const footerQq = document.getElementById("footer-qq");

chatMail.textContent = SHOP.email;
footerQq.textContent = SHOP.email;

const KEY = "orgc_chat_v1";
let chats = [];
try { chats = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { chats = []; }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const renderChat = () => {
  if (!chats.length) {
    chatBody.innerHTML =
      `<div class="chat-msg sys">你好，我是 Orgc 客服。想开通服务器或咨询都可以在这里告诉我，消息会直接发到我们的邮箱 ${esc(SHOP.email)}，我们会尽快回复到你邮箱。</div>`;
    chatActions.style.display = "";
    return;
  }
  chatBody.innerHTML = chats
    .map((c) =>
      c.mine
        ? `<div class="chat-msg me">${esc(c.text)}</div>`
        : `<div class="chat-msg them"><span class="who">客服</span>${esc(c.text)}</div>`
    )
    .join("");
  chatBody.scrollTop = chatBody.scrollHeight;
};
const push = (text, mine) => {
  chats.push({ text, mine, t: Date.now() });
  if (chats.length > 50) chats.shift();
  localStorage.setItem(KEY, JSON.stringify(chats));
  renderChat();
};

const openPanel = () => {
  chatPanel.classList.add("open");
  chatPanel.setAttribute("aria-hidden", "false");
  fab.setAttribute("aria-expanded", "true");
  chatText.focus();
};
const closePanel = () => {
  chatPanel.classList.remove("open");
  chatPanel.setAttribute("aria-hidden", "true");
  fab.setAttribute("aria-expanded", "false");
};

fab.addEventListener("click", () =>
  chatPanel.classList.contains("open") ? closePanel() : openPanel()
);
chatPanel.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closePanel)
);

chatActions.addEventListener("click", (e) => {
  const btn = e.target.closest(".chat-act");
  if (!btn) return;
  chatActions.style.display = "none";
  if (btn.dataset.boot === "open") {
    push("你好，我想开通服务器，请问需要提交哪些信息？", true);
    openMail(
      "[Orgc 开通申请] 我要开通服务器",
      "你好，我想开通服务器。\n\n称呼 / 昵称：\n我的邮箱：\n需要的机型：基础款 / 进阶款 / 免费版\n用途：\n\n（请填好上面信息后直接发送）"
    );
  } else {
    chatText.focus();
  }
});

const sendMsg = () => {
  const t = chatText.value.trim();
  if (!t) return;
  push(t, true);
  chatText.value = "";
  openMail(
    "Orgc 在线咨询 - 期待你的回复",
    t + "\n\n—— 来自 Orgc 云网站的咨询，请回复到我的邮箱。"
  );
};
chatSend.addEventListener("click", sendMsg);
chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
});

renderChat();