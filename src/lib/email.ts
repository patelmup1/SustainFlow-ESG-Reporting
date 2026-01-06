export async function sendEmail(to: string, subject: string, body: string) {
    // Mock email sending
    console.log(`
    📧 MOCK EMAIL SENDING 📧
    To: ${to}
    Subject: ${subject}
    Body: ${body}
    ---------------------------
    `);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
}
