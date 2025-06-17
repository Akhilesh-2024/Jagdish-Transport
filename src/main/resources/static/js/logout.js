// ✅ Logout function with email notification handled via Spring Boot backend
async function logout() {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
        reverseButtons: true
    });

    if (!result.isConfirmed) return;

    const username = localStorage.getItem("username");
    const sessionId = localStorage.getItem("sessionId"); // stored as "password"

    if (username && sessionId) {
        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password: sessionId })
            });

            const message = await response.text();

            if (!response.ok) {
                await Swal.fire("❌ Logout Failed", message, "error");
                return;
            }

            console.log("✅ Logout response:", message);

        } catch (error) {
            console.error("❌ Logout request failed:", error);
            await Swal.fire("Error", "Something went wrong during logout.", "error");
            return;
        }
    }

    // ✅ Clear login info from localStorage
    localStorage.removeItem("username");
    localStorage.removeItem("sessionId");

    // ✅ Show success alert
    await Swal.fire({
        title: "Logged out!",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
    });

    // 🔁 Redirect to login page
    window.location.href = "/";
}
