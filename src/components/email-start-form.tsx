import { type SubmitEvent } from "react";
import { RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { tagged } from "@/lib/site";

// Hands the email to the Opesi Mansion get started stepper in the URL fragment, which browsers
// never send to servers. The stepper reads it, preselects Fleet Intelligence, and clears the fragment.
export function EmailStartForm({ label = "Early Access", placement }: { label?: string; placement: string }) {
  const action = tagged("https://www.opesimansion.com/get-started", placement);
  const startFlow = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const email = String(new FormData(form).get("email") ?? "").trim();
    window.location.assign(`${action}#${new URLSearchParams({ email, solution: "fleet" })}`);
  };

  return (
    <form action={action} method="get" onSubmit={startFlow} aria-label={label} className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
      <label className="relative block h-11 flex-1 rounded-xl border border-input bg-card">
        <span className="sr-only">Work email (required)</span>
        <input name="email" type="email" autoComplete="email" placeholder="Work email *" required maxLength={254} className="h-full w-full min-w-0 rounded-xl bg-transparent px-4 text-base text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30" />
      </label>
      <Button type="submit" size="lg" className="min-h-11 w-fit rounded-full px-6">
        {label}
        <RiArrowRightLine aria-hidden="true" />
      </Button>
    </form>
  );
}
