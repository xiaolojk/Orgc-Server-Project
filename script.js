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

// 申请表单（演示：仅校验与反馈）
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
  msg.textContent = "提交成功！这是演示版本，我们会尽快接入正式申请入口。";
  form.reset();
});