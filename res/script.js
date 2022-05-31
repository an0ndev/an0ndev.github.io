let initialBrightness = true;
let lightMode = false;

function scrollToElement(elem) {
    // get position of element on page
    let elemParent = elem;
    let left = 0, top = 0;
    while (elemParent !== null) {
        left += elemParent.offsetLeft;
        top += elemParent.offsetTop;
        elemParent = elemParent.offsetParent;
    }

    const boundingClientRect = elem.getBoundingClientRect();
    window.scrollTo({left: left, top: top, behavior: "smooth"});
}

let currentPortfolioSlide = 0;
let portfolioContentItems;
let portfolioSwitchIndicators;

window.addEventListener("load", windowLoadEvent => {
    // click on light toggle --> switch light <--> dark mode
    document.querySelectorAll(".brightness-toggle").forEach(elem => {
        elem.addEventListener("click", brightnessToggleClickEvent => {
            lightMode = !lightMode;
            if (initialBrightness) {
                document.querySelectorAll(".brightness-toggle").forEach(elem => {
                    elem.classList.remove("brightness-toggle-initial");
                });
                initialBrightness = false;
            }
            document.body.classList.remove(lightMode ? "dark-mode": "light-mode");
            document.body.classList.add(lightMode ? "light-mode": "dark-mode");
        });
    });

    // click on email --> attempt email copy, update icon accordingly
    document.getElementById("email").addEventListener("click", emailClickEvent => {
        const email = emailClickEvent.target.innerText;
        const emailCopyIcon = document.getElementById("email-copy-icon");
        if (!navigator.clipboard) {
            // Insecure origin?
            emailCopyIcon.innerText = "error";
            return;
        }
        navigator.clipboard.writeText(email)
            .then(() => {
                emailCopyIcon.innerText = "done";
            })
            .catch(error => {
                emailCopyIcon.innerText = "error";
            });
    });

    // click on link --> scroll to link target
    document.querySelectorAll(".link").forEach(linkElem => {
        linkElem.addEventListener("click", linkClickEvent => {
            const thisLinkElem = linkClickEvent.target;
            const targetClassName = thisLinkElem.dataset.target;
            // save the current section as the hash
            window.location = `#${targetClassName}`;
            const targetElem = document.getElementsByClassName(targetClassName)[0];
            scrollToElement(targetElem);
        });
    });

    // get array of portfolio slides
    portfolioContentItems = document.getElementsByClassName("portfolio-content-item");
    portfolioSwitchIndicators = document.getElementById("portfolio-switch-indicator").children;

    // click portfolio move button -- switch active portfolio slide
    function movePortfolio(deltaSlides) {
        let newPortfolioSlide = currentPortfolioSlide - deltaSlides;
        if (newPortfolioSlide < 0) return;
        if (newPortfolioSlide > (portfolioContentItems.length - 1)) return;
        currentPortfolioSlide = newPortfolioSlide;

        let thisSlideIndex = 0;
        for (const portfolioContentItem of portfolioContentItems) {
            const translationAmount = (currentPortfolioSlide - thisSlideIndex) * -100;
            portfolioContentItem.style.transform = `translateX(${translationAmount}%)`;
            portfolioSwitchIndicators[thisSlideIndex].innerText = translationAmount === 0 ? "radio_button_checked" : "radio_button_unchecked";

            thisSlideIndex += 1;
        }
    }

    document.querySelector("#portfolio-switcher-left").addEventListener("click", switchLeftEvent => {
        movePortfolio(1);
    });
    document.querySelector("#portfolio-switcher-right").addEventListener("click", switchRightEvent => {
        movePortfolio(-1);
    })

    // scroll to whatever section we saved as the hash
    const hash = window.location.hash;
    if (hash !== "" && hash.length >= 2 && hash[0] === "#") {
        const targetClassName = hash.slice(1);
        const targetElems = document.getElementsByClassName(targetClassName);
        if (targetElems.length >= 1) {
            const targetElem = targetElems[0];
            scrollToElement(targetElem);
        }
    }
});