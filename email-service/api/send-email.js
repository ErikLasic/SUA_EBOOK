import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  try {
    await sgMail.send({
      to: "lasic.erik@gmail.com",
      from: "eric.lasic12345@gmail.com",
      subject: "Test email iz Vercel API",
      text: "Pozdrav, to je test email!",
    });
    res.status(200).json({ message: "Email uspešno poslan!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Napaka pri pošiljanju emaila" });
  }
}
