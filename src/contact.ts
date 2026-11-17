import emailjs from '@emailjs/browser';

const form = document.querySelector<HTMLFormElement>('#contact-form');
const feedback = document.querySelector<HTMLElement>('#contact-feedback');
const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

if (form && feedback && button) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();
  const isConfigured = Boolean(serviceId && templateId && publicKey);

  feedback.textContent = isConfigured
    ? 'Your message will be sent directly to Gourav.'
    : 'Contact form delivery is not configured yet.';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;

    if (!serviceId || !templateId || !publicKey) {
      feedback.textContent = 'Contact form delivery is not configured yet.';
      return;
    }

    const values = new FormData(form);
    const email = String(values.get('email') ?? '').trim();
    const message = String(values.get('message') ?? '').trim();
    if (!email || !message) return;

    button.disabled = true;
    feedback.textContent = 'Sending your message…';

    try {
      const response = await emailjs.send(serviceId, templateId, {
        from_email: email,
        reply_to: email,
        message,
      }, { publicKey });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Email service returned ${response.status}.`);
      }

      form.reset();
      feedback.textContent = 'Message sent. Thanks for reaching out.';
    } catch {
      feedback.textContent = 'Message could not be sent. Please try again later.';
    } finally {
      button.disabled = false;
    }
  });
}
