// BikePilot — intentionally small, dependency-free JavaScript.
// Static site: no backend, no framework.

document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".features article, .release-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => {
  item.classList.add("reveal");
  observer.observe(item);
});
