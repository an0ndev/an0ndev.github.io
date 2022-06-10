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
let portfolioContent;

let portfolioItemInitialTouchPos;
let portfolioItemLatestTouchPos;

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

    portfolioContent = document.getElementById("portfolio-content");

    // click portfolio move button -- switch active portfolio slide
    function movePortfolio(deltaSlides) {
        let newPortfolioSlide = currentPortfolioSlide - deltaSlides;

        // bounds checking
        if (newPortfolioSlide < 0) newPortfolioSlide = 0;
        if (newPortfolioSlide > (portfolioContentItems.length - 1)) newPortfolioSlide = portfolioContentItems.length - 1;
        if (newPortfolioSlide === currentPortfolioSlide) return;

        currentPortfolioSlide = newPortfolioSlide;

        // do translation
        let thisSlideIndex = 0;
        const translationAmount = currentPortfolioSlide * -1;
        portfolioContent.style.transform = `translateX(calc(${translationAmount} * var(--portfolio-item-width)))`;

        // update switch indicators
        const closestPortfolioSlide = Math.round(currentPortfolioSlide);
        for (const portfolioContentItem of portfolioContentItems) {
            portfolioSwitchIndicators[thisSlideIndex].innerText = thisSlideIndex === closestPortfolioSlide ? "radio_button_checked" : "radio_button_unchecked";

            thisSlideIndex += 1;
        }
    }

    document.querySelector("#portfolio-switcher-left").addEventListener("click", switchLeftEvent => {
        movePortfolio(1);
    });
    document.querySelector("#portfolio-switcher-right").addEventListener("click", switchRightEvent => {
        movePortfolio(-1);
    });

    const parseVW = (vw) => {return window.innerWidth * (vw / 100)};
    const parseVH = (vh) => {return window.innerHeight * (vh / 100)};
    function getPortfolioItemWidth() {
        const portfolioItemWidthStr = getComputedStyle(document.body).getPropertyValue("--portfolio-item-width").trim();
        const portfolioItemWidthCalcParseMatch = /^calc\((?<vw_value>[0-9]+)vw - (?<vh_value>[0-9]+)vh\)$/.exec(portfolioItemWidthStr);
        const portfolioItemWidthVWParseMatch = /^(?<vw_value>[0-9]+)vw$/.exec(portfolioItemWidthStr);
            if (portfolioItemWidthCalcParseMatch !== null) {
                return parseVW(portfolioItemWidthCalcParseMatch.groups.vw_value) - parseVH(portfolioItemWidthCalcParseMatch.groups.vh_value);
            } else if (portfolioItemWidthVWParseMatch !== null) {
                return parseVW(portfolioItemWidthVWParseMatch.groups.vw_value);
            } else {
                throw new Error("couldn't parse portfolio item width");
            }
    }

    Array.from(portfolioContentItems).forEach(portfolioContentItem => {
        portfolioContentItem.addEventListener("touchstart", touchStartEvent => {
            portfolioItemInitialTouchPos = touchStartEvent.changedTouches[0].clientX;
            portfolioItemLatestTouchPos = portfolioItemInitialTouchPos;
            portfolioContent.classList.add("portfolio-content-being-dragged");
        });
        portfolioContentItem.addEventListener("touchmove", touchMoveEvent => {
            const thisTouchPos = touchMoveEvent.changedTouches[0].clientX;
            const differenceFraction = (thisTouchPos - portfolioItemLatestTouchPos) / getPortfolioItemWidth();
            movePortfolio(differenceFraction);
            portfolioItemLatestTouchPos = thisTouchPos;
        });
        portfolioContentItem.addEventListener("touchend", touchEndEvent => {
            portfolioContent.classList.remove("portfolio-content-being-dragged");
            const totalDifferenceFraction = (portfolioItemLatestTouchPos - portfolioItemInitialTouchPos) / getPortfolioItemWidth();
            // if we have moved at least a third of a slide in a given direction
            if (Math.abs(totalDifferenceFraction) >= 1/3) {
                // move to the next slide in that direction
                let targetSlide;
                let toRight = totalDifferenceFraction < 0; // movement of touch in leftward (negative) direction --> movement of slide in rightward direction
                if (Math.round(currentPortfolioSlide) === currentPortfolioSlide) {
                    targetSlide = currentPortfolioSlide;
                } else {
                    if (toRight) {
                        targetSlide = Math.floor(currentPortfolioSlide + 1);
                    } else {
                        targetSlide = Math.ceil(currentPortfolioSlide - 1);
                    }
                }
                movePortfolio(currentPortfolioSlide - targetSlide);
            } else {
                // otherwise, move to the closest slide
                movePortfolio((Math.round(currentPortfolioSlide) - currentPortfolioSlide) * -1);
            }
            portfolioItemLatestTouchPos = null;
        });
    });

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