import { AudioLines, Mail, MapPin, Send, Check } from "lucide-react";
import { Alert, Button, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";
import Eyebrow from "../components/common/Eyebrow";
import PageIntro from "../components/common/PageIntro";
import { useContactContent } from "../lib/contentStore";

export default function ContactPage() {
  const contact = useContactContent();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      <PageIntro
        description="For ministry enquiries, prayer support, book orders, and conference information, reach out to HOREMOW headquarters."
        eyebrow="Get in touch"
        title="We’d be glad to hear from you."
      />
      <section className="py-12">
        <div className="mx-auto grid w-[min(1100px,calc(100%-2.25rem))] gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow>International Headquarters</Eyebrow>
            <h2 className="text-4xl font-bold leading-tight tracking-[-.06em] text-ink">
              Connect with the ministry.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Reach out through our verified administrative desk and pastoral helpline lines below.
            </p>
            <div className="mt-7 grid gap-4">
              <a
                className="flex items-center gap-3 text-sm font-semibold text-brand-blue hover:underline"
                href={`mailto:${contact.email}`}
              >
                <Mail size={18} /> {contact.email}
              </a>
              <a
                className="flex items-center gap-3 text-sm font-semibold text-brand-blue hover:underline"
                href={`tel:${contact.phone.replaceAll(" ", "")}`}
              >
                <AudioLines size={18} /> {contact.phone}
              </a>
              <p className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <MapPin className="mt-0.5 shrink-0 text-brand-blue" size={18} /> {contact.address}
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 bg-[#f8f9f6] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                Headquarters Fellowship Schedule
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li>• Sunday Worship: {contact.sundayServiceTimes}</li>
                <li>• Tuesday Bible Study: {contact.tuesdayServiceTimes}</li>
                <li>• Friday Holiness Deliverance: {contact.fridayServiceTimes}</li>
              </ul>
            </div>
          </div>

          <form
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold tracking-tight text-ink">Send a message</h2>
            <p className="mt-1 text-xs text-slate-500">
              Submit your inquiry or testimony to the ministry support team.
            </p>

            {submitted && (
              <div className="mt-4">
                <Alert icon={<Check size={18} />} severity="success">
                  Thank you! Your message has been received. Our ministry office will review your inquiry.
                </Alert>
              </div>
            )}

            <TextField
              fullWidth
              label="Your full name"
              margin="normal"
              onChange={(e) => setName(e.target.value)}
              required
              size="small"
              value={name}
            />
            <TextField
              fullWidth
              label="Email address"
              margin="normal"
              onChange={(e) => setEmail(e.target.value)}
              required
              size="small"
              type="email"
              value={email}
            />
            <TextField
              fullWidth
              label="How can we help or pray with you?"
              margin="normal"
              minRows={4}
              multiline
              onChange={(e) => setMessage(e.target.value)}
              required
              size="small"
              value={message}
            />
            <div className="mt-4">
              <Button fullWidth startIcon={<Send size={15} />} type="submit" variant="contained">
                Send Message
              </Button>
            </div>
            <p className="mt-3 text-center text-[10px] leading-5 text-slate-500">
              Your inquiry is handled with strict confidentiality by ministry administrators.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
