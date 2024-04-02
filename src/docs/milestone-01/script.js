document.addEventListener("DOMContentLoaded", function() {
    const sectionHeadings = document.querySelectorAll("section h2");
    sectionHeadings.forEach(function(heading) {
        heading.addEventListener("click", function() {
            this.parentNode.classList.toggle("collapsed");
        });
    });
});
