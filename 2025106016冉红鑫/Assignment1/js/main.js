/* 月亮与六便士 · 作品集 — 交互 */
(function () {
  "use strict";

  /* -------- 顶部滚动进度条 -------- */
  var prog = document.getElementById("prog");
  function setProg() {
    if (!prog) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    prog.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
  }

  /* -------- 入场序列：黑屏 + 月亮绽放 -------- */
  function playIntro() {
    var ov = document.getElementById("intro");
    if (!ov) return;
    requestAnimationFrame(function () { ov.classList.add("play"); });
    setTimeout(function () { ov.classList.add("out"); }, 1100);
    setTimeout(function () { ov.remove(); }, 1900);
  }

  /* -------- IO Reveal -------- */
  var rvEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && rvEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* -------- 导航 sticky 当前节高亮 -------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* -------- Cover PLAY 按钮 → 平滑滚到影片 -------- */
  var coverPlay = document.getElementById("coverPlay");
  if (coverPlay) {
    coverPlay.addEventListener("click", function () {
      var target = document.getElementById("film");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* -------- 视频开篇：错误提示 -------- */
  var player = document.getElementById("filmvideo");
  if (player) {
    player.addEventListener("error", function () {
      var p = player.parentElement;
      var tip = document.createElement("p");
      tip.style.cssText = "color:#E8C46B;font-size:13px;padding:14px;font-family:'PingFang SC',sans-serif;letter-spacing:1px";
      tip.textContent = "视频加载失败：请确认 mp4/moon-sixpence-web.mp4 与本页面同目录。";
      p.appendChild(tip);
    });
    player.addEventListener("play", function () { document.body.classList.add("film-playing"); });
    player.addEventListener("pause", function () { document.body.classList.remove("film-playing"); });
  }

  /* -------- 素材轮动（THE STORYBOARD）：横向滚动 + 当前标题切换 -------- */
  var rail = document.getElementById("rail");
  if (rail) {
    var track = rail.querySelector(".rail-track");
    var titles = rail.querySelectorAll(".rail-cap");
    function setActive(idx) {
      titles.forEach(function (c, i) { c.classList.toggle("on", i === idx); });
    }
    if (track) {
      track.addEventListener("scroll", function () {
        var w = track.clientWidth;
        if (w <= 0) return;
        var idx = Math.round(track.scrollLeft / w);
        setActive(Math.min(idx, titles.length - 1));
      }, { passive: true });
      // 鼠标滚轮 → 横向
      track.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          track.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    }
    setActive(0);
  }

  /* -------- 数字计数器（方法/素材节） -------- */
  var nums = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && nums.length) {
    var cIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var dur = 1400;
        var start = performance.now();
        function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          var val = target * eased;
          el.textContent = (target % 1 === 0) ? Math.round(val) : val.toFixed(1);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = (target % 1 === 0) ? target : target.toFixed(1);
        }
        requestAnimationFrame(tick);
        cIo.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { cIo.observe(n); });
  }

  /* -------- 页脚年份 -------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = "Made in " + new Date().getFullYear();

  /* -------- 启动 -------- */
  setProg();
  window.addEventListener("scroll", setProg, { passive: true });
  window.addEventListener("resize", setProg);
  if (document.readyState === "complete") playIntro();
  else window.addEventListener("load", playIntro);
})();