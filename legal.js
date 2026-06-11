const deleteAccountForm = document.querySelector("#deleteAccountForm");

if (deleteAccountForm) {
  const API_URL = "https://api.poohter.com/api/legal/account-deletion-requests";
  const SUPPORT_EMAIL = "support@poohter.com";
  const statusEl = document.querySelector("#deleteRequestStatus");
  const mailLink = document.querySelector("#deleteMailLink");
  const accountTypeEl = deleteAccountForm.querySelector("#accountType");
  const emailLabelEl = deleteAccountForm.querySelector("#emailLabel");
  const confirmTextEl = deleteAccountForm.querySelector("#confirmText");
  const emailInput = deleteAccountForm.elements.email;

  const accountLabel = (type) => (type === "seller" ? "Seller" : "Buyer");

  const updateAccountCopy = () => {
    const label = accountLabel(accountTypeEl.value);
    emailLabelEl.textContent = `${label} account email`;
    confirmTextEl.textContent = `I confirm that I want to request deletion of my Poohter ${label} account.`;
    emailInput.placeholder = `${label.toLowerCase()}@example.com`;
  };

  const setStatus = (message, type = "") => {
    statusEl.textContent = message;
    statusEl.className = `legal-status ${type}`.trim();
  };

  const buildMailto = (payload) => {
    const label = accountLabel(payload.accountType);
    const subject = `Poohter ${label} account deletion request`;
    const body = [
      `Please delete my Poohter ${label} account.`,
      "",
      `Account type: ${label}`,
      `Name: ${payload.name || ""}`,
      `Email: ${payload.email || ""}`,
      `Phone: ${payload.phone || ""}`,
      `Reason: ${payload.reason || ""}`,
    ].join("\n");
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  deleteAccountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    mailLink.classList.add("hidden");

    const formData = new FormData(deleteAccountForm);
    const payload = Object.fromEntries(formData.entries());
    payload.accountType = payload.accountType === "seller" ? "seller" : "buyer";
    payload.confirmed = deleteAccountForm.elements.confirmed.checked;

    if (!payload.email) {
      setStatus(`Enter the email address for your Poohter ${accountLabel(payload.accountType)} account.`, "error");
      return;
    }

    setStatus("Submitting your deletion request...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || "Request failed");

      setStatus(data.message || "Account deletion request received.", "success");
      deleteAccountForm.reset();
    } catch (error) {
      mailLink.href = buildMailto(payload);
      mailLink.classList.remove("hidden");
      setStatus(
        `${error.message || "Could not submit the form online."} You can email the same request to support.`,
        "error"
      );
    }
  });

  accountTypeEl.addEventListener("change", updateAccountCopy);
  updateAccountCopy();
}
