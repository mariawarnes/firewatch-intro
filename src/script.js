// Background /////////////////////////////////////

// "Move background perspective on mouse move effect" by Kriszta
// https://codepen.io/vajkri/pen/grgQmb
var lFollowX = 0,
    lFollowY = 0,
    x = 0,
    y = 0,
    friction = 1 / 100;


function moveBackground() {
    x += (lFollowX - x) * friction;
    y += (lFollowY - y) * friction;
    translate = "translate(" + (x * -1) + "px, " + (y * -1) + "px) scale(1.1)";
    var bg = document.querySelector(".bg");
    bg.style.removeProperty("-webit-transform");
    bg.style.removeProperty("-moz-transform");
    bg.style.removeProperty("transform");
    bg.style.cssText +=
        "-webit-transform:" + translate + ";" +
        "-moz-transform:" + translate + ";" +
        "transform:" + translate + ";";
    window.requestAnimationFrame(moveBackground);
}
window.addEventListener("mousemove", (e) => {
    var lMouseX = Math.max(-100, Math.min(100, window.innerWidth / 2 - e.clientX));
    var lMouseY = Math.max(-100, Math.min(100, window.innerHeight / 2 - e.clientY));
    lFollowX = (20 * lMouseX) / 100;
    lFollowY = (10 * lMouseY) / 100;
});

moveBackground();

// Functions /////////////////////////////////////
let bg = document.querySelector(".bg");
let slides = document.querySelectorAll(".slide");
let slideNumAttr = [];
let currentSlide = 0;
let prevSlideNum = -1;

slides.forEach(function (slide) {
    slideNumAttr.push(slide.getAttribute("data-slide"));
});

function dataSlideToIndex(dataSlide) {
    return slideNumAttr.indexOf(dataSlide);
}

function slideShow() {
    let fadeDuration = 1; 
    let pauseDuration = 2;

    function showSlide() {
        // fade in slide
        slides[currentSlide].animate([{ opacity: 0 },{ opacity: 1 }], { duration: fadeDuration * 1000 }).onfinish = (event) => {
            slides[currentSlide].style.opacity = 1;
            slides[currentSlide].classList.remove("hidden");

            // if there are no links or loader...
            if (!slides[currentSlide].querySelector("button") && !slides[currentSlide].classList.contains("loader")) {

                if (slides[currentSlide].getAttribute("data-bg")) {
                    // fade in background
                    bg.className = "bg";
                    bg.classList.add("bg-" + slides[currentSlide].getAttribute("data-bg"));
                
                    bg.animate([{ opacity: 0 },{ opacity: 1 }], { duration: fadeDuration * 1000 }).onfinish = (event) => {
                        bg.style.opacity = 1;
                    }
                }
                
                // fade out slide
                delay(pauseDuration * 1000).then(function () {
                    slides[currentSlide].animate([
                        { opacity: 1, visiblity: "visible" },
                        { opacity: 0, visiblity: "hidden" }
                    ], { duration: fadeDuration * 1000 }).onfinish = (event) => {
                        slides[currentSlide].style.opacity = 0;
                        slides[currentSlide].classList.add("hidden");
                        nextSlide();
                    }
                });
            // if there are links
            } else {
                // for each link remove the hidden class so it can fade in with css
                slides[currentSlide].querySelectorAll("button").forEach(function (slideLink) {
                    slideLink.classList.remove("hidden");
                });

                if (slides[currentSlide].classList.contains("loader")) {
                    loader();
                }
            }
        }
    }

    function nextSlide() {
        // Move to the next slide and wrap around if necessary
        if (slides[currentSlide].getAttribute("data-next")) {
            currentSlide = dataSlideToIndex(slides[currentSlide].getAttribute("data-next"));
        } else {
            currentSlide = (currentSlide + 1) % slides.length;
        }
        showSlide();
    }

    function goToSlide(slideNum) {
        // Fade out the current slide
        slides[currentSlide].animate([
            { opacity: 1, visiblity: "visible" },
            { opacity: 0, visiblity: "hidden" }
        ],
        { duration: fadeDuration * 1000 }).onfinish = (event) => {
            slides[currentSlide].style.opacity = 0;
            slides[currentSlide].classList.add("hidden");

            // Change current slide to target slide
            currentSlide = slideNum;
            showSlide();
        }
    }

    // Add click event listeners to all links in the slides
    slides.forEach(function (slide) {
        let links = slide.querySelectorAll("button");
        links.forEach(function (link) {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                slideNum = dataSlideToIndex(link.getAttribute("data-slide"));

                if (link.getAttribute("data-type")) {
                    if (link.getAttribute("data-type").includes(",")) {
                        var types = link.getAttribute("data-type").split(",");
                        types.forEach(function (type) {
                            replaceCopy(type, link.getAttribute("data-" + type + "-answer"));
                        });
                    } else {
                        replaceCopy(link.getAttribute("data-type"), link.getAttribute("data-" + link.getAttribute("data-type") + "-answer"));
                    }
                }

                goToSlide(slideNum);
            });
        });
    });

    // Promise-based delay function
    function delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }
    // Show the first slide
    delay(fadeDuration * 1000).then(function () {
        showSlide();
    });


    // Intialise the Loader
    function loader() {
        var sun = document.querySelector(".sun-rise");
        sun.animate(
            [{ cy: 2000 }, { cy: 760 }],
            {
                duration: 10000,
                easing: "cubic-bezier(.1, .7, 1, 1)"
            }
        ).onfinish = (event) => {
            sun.style.cy = 760;
            goToSlide(slides.length - 1);
        }
    }
}

