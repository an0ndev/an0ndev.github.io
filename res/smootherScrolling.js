let sections;
let useSmootherScrolling;
function verifySmootherScrollingCapability() {
    const viewportHeight = document.documentElement.clientHeight;
    for (let section of sections) {
        if (viewportHeight < section.clientHeight) {
            useSmootherScrolling = false;
            return;
        }
    }
    useSmootherScrolling = true;
}

function doSmootherScrolling(scrollEvent) {
    if (!useSmootherScrolling) return;

    scrollEvent.preventDefault();
    let sectionDelta = scrollEvent.deltaY / Math.abs(scrollEvent.deltaY);

    let currentSectionFractional = document.documentElement.scrollTop / document.documentElement.clientHeight;
    let currentSection;
    if (currentSectionFractional === Math.round(currentSectionFractional)) {
        // We are already looking at a section
        currentSection = Math.round(currentSectionFractional) + sectionDelta;
    } else {
        // Go to the next section down if scrolling down, and vice versa
        // If we are scrolling down, round to the next
        currentSection = sectionDelta > 0 ? Math.ceil(currentSectionFractional) : Math.floor(currentSectionFractional);
    }

    currentSection = Math.min(Math.max(0, currentSection), sections.length - 1);
    /*
    // (above) let lastSection = currentSection;
    if (currentSection === lastSection) {
        // Prevent snapping when quickly scrolling to the top or bottom of the page
        return;
    }
    */
    scrollToElement(sections[currentSection]);
}

window.addEventListener("load", windowLoadEvent => {
    // get array of page sections
    sections = document.querySelectorAll(".full-page");
    verifySmootherScrollingCapability();
    window.addEventListener("resize", verifySmootherScrollingCapability);
    document.addEventListener("wheel", doSmootherScrolling, {passive: false});
});
