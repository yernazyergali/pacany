// Ник в Telegram и текст ответа для кнопки «Да, а чё делать-то».
var TELEGRAM_USERNAME = "kopkutyrma";
var REPLY_TEXT = "Ну что, пойдём в баньку? Да, а чё делать-то!";

var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function (id) { return document.getElementById(id); };
var bgm = $("bgm");

/* ---------- старт: музыка с начала, плавное нарастание ---------- */
var fadeTimer = null;
function fadeTo(v) {
  clearInterval(fadeTimer);
  fadeTimer = setInterval(function () {
    var d = v - bgm.volume;
    if (Math.abs(d) < 0.03) { bgm.volume = v; clearInterval(fadeTimer); return; }
    bgm.volume = Math.max(0, Math.min(1, bgm.volume + (d > 0 ? 0.03 : -0.03)));
  }, 60);
}
var soundBtn = $("sound");
$("ready").addEventListener("click", function () {
  bgm.currentTime = 0; bgm.muted = false; bgm.volume = 0;
  var p = bgm.play();
  if (p && p.then) p.then(function () { fadeTo(0.85); }, function () { soundBtn.textContent = "Звук: выкл"; soundBtn.setAttribute("aria-pressed", "false"); });
  $("s1").classList.remove("on"); $("stage").classList.add("on");
  $("eq").classList.add("live");
  soundBtn.hidden = false;
  var r = $("ready").getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 30);
});

/* ---------- конверт ---------- */
var opened = false;
$("env").addEventListener("click", function () {
  if (opened) return; opened = true;
  $("env").classList.add("open"); $("tap").style.visibility = "hidden";
  var r = $("env").getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40);
  setTimeout(function () {
    $("stage").classList.add("gone");
    document.body.classList.remove("locked"); document.body.classList.add("read");
    window.scrollTo(0, 0); observe();
  }, REDUCED ? 100 : 2300);
});

/* ---------- звук вкл/выкл ---------- */
soundBtn.addEventListener("click", function () {
  var on = bgm.paused || bgm.muted;
  if (on) { bgm.muted = false; bgm.play().then(function () { fadeTo(0.85); }, function () {}); } else { bgm.pause(); }
  soundBtn.textContent = on ? "Звук: вкл" : "Звук: выкл";
  soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
});

/* ---------- появление при скролле ---------- */
function observe() {
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.15 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }
}

/* ---------- кнопка «Да» -> личка в Telegram ---------- */
var yes = $("yes");
yes.href = "https://t.me/" + encodeURIComponent(TELEGRAM_USERNAME) + "?text=" + encodeURIComponent(REPLY_TEXT);
yes.addEventListener("click", function () {
  var r = yes.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40);
});

/* ---------- пар и берёзовые листья ---------- */
var cv = $("fx"), cx = cv.getContext("2d"), W = 0, H = 0, P = [], BU = [], running = false;
function size() {
  var d = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
  var n = Math.min(28, Math.round(W / 34)); P = [];
  for (var i = 0; i < n; i++) P.push(spawn(true));
}
function spawn(anywhere) {
  return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + 30, s: 6 + Math.random() * 10, v: 0.25 + Math.random() * 0.5,
    ph: Math.random() * 6.28, rot: (Math.random() - 0.5) * 1.2, a: 0.08 + Math.random() * 0.18, leaf: Math.random() < 0.45 };
}
function drawLeaf(x, y, s, rot) {
  cx.save(); cx.translate(x, y); cx.rotate(rot); cx.scale(s, s); cx.beginPath();
  cx.moveTo(0, -1); cx.bezierCurveTo(0.7, -0.5, 0.6, 0.6, 0, 1); cx.bezierCurveTo(-0.6, 0.6, -0.7, -0.5, 0, -1); cx.closePath(); cx.fill(); cx.restore();
}
function drawSteam(x, y, s, a) {
  var g = cx.createRadialGradient(x, y, 0, x, y, s * 2.2);
  g.addColorStop(0, "rgba(243,231,216," + a + ")"); g.addColorStop(1, "rgba(243,231,216,0)");
  cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, s * 2.2, 0, 6.28); cx.fill();
}
function burst(x, y, n) {
  if (REDUCED) return;
  for (var i = 0; i < n; i++) {
    var a = Math.random() * 6.28, sp = 2 + Math.random() * 5;
    BU.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 1, s: 5 + Math.random() * 8, leaf: Math.random() < 0.7 });
  }
  if (!running) loop();
}
function frame() {
  cx.clearRect(0, 0, W, H);
  P.forEach(function (p, i) {
    p.y -= p.v; p.ph += 0.012; p.x += Math.sin(p.ph) * 0.35;
    if (p.y < -30) P[i] = spawn(false);
    if (p.leaf) { cx.fillStyle = "rgba(120,160,80," + p.a * 1.4 + ")"; drawLeaf(p.x, p.y, p.s * 0.7, Math.sin(p.ph) * p.rot); }
    else drawSteam(p.x, p.y, p.s, p.a);
  });
  BU = BU.filter(function (b) { return b.life > 0; });
  BU.forEach(function (b) {
    b.x += b.vx; b.y += b.vy; b.vy += 0.16; b.vx *= 0.99; b.life -= 0.016;
    var a = Math.max(b.life, 0);
    if (b.leaf) { cx.fillStyle = "rgba(110,160,70," + a + ")"; drawLeaf(b.x, b.y, b.s * 0.8, b.vx * 0.2 + b.life * 3); }
    else { cx.fillStyle = "rgba(232,184,111," + a + ")"; cx.beginPath(); cx.arc(b.x, b.y, b.s * 0.3, 0, 6.28); cx.fill(); }
  });
}
function loop() {
  running = true;
  (function go() {
    if (document.hidden) { requestAnimationFrame(go); return; }
    frame();
    if (REDUCED && !BU.length) { running = false; return; }
    requestAnimationFrame(go);
  })();
}
size(); window.addEventListener("resize", size);
if (REDUCED) frame(); else loop();