// Tag Replace --------------------------------------
function replaceCopy(type, answer) {
    if (type.includes(",")) {

        var typeSplit = type.split(",");
        for (i = 0; i < typeSplit.length; i++) {
            var typeList = document.querySelectorAll("[class*=\"" + typeSplit[i] + "\"]");
            typeList.forEach(typeNode => {
                replacer(typeNode, "{" + typeSplit[i] + "}", answer[i]);
            });
        }
    } else {
        var typeList = document.querySelectorAll("[class*=\"" + type + "\"]");
        typeList.forEach(typeNode => {
            replacer(typeNode, "{" + type + "}", answer);
        });
    }
    function replacer(wrap, tag, text) {
        if (text != null) {
            var str = wrap.innerHTML
            wrap.innerHTML = str.replace(tag, text);
        }
    }
}

slideShow();

// Keyboard Event Handlers ----------------------------
window.addEventListener(
    "keydown",
    (event) => {
        var currentBtns = document.querySelectorAll(".dialogue:not(.hidden) button");
        var currentSelectBtns = document.querySelectorAll(".dialogue:not(.hidden) button.hover");        
        var leftBtn = document.querySelector(".dialogue:not(.hidden) button.left");
        var rightBtn = document.querySelector(".dialogue:not(.hidden) button.right");

        switch (event.code) {
            case "Enter":
            case "Space":
                if (currentBtns.length == 1) {
                    currentBtns[0].classList.add("hover");
                    currentBtns[0].click();
                } else if (currentSelectBtns.length == 1) {
                    currentSelectBtns[0].click();
                }
                break;
            case "KeyW":
            case "ArrowUp":
                if (currentBtns.length == 1) {
                    currentBtns[0].classList.add("hover");
                }
                break;
            case "KeyS":
            case "ArrowDown":
                if (currentBtns.length == 1) {
                    currentBtns[0].classList.add("hover");
                }
                break;
            case "KeyA":
            case "ArrowLeft":
                leftBtn.classList.add("hover");
                rightBtn.classList.remove("hover");
                break;
            case "KeyD":
            case "ArrowRight":
                rightBtn.classList.add("hover");
                leftBtn.classList.remove("hover");
                break;
        }
    },
    true
);