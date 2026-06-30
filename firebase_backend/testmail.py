import smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = "mharshi2806@gmail.com"
SENDER_PASSWORD = "qdbcosxrmijwplwe"  # Your Gmail App Password
RECEIVER_EMAIL = "mpraharshitha2006@gmail.com"

msg = MIMEText("""
Hello Praharshitha 👋,

This is a test email sent from your Python automation setup using Gmail App Password.

✅ SMTP is working perfectly!
🚀 You're ready to send ATS reports next.

- AI Interview Bot
""")

msg["Subject"] = "✅ Test Email from Python"
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()
    print("✅ Email sent successfully to", RECEIVER_EMAIL)
except Exception as e:
    print("❌ Failed to send email:", e)
