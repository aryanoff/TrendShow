/**
 * FAQ Page Logic
 * Interactive accordion toggle with keyboard support.
 */

document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const questionBtn = item.querySelector(".faq-question");

        questionBtn.addEventListener("click", () => {
            const wasActive = item.classList.contains("active");

            // Close other items
            faqItems.forEach(i => i.classList.remove("active"));

            // Toggle current
            if (!wasActive) {
                item.classList.add("active");
            }
        });
    });
});
