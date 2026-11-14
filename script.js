const tabs = [...document.querySelectorAll(".dock-option")];
const pages = [...document.querySelectorAll(".page")];
const dock = document.querySelector(".dock");
const pageNames = tabs.map((tab) => tab.dataset.page);

function pageFromHash() {
  const requestedPage = window.location.hash.slice(1);
  return pageNames.includes(requestedPage) ? requestedPage : "programacao";
}

function activatePage(pageName, { history = false, animate = true } = {}) {
  const nextTab = tabs.find((tab) => tab.dataset.page === pageName);
  const nextPage = pages.find((page) => page.dataset.page === pageName);

  if (!nextTab || !nextPage) return;

  const currentPage = pages.find((page) => page.classList.contains("is-active"));
  const pageIndex = tabs.indexOf(nextTab);

  tabs.forEach((tab) => {
    const isSelected = tab === nextTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  dock.querySelector(".dock-indicator").style.transform = `translateX(${pageIndex * 100}%)`;
  document.body.dataset.theme = pageName;

  if (currentPage !== nextPage) {
    if (currentPage) {
      currentPage.classList.remove("is-active", "is-entering");
      currentPage.classList.add("is-leaving");
      currentPage.setAttribute("aria-hidden", "true");
      currentPage.inert = true;

      window.setTimeout(() => {
        if (currentPage.classList.contains("is-leaving")) {
          currentPage.classList.remove("is-leaving");
          currentPage.hidden = true;
        }
      }, 240);
    }

    nextPage.hidden = false;
    nextPage.inert = false;
    nextPage.setAttribute("aria-hidden", "false");
    nextPage.classList.remove("is-leaving", "is-entering");

    if (animate) {
      requestAnimationFrame(() => nextPage.classList.add("is-entering"));
    } else {
      nextPage.classList.add("is-active");
    }
    nextPage.classList.add("is-active");
  }

  if (history && window.location.hash !== `#${pageName}`) {
    window.history.pushState({ page: pageName }, "", `#${pageName}`);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activatePage(tab.dataset.page, { history: true });
  });

  tab.addEventListener("keydown", (event) => {
    const currentIndex = tabs.indexOf(tab);
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    activatePage(tabs[nextIndex].dataset.page, { history: true });
  });
});

function syncPageWithLocation() {
  activatePage(pageFromHash());
}

window.addEventListener("popstate", syncPageWithLocation);
window.addEventListener("hashchange", syncPageWithLocation);

const initialPage = pageFromHash();
activatePage(initialPage, { animate: false });

if (window.location.hash !== `#${initialPage}`) {
  window.history.replaceState({ page: initialPage }, "", `#${initialPage}`);
}