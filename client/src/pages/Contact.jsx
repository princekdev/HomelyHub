import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, ChevronDown } from "lucide-react";
import { submitContactForm } from "../services/contactService";

const FAQS = [
  {
    q: "How do I cancel a booking?",
    a: "Go to My Bookings, find the reservation under Upcoming, and click Cancel booking. Cancellation terms vary by host.",
  },
  {
    q: "How do I become a host?",
    a: "Visit the Become a Host page and click the button to activate host access on your account, then add your first property.",
  },
  {
    q: "Is payment required at the time of booking?",
    a: "This version of HomelyHub uses a demo booking flow — no real payment is collected. A payment gateway can be integrated later.",
  },
  {
    q: "How does HomelyHub prevent double bookings?",
    a: "Every booking request is checked against existing reservations on the backend before being confirmed, so overlapping dates are automatically rejected.",
  },
];

const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-100 py-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="font-medium text-sm">{faq.q}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-ink-500 mt-2">{faq.a}</p>}
    </div>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitContactForm(form);
      toast.success(res.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send your message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-bold mb-2">Contact & Support</h1>
      <p className="text-ink-500 mb-10">We're here to help with anything HomelyHub related.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-semibold text-lg mb-4">Frequently Asked Questions</h2>
          <div>
            {FAQS.map((f) => <FaqItem key={f.q} faq={f} />)}
          </div>

          <div className="mt-8 space-y-3 text-sm text-ink-600">
            <p className="flex items-center gap-2"><Mail size={16} className="text-brand-500" /> support@homelyhub.com</p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-brand-500" /> +91 98765 43210</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-1">Send us a message</h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subject</label>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Message</label>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input-field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
