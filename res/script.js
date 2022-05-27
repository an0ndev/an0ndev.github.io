let initialBrightness = true;
let lightMode = false;

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
            const targetElem = document.querySelector(thisLinkElem.dataset.target);

            // get position of element on page
            let elemParent = targetElem;
            let left = 0, top = 0;
            while (elemParent !== null) {
                left += elemParent.offsetLeft;
                top += elemParent.offsetTop;
                elemParent = elemParent.offsetParent;
            }

            const boundingClientRect = targetElem.getBoundingClientRect();
            window.scrollTo({left: left, top: top, behavior: "smooth"});
        });
    });
});