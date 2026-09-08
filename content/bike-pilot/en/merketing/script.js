/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton =
    document.querySelector(".mobile-menu-button");

const nav =
    document.querySelector(".nav-links");

if (menuButton) {

    menuButton.addEventListener("click", () => {

        nav.classList.toggle("mobile-open");

    });

}


/* =========================================================
   CAROUSEL
========================================================= */

const track =
    document.querySelector(".templates-track");

const next =
    document.querySelector(".carousel-next");

const prev =
    document.querySelector(".carousel-prev");


if (track && next && prev) {

    next.addEventListener("click", () => {

        track.scrollBy({
            left: 260,
            behavior: "smooth"
        });

    });


    prev.addEventListener("click", () => {

        track.scrollBy({
            left: -260,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   HERO 3D MOUSE PARALLAX
========================================================= */

const scene =
    document.querySelector(".phone-scene");

if (scene) {

    scene.addEventListener("mousemove", (event) => {

        const rect =
            scene.getBoundingClientRect();

        const x =
            (event.clientX - rect.left)
            / rect.width;

        const y =
            (event.clientY - rect.top)
            / rect.height;

        const rotateY =
            (x - 0.5) * 8;

        const rotateX =
            (y - 0.5) * -5;


        scene.style.transform =
            `rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)`;

    });


    scene.addEventListener("mouseleave", () => {

        scene.style.transform =
            "rotateX(0deg) rotateY(0deg)";

    });

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".feature-card, .template-card, .cta-section"
    );


const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: .15
        }
    );


revealElements.forEach(element => {

    observer.observe(element);

});