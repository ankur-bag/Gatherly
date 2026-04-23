import { FiCheckCircle, FiInfo } from "react-icons/fi";
import { FeedbackState, PublicStatus, RegistrationFormState } from "./types";

interface PublicRegistrationSectionProps {
  publicStatus: PublicStatus;
  registered: boolean;
  registering: boolean;
  formData: RegistrationFormState;
  feedback: FeedbackState | null;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function statusMessage(status: PublicStatus): string {
  if (status === "Cancelled")
    return "This event has been cancelled by the organizer.";
  if (status === "Closed") return "This event has already ended.";
  if (status === "Full") return "This event is currently full.";
  return "Registration is not available at this moment.";
}

export function PublicRegistrationSection({
  publicStatus,
  registered,
  registering,
  formData,
  feedback,
  onNameChange,
  onEmailChange,
  onSubmit,
}: PublicRegistrationSectionProps) {
  if (registered) {
    return (
      <section className="rounded-xl border border-[#bbf7d0]/50 bg-[#e8f5ef] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <FiCheckCircle className="mt-0.5 text-[#2d9d6a]" size={24} />
          <div>
            <h2
              className="text-xl font-bold text-[#1d7d4f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Registration received
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#1d7d4f]/80">
              {feedback?.message ||
                "Please check your email for your event confirmation and updates."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (publicStatus !== "Open") {
    return (
      <section className="rounded-xl border border-[#fde68a]/50 bg-[#fef7e6] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <FiInfo className="mt-0.5 text-[#d4910a]" size={24} />
          <div>
            <h2
              className="text-xl font-bold text-[#92640a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Event unavailble
            </h2>
            <p className="mt-2 font-medium text-[#92640a]/80">
              {statusMessage(publicStatus)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-[#e5e5df] bg-[#fafaf7] px-4 py-3 text-[#262626] transition-all hover:bg-white focus:border-[#FF7F11] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/20";

  return (
    <section className="rounded-xl border border-[#e5e5df] bg-white p-6 shadow-sm md:p-8 lg:p-10">
      <h2
        className="text-2xl font-bold text-[#262626]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Register for this event
      </h2>
      <p className="mt-2 text-sm text-[#737370]">
        Fill out your details below to save your seat.
      </p>

      {feedback?.kind === "error" && (
        <div className="mt-5 rounded-lg border border-[#fca5a5] bg-[#fde8e8] px-4 py-3 text-sm font-medium text-[#c53030]">
          {feedback.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="attendeeName"
            className="mb-2 block text-sm font-semibold text-[#545451]"
          >
            Full name *
          </label>
          <input
            id="attendeeName"
            type="text"
            required
            value={formData.attendeeName}
            onChange={(event) => onNameChange(event.target.value)}
            className={inputClasses}
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="attendeeEmail"
            className="mb-2 block text-sm font-semibold text-[#545451]"
          >
            Email address *
          </label>
          <input
            id="attendeeEmail"
            type="email"
            required
            value={formData.attendeeEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            className={inputClasses}
            placeholder="jane@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={registering}
          className="mt-2 w-full rounded-lg bg-[#FF7F11] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[#e67210] hover:shadow-md disabled:opacity-50"
        >
          {registering ? "Submitting registration..." : "Register now"}
        </button>
      </form>
    </section>
  );
}
