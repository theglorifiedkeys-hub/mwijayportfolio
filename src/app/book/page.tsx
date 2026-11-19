"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "./brief.css";
import {
  Globe,
  Palette,
  Bot,
  Server,
  CheckCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import CookieConsent from "@/components/ui/cookie-consent";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { generateInquiryId } from "@/lib/order-utils";
import { trackEvent } from "@/lib/analytics";
import { emailHelpers } from "@/lib/send-email-client";
import { validateEmail, validatePhone } from "@/lib/sanitize";
import { Footer } from "@/components/footer";

import Link from "next/link";
import BasicSignaturePad from "@/components/ui/signature-pad";

const SERVICE_CARDS = [
  {
    id: "web_development",
    title: "Web Systems",
    desc: "Custom apps, e-commerce, and admin portals.",
    icon: Globe,
  },
  {
    id: "design_branding",
    title: "Visual Identity",
    desc: "Logos, brand guides, and UI/UX systems.",
    icon: Palette,
  },
  {
    id: "ai_automation",
    title: "AI & Automation",
    desc: "Intelligent workflows and custom chatbots.",
    icon: Bot,
  },
  {
    id: "content_production",
    title: "Content production",
    desc: "Video, audio and photography.",
    icon: MessageSquare,
  },
  {
    id: "hosting_maintenance",
    title: "Maintenance",
    desc: "Cloud infrastructure and site management.",
    icon: Server,
  },
];

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inquiryId, setInquiryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transmissionError, setTransmissionError] = useState(false);
  const db = useFirestore();

  const [formData, setFormData] = useState({
    services: [] as string[],
    projectName: "",
    description: "",
    timeline: "standard",
    budgetRange: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    agreedToTerms: false,
    signatureDataUri: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    setInquiryId(generateInquiryId());

    const servicesParam = searchParams.get("services");
    const projectParam = searchParams.get("projectName");
    const descParam = searchParams.get("description");
    const budgetParam = searchParams.get("budgetRange");
    const timelineParam = searchParams.get("timeline");

    const validServices = SERVICE_CARDS.filter((s) =>
      servicesParam?.split(",").includes(s.id),
    ).map((s) => s.id);
    if (
      servicesParam ||
      projectParam ||
      descParam ||
      budgetParam ||
      timelineParam
    ) {
      setFormData((prev) => ({
        ...prev,
        services: servicesParam ? validServices : prev.services,
        projectName: projectParam || prev.projectName,
        description: descParam || prev.description,
        budgetRange: budgetParam || prev.budgetRange,
        timeline: (timelineParam as any) || prev.timeline,
      }));
      // Jump directly to specifications details step
      setCurrentStep(validServices.length ? 2 : 1);
    }
  }, [searchParams]);

  const isTrashInput = (text: string) => {
    if (text.length < 5) return false;
    const consecutiveConsonants = text.match(/[^aeiou\s]{6,}/gi);
    return !!consecutiveConsonants;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1 && formData.services.length === 0)
      newErrors.service = "Choose at least one service.";
    if (currentStep === 2) {
      if (!formData.projectName)
        newErrors.projectName = "Project name is required.";
      if (isTrashInput(formData.projectName))
        newErrors.projectName = "Please check the project name.";
      if (formData.description.length < 10)
        newErrors.description =
          "Please provide a short description (min 10 chars).";
      if (!formData.budgetRange)
        newErrors.budgetRange = "Choose a budget range.";
    }
    if (currentStep === 3) {
      if (!formData.clientName) newErrors.clientName = "Your name is required.";
      if (isTrashInput(formData.clientName))
        newErrors.clientName = "Please check your name.";
      if (!validateEmail(formData.clientEmail))
        newErrors.clientEmail = "Enter a valid email address.";
      if (!validatePhone(formData.clientPhone))
        newErrors.clientPhone = "Valid TZ phone required.";
    }
    if (currentStep === 4) {
      if (!formData.agreedToTerms)
        newErrors.agreedToTerms = "You must accept the terms.";
      if (!formData.signatureDataUri)
        newErrors.signatureDataUri = "Signature required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep() || isSubmitting) return;
    if (!db) {
      setTransmissionError(true);
      return;
    }
    setIsSubmitting(true);
    setTransmissionError(false);
    try {
      const servicesString = formData.services.join(", ");
      await addDoc(collection(db, "project_inquiries"), {
        ...formData,
        service: servicesString,
        inquiryId,
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: "",
        ipAddress: "logged",
      });

      trackEvent("submit_inquiry_system", "conversion", servicesString);

      const submittedAt = new Date().toLocaleString("en-TZ", {
        timeZone: "Africa/Dar_es_Salaam",
      });

      emailHelpers.notifyInquiry({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientMessage: `NEW BUILD REQUEST [${inquiryId}]\nProject: ${formData.projectName}\nServices: ${servicesString}\nTimeline: ${formData.timeline}\nBudget: ${formData.budgetRange}\nDescription: ${formData.description}`,
        submittedAt,
      });

      setIsSubmitted(true);
    } catch (err) {
      setTransmissionError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Services", "Project", "Contact", "Review"];
  const fieldError = (key: string) =>
    errors[key] ? (
      <span className="brief-error" role="alert">
        {errors[key]}
      </span>
    ) : null;
  const field = (
    key:
      | "projectName"
      | "clientName"
      | "clientEmail"
      | "clientPhone"
      | "clientCompany",
    label: string,
    placeholder: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <label className="brief-field">
      {label}
      <input
        type={type}
        autoComplete={autoComplete}
        value={formData[key]}
        placeholder={placeholder}
        aria-invalid={!!errors[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
      />
      {fieldError(key)}
    </label>
  );
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const prevStep = React.useRef(currentStep);
  React.useEffect(() => {
    if (prevStep.current !== currentStep) {
      titleRef.current?.focus();
      prevStep.current = currentStep;
    }
  }, [currentStep]);
  return (
    <div className="ed brief-page">
      <main className="ed-wrap brief-layout">
        <aside className="brief-cover">
          <div className="brief-cover-copy">
            <div className="ed-kicker">
              <i /> Studio / Project enquiry
            </div>
            <h1>
              Start a<br />
              <em>project.</em>
            </h1>
            <p>
              Tell me what you’re working on. I’ll use your brief to put
              together a scope and a quote.
            </p>
          </div>
          <div className="brief-caption">
            <span>Mwijay Studio</span>
            <span>Dar es Salaam, TZ</span>
          </div>
        </aside>
        <section className="brief-sheet" aria-label="Project brief">
          <div className="brief-folio">
            <span>Project brief</span>
            <span>
              {isSubmitted ? "Complete" : `Step 0${currentStep} / 04`}
            </span>
          </div>
          {isSubmitted ? (
            <div className="brief-result" role="status">
              <CheckCircle />
              <h2>
                Brief <em>received.</em>
              </h2>
              <p>
                Thanks, {formData.clientName}. Your project reference is{" "}
                <strong>{inquiryId}</strong>. Keep it for your conversation with
                the studio.
              </p>
              <a
                className="brief-go"
                href={`https://wa.me/255620641695?text=${encodeURIComponent(`Hi Mwijay, I submitted brief ${inquiryId} for ${formData.projectName}.`)}`}
              >
                Follow up on WhatsApp ↗
              </a>
              <Link href="/">Back to portfolio</Link>
            </div>
          ) : (
            <>
              <ol className="brief-steps" aria-label="Brief progress">
                {steps.map((s, i) => (
                  <li
                    key={s}
                    aria-current={currentStep === i + 1 ? "step" : undefined}
                    data-done={currentStep > i + 1}
                  >
                    <span>0{i + 1}</span> {s}
                  </li>
                ))}
              </ol>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentStep === 4) void handleSubmit();
                  else handleNext();
                }}
              >
                <h2 ref={titleRef} tabIndex={-1}>
                  {
                    [
                      "Choose your services.",
                      "Describe your project.",
                      "Your contact details.",
                      "Review your brief.",
                    ][currentStep - 1]
                  }
                </h2>
                {currentStep === 1 && (
                  <>
                    <p>Select everything you’d like help with.</p>
                    <div className="brief-options">
                      {SERVICE_CARDS.map((s) => {
                        const chosen = formData.services.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className="brief-option"
                            data-selected={chosen}
                          >
                            <s.icon size={22} aria-hidden="true" />
                            <span>
                              <strong>{s.title}</strong>
                              <span>{s.desc}</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={chosen}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  services: chosen
                                    ? formData.services.filter(
                                        (x) => x !== s.id,
                                      )
                                    : [...formData.services, s.id],
                                })
                              }
                            />
                          </label>
                        );
                      })}
                    </div>
                    {fieldError("service")}
                  </>
                )}
                {currentStep === 2 && (
                  <div className="brief-fields">
                    {field(
                      "projectName",
                      "Project name",
                      "e.g. AymiAfrica Portal",
                    )}
                    <label className="brief-field">
                      What do you want to build?
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Who is it for, and what should it help them do?"
                      />
                      {fieldError("description")}
                    </label>
                    <div className="brief-pair">
                      <label className="brief-field">
                        Timeline
                        <select
                          value={formData.timeline}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timeline: e.target.value,
                            })
                          }
                        >
                          {["urgent", "standard", "flexible"].map((t) => (
                            <option key={t} value={t}>
                              {t[0].toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="brief-field">
                        Budget (TZS)
                        <select
                          value={formData.budgetRange}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budgetRange: e.target.value,
                            })
                          }
                        >
                          <option value="">Choose a range</option>
                          {[
                            ["250k-500k", "250,000 – 500,000"],
                            ["500k-1m", "500,000 – 1,000,000"],
                            ["1m-2m", "1,000,000 – 2,000,000"],
                            ["2m+", "2,000,000+"],
                          ].map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                        {fieldError("budgetRange")}
                      </label>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="brief-fields">
                    {field(
                      "clientName",
                      "Full name",
                      "Amina Hassan",
                      "text",
                      "name",
                    )}
                    {field(
                      "clientEmail",
                      "Email address",
                      "amina@example.com",
                      "email",
                      "email",
                    )}
                    {field(
                      "clientPhone",
                      "WhatsApp or phone (Tanzania)",
                      "+255…",
                      "tel",
                      "tel",
                    )}
                    {field(
                      "clientCompany",
                      "Organisation (optional)",
                      "Company or team",
                      "text",
                      "organization",
                    )}
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="brief-fields">
                    <div className="brief-summary">
                      <strong>{formData.projectName}</strong>
                      <p>
                        {SERVICE_CARDS.filter((s) =>
                          formData.services.includes(s.id),
                        )
                          .map((s) => s.title)
                          .join(" · ")}
                      </p>
                      <p>
                        {formData.clientEmail} · {formData.budgetRange} TZS
                      </p>
                    </div>
                    <div>
                      <h3>Service terms</h3>
                      <ul className="brief-terms">
                        <li>
                          Estimates are preliminary until final scope approval.
                        </li>
                        <li>A 50% deposit is required to start the build.</li>
                        <li>
                          Intellectual property transfers after full payment.
                        </li>
                        <li>
                          Domain and hosting stay with the provider until fully
                          paid.
                        </li>
                      </ul>
                      <Link href="/terms" target="_blank">
                        Full terms ↗
                      </Link>{" "}
                      ·{" "}
                      <Link href="/privacy" target="_blank">
                        Privacy policy ↗
                      </Link>
                    </div>
                    <label className="brief-agree">
                      <input
                        type="checkbox"
                        checked={formData.agreedToTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agreedToTerms: e.target.checked,
                          })
                        }
                      />{" "}
                      I agree to the project terms.
                    </label>
                    {fieldError("agreedToTerms")}
                    <BasicSignaturePad
                      className="brief-signature"
                      onDrawEnd={(uri) =>
                        setFormData((prev) => ({
                          ...prev,
                          signatureDataUri: uri,
                        }))
                      }
                    />
                    {fieldError("signatureDataUri")}
                  </div>
                )}
                {transmissionError && (
                  <p className="brief-error" role="alert">
                    Your brief hasn’t been sent. Try again or{" "}
                    <a href="https://wa.me/255620641695">
                      contact the studio on WhatsApp
                    </a>
                    .
                  </p>
                )}
                <div className="brief-actions">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        handleBack();
                        setErrors({});
                        setTransmissionError(false);
                      }}
                    >
                      ← Back
                    </button>
                  ) : (
                    <span>{formData.services.length} selected</span>
                  )}
                  <button className="brief-go" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Sending…"
                      : currentStep === 4
                        ? "Send project brief"
                        : `Continue to ${steps[currentStep].toLowerCase()}`}{" "}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
      <CookieConsent inline />
      <Footer />
    </div>
  );
}
export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <p className="brief-loading" role="status">
          Opening project brief…
        </p>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
