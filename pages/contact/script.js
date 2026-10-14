/**
 * Contact Page Logic
 * Validates inputs client-side and formats direct mailto submission.
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const subjectSelect = document.getElementById("contactSubject");
    const messageInput = document.getElementById("contactMessage");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const messageError = document.getElementById("messageError");
    const successBanner = document.getElementById("formSuccessBanner");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // Name Validation
            if (!nameInput.value.trim()) {
                nameError.textContent = "Please enter your name.";
                isValid = false;
            } else {
                nameError.textContent = "";
            }

            // Email Validation
            const emailVal = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal || !emailRegex.test(emailVal)) {
                emailError.textContent = "Please enter a valid email address.";
                isValid = false;
            } else {
                emailError.textContent = "";
            }

            // Message Validation
            if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
                messageError.textContent = "Message must be at least 10 characters long.";
                isValid = false;
            } else {
                messageError.textContent = "";
            }

            if (isValid) {
                const subjectText = subjectSelect ? subjectSelect.selectedOptions[0].text : "Inquiry";
                const mailtoUrl = `mailto:support@trendshow.in?subject=${encodeURIComponent("TrendShow Inquiry: " + subjectText)}&body=${encodeURIComponent("Name: " + nameInput.value.trim() + "\nEmail: " + emailVal + "\n\nMessage:\n" + messageInput.value.trim())}`;

                // Formatted mailto redirection
                window.location.href = mailtoUrl;

                form.style.display = "none";
                if (successBanner) {
                    successBanner.innerHTML = `
                        <i class="fa-solid fa-circle-check" style="font-size: 28px; color: #2e7d32; flex-shrink: 0;"></i>
                        <div>
                            <h4 style="margin: 0 0 6px; font-size: 16px; color: #2e7d32;">Inquiry Ready to Send!</h4>
                            <p style="margin: 0 0 12px; font-size: 13.5px; color: #444; line-height: 1.5;">Your message has been formatted for your email client. If it did not launch automatically, click the button below or email support@trendshow.in directly.</p>
                            <a href="${mailtoUrl}" class="btn-submit" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; padding: 9px 18px; font-size: 13px; font-weight: 700;">
                                <span>Open Email App</span> <i class="fa-solid fa-paper-plane"></i>
                            </a>
                        </div>
                    `;
                    successBanner.style.display = "flex";
                }
            }
        });
    }
});
