/* ===== ai_use 全站导航 =====
 * 导航数据 = 学习路线图六阶段。新增主题页面时：
 *   1. 把页面放到 topics/<阶段slug>/<主题slug>/index.html
 *   2. 在下面 SITE_NAV 对应阶段的 topics 里注册
 *   3. 跑 python3 tools/check_links.py 验证
 */

var SITE_NAV = [
  {
    slug: "prompt-engineering",
    title: "提示词工程",
    status: "todo",
    topics: []
  },
  {
    slug: "ai-coding",
    title: "AI 编程助手",
    status: "doing",
    topics: [
      { title: "Superpowers 完全指南", href: "topics/ai-coding/superpowers/index.html" }
    ]
  },
  {
    slug: "agent",
    title: "Agent",
    status: "todo",
    topics: []
  },
  {
    slug: "rag",
    title: "RAG",
    status: "todo",
    topics: []
  },
  {
    slug: "multimodal",
    title: "多模态",
    status: "todo",
    topics: []
  },
  {
    slug: "automation",
    title: "自动化集成",
    status: "todo",
    topics: []
  }
];

(function () {
  // 从自身 <script src> 推导站点根路径，页面在任意深度都能正确链接
  var script = document.currentScript;
  if (!script) return;
  var root = script.src.replace(/\/assets\/site\.js$/, "");

  function build() {
    var nav = document.createElement("header");
    nav.className = "site-nav";
    var html = '<a class="brand" href="' + root + '/index.html">⚡ AI 学习笔记</a>';
    html += '<div class="item" data-home><a href="' + root + '/index.html">首页</a></div>';
    SITE_NAV.forEach(function (stage) {
      var dotCls = stage.status === "doing" ? "doing" : stage.status === "done" ? "done" : "";
      var current = location.pathname.indexOf("/topics/" + stage.slug + "/") !== -1;
      html += '<div class="item' + (current ? " current" : "") + '">';
      html += '<a href="#">' + stage.title + '<span class="dot ' + dotCls + '"></span></a>';
      html += '<div class="menu">';
      if (stage.topics.length === 0) {
        html += '<div class="empty">还没有笔记，敬请期待</div>';
      } else {
        stage.topics.forEach(function (t) {
          html += '<a href="' + root + "/" + t.href + '">' + t.title + "</a>";
        });
      }
      html += "</div></div>";
    });
    nav.innerHTML = html;
    document.body.prepend(nav);
    // 高亮"首页"
    var homeItem = nav.querySelector("[data-home]");
    if (/\/index\.html$/.test(location.pathname) &&
        location.pathname.indexOf("/topics/") === -1) {
      homeItem.classList.add("current");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
