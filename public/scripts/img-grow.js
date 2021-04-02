document.addEventListener("DOMContentLoaded", function () {
  const debounce = function (func, wait, immediate) {
    let timeout;

    return function () {
      const context = this;
      const args = arguments;

      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  const initImgs = debounce(function () {
    const imgs = document.querySelectorAll("img");
    imgs.forEach(function (img) {
      if (img.dataset.imgGrow || img.id === "img-grow-img") {
        return;
      }

      img.dataset.imgGrow = true;
      img.classList.add("img-grow--target");

      img.addEventListener("click", function handleClick(e) {
        e.stopPropagation();

        const imgTag = document.createElement("img");
        imgTag.src = img.src;
        imgTag.id = "img-grow-img";
        imgTag.className = "img-grow--img";

        const container = document.createElement("div");
        container.id = "img-grow";
        container.className = "img-grow--flex-center";

        container.appendChild(imgTag);

        document.body.appendChild(container);
        document.body.style.overflow = "hidden";

        document.addEventListener("click", function () {
          container.remove();
          document.body.style.overflow = "auto";
          document.removeEventListener("click", this);
        });
      });
    });
  }, 500);

  const observer = new MutationObserver(function (mutationsList) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        initImgs();
      }
    }
  });

  observer.observe(document, {
    attributes: false,
    childList: true,
    subtree: true,
  });
});
