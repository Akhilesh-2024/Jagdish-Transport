document.addEventListener("DOMContentLoaded", function () {
    // DOM element references
    const statusMessageEl = document.getElementById("statusMessage");  // Displays "ON" or "OFF"
    const toggleInput = document.getElementById("autoToggle");          // Checkbox for auto mode
    const toggleStatus = document.getElementById("toggleStatus");         // Additional status text
    const prefixField = document.getElementById("prefix");                // Input for invoice prefix
    const startingNumberField = document.getElementById("startNumber");// Input for starting number
    const previewNumberEl = document.getElementById("previewNumber");     // Element for next invoice number preview
    const saveBtn = document.getElementById("saveBtn");                   // Save button

    console.log("✅ Invoice Settings App Loaded!");

    // --- Notification Function ---
    function showNotification(message, type) {
        let notification = document.getElementById("notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "notification";
            document.body.appendChild(notification);
        }
        notification.textContent = message;
        notification.className = `notification ${type}`; // CSS should define .notification.success and .notification.error
        notification.style.display = "block";
        // Wait 3 seconds then hide
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }

    // --- Fetch Data and Update UI ---
    async function fetchData() {
        try {
            // Fetch invoice settings
            const settingsResponse = await fetch("/invoice/settings");
            if (!settingsResponse.ok) throw new Error("Failed to fetch settings");
            const settingsData = await settingsResponse.json();

            // Fetch last invoice record (expects JSON with property "lastInvoiceNumber")
            const lastInvoiceResponse = await fetch("/invoice/last-record");
            if (!lastInvoiceResponse.ok)
                throw new Error(`Failed to fetch last record: ${lastInvoiceResponse.status}`);
            const lastInvoiceData = await lastInvoiceResponse.json();

            console.log("Fetched Settings Data:", settingsData);
            console.log("Fetched Last Invoice Record:", lastInvoiceData);

            // Convert autoGenerate to boolean
            const autoGenerate = settingsData.autoGenerate === true || settingsData.autoGenerate === "true";

            // Update status message element with "ON" or "OFF" and set color
            if (statusMessageEl) {
                statusMessageEl.textContent = autoGenerate ? "ON" : "OFF";
                statusMessageEl.style.color = autoGenerate ? "green" : "red";
            }
            // Update toggle checkbox and secondary status text
            if (toggleInput) {
                toggleInput.checked = autoGenerate;
            }
            if (toggleStatus) {
                toggleStatus.textContent = autoGenerate ? "ON" : "OFF";
                toggleStatus.style.color = autoGenerate ? "green" : "red";
            }
            // Set input fields with saved values
            if (prefixField) {
                prefixField.value = settingsData.prefix || "INV";
            }
            if (startingNumberField) {
                startingNumberField.value = settingsData.startNumber || "1001";
            }
            // Update next invoice number preview from last invoice record
            if (previewNumberEl) {
                previewNumberEl.textContent = lastInvoiceData.lastInvoiceNumber || "INV1001";
            }
            // Enable/disable fields based on autoGenerate state
            toggleFields(autoGenerate);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (statusMessageEl) {
                statusMessageEl.textContent = "Error";
                statusMessageEl.style.color = "red";
            }
            showNotification("Error fetching settings data", "error");
        }
    }
    fetchData();

    // --- Toggle Fields Function ---
    // Enable both input fields if auto mode is ON; disable if OFF.
    function toggleFields(isAutoGenerate) {
        console.log("Auto Generate Mode:", isAutoGenerate ? "ON" : "OFF");
        if (prefixField) {
            prefixField.disabled = !isAutoGenerate;
        }
        if (startingNumberField) {
            startingNumberField.disabled = !isAutoGenerate;
        }
        updatePreview();
    }

    // --- Handle Toggle Change ---
    if (toggleInput) {
        toggleInput.addEventListener("change", function () {
            const currentStatus = this.checked ? "ON" : "OFF";
            if (toggleStatus) {
                toggleStatus.textContent = currentStatus;
                toggleStatus.style.color = this.checked ? "green" : "red";
            }
            if (statusMessageEl) {
                statusMessageEl.textContent = currentStatus;
                statusMessageEl.style.color = this.checked ? "green" : "red";
            }
            toggleFields(this.checked);
        });
    }

    // --- Save Button Event Listener ---
    if (saveBtn) {
        if (saveBtn.disabled) {
            console.log("🚀 Enabling Save Button...");
            saveBtn.disabled = false;
        }
        saveBtn.addEventListener("click", function (event) {
            console.log("✅ Save Button Clicked!");
            event.preventDefault();
			Swal.fire({
			    title: "Save All Changes?",
			    text: "This will update all vouchers in the system",
			    icon: "question",
			    showCancelButton: true,
			    confirmButtonColor: "#3b82f6",
			    cancelButtonColor: "#6b7280",
			    confirmButtonText: "Yes, save all!",
			    background: "#fff",   // 🔄 Changed from dark to light
			    color: "rgb(26, 32, 53)",  // 🔄 Changed from white to dark
			}).then((result) => {
                if (result.isConfirmed) {
                    console.log("🚀 Submitting Form...");
                    submitForm();
                } else {
                    console.log("❌ Save Canceled.");
                }
            });
        });
        console.log("✅ Save Button Event Listener Attached!");
    } else {
        console.error("❌ Save button not found!");
    }

    // --- Form Submission ---
    function submitForm() {
        const form = document.getElementById("invoiceForm");
        if (!form) {
            console.error("❌ Form not found!");
            return;
        }
        const autoToggle = document.getElementById("autoToggle");
        const autoGenerateInput = document.createElement("input");
        autoGenerateInput.type = "hidden";
        autoGenerateInput.name = "autoGenerate";
        autoGenerateInput.value = autoToggle.checked ? "1" : "0";
        form.appendChild(autoGenerateInput);
        console.log("🚀 Submitting Form...");
        form.submit();
    }

    // --- Update Next Invoice Preview ---
    function updatePreview() {
        if (!previewNumberEl) return;
        fetch("/invoice/latest-number")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                previewNumberEl.textContent = data.nextInvoiceNumber || "INV1001";
            })
            .catch(error => {
                console.error("Error fetching latest invoice number:", error);
                showNotification("Failed to fetch latest invoice number", "error");
            });
    }

    // --- Reset Functionality ---
    // On reset, send a POST request to the reset endpoint (which should truncate the table)
    // and then update the UI to default values and disable the input fields.
    function resetForm() {
        Swal.fire({
            title: "Are you sure?",
            text: "This will clear all settings!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#3b82f6",
            confirmButtonText: "Yes, reset!",
            background: "#fff",
            color: "rgb(26, 32, 53)"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/invoice/settings/reset", { method: "POST" })
                    .then(response => {
                        if (response.ok) {
                            // After reset, update UI to default values.
                            if (prefixField) prefixField.value = "INV";
                            if (startingNumberField) startingNumberField.value = "1001";
                            if (toggleInput) {
                                toggleInput.checked = false;
                            }
                            if (toggleStatus) {
                                toggleStatus.textContent = "OFF";
                                toggleStatus.style.color = "red";
                            }
                            if (statusMessageEl) {
                                statusMessageEl.textContent = "OFF";
                                statusMessageEl.style.color = "red";
                            }
                            // Disable both fields since auto mode is now OFF.
                            toggleFields(false);
                            updatePreview();
                            showNotification("Settings reset successfully!", "success");
                        } else {
                            Swal.fire("Error", "Failed to reset settings.", "error");
                        }
                    })
                    .catch(error => {
                        console.error("Reset Error:", error);
                        showNotification("Error resetting settings", "error");
                    });
            }
        });
    }

    // Expose resetForm globally so it can be called via inline onclick attribute.
    window.resetForm = resetForm;

    // --- Additional Form Event Listeners ---
    function setupFormHandlers() {
        console.log("Setting up form handlers...");
        if (prefixField) {
            prefixField.addEventListener("input", updatePreview);
        }
        if (startingNumberField) {
            startingNumberField.addEventListener("input", updatePreview);
        }
        if (toggleInput) {
            toggleInput.addEventListener("change", function () {
                toggleFields(this.checked);
            });
            toggleFields(toggleInput.checked);
        }
        console.log("Form handlers set up successfully.");
    }

    setupFormHandlers();
});
