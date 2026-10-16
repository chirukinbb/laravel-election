import {useState} from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {HomeLanguage} from "@/features/home/copy";
import {NominationForm} from "./nomination-form";
import {emptyNominationDraft, type NominationDraft,} from "./nomination-validation";
import {getProfileCopy} from "./profile-copy";

function completeDraft(): NominationDraft {
  return {
    ...emptyNominationDraft(),
    firstName: " Mira ",
    lastName: " Vale ",
    country: "BR",
    city: "São Paulo",
    activity: "Community gardener",
    reason:
      "A fictional gardener helps neighbours create accessible community gardens, share seeds and learn together. ".repeat(
        4,
      ),
  };
}

function Harness({
  initial = emptyNominationDraft(),
  language = "en",
  onReview,
}: {
  readonly initial?: NominationDraft;
  readonly language?: HomeLanguage;
  readonly onReview: (draft: NominationDraft) => void;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <NominationForm
      language={language}
      value={draft}
      onChange={setDraft}
      onReview={onReview}
    />
  );
}

describe("NominationForm", () => {
  it("provides every country, validates the minimum reason and focuses the first missing field", () => {
    const review = vi.fn();
    const { container } = render(<Harness onReview={review} />);
    expect(screen.getAllByRole("option")).toHaveLength(196);
    fireEvent.click(screen.getByRole("button", { name: /Review nomination/ }));
    expect(review).not.toHaveBeenCalled();
    expect(screen.getByLabelText("First name")).toHaveFocus();
    expect(container.querySelector('[name="reason"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByText(getProfileCopy("en").errors.reasonLength),
    ).toBeInTheDocument();
  });

  it("reviews a trimmed draft and counts Unicode code points instead of UTF-16 units", () => {
    const review = vi.fn();
    const draft = {
      ...completeDraft(),
      reason: "🌿".repeat(300),
      nominatorName: "Private person",
    };
    render(<Harness initial={draft} onReview={review} />);
    expect(screen.getByText("300 / 1,200")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Review nomination/ }));
    expect(review).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Mira",
        lastName: "Vale",
        reason: draft.reason,
        nominatorName: "",
        contributions: [],
        links: [],
      }),
    );
  });

  it("requires explicit name consent and clears the name when consent is removed", () => {
    const review = vi.fn();
    render(<Harness initial={completeDraft()} onReview={review} />);
    expect(screen.queryByLabelText("Your name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: "  Jules Martin  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Review nomination/ }));
    expect(review).toHaveBeenLastCalledWith(
      expect.objectContaining({
        showNominator: true,
        nominatorName: "Jules Martin",
      }),
    );
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Review nomination/ }));
    expect(review).toHaveBeenLastCalledWith(
      expect.objectContaining({ showNominator: false, nominatorName: "" }),
    );
  });

  it("caps optional contributions and links at six and allows removal", async () => {
    const { container } = render(
      <Harness initial={completeDraft()} onReview={vi.fn()} />,
    );
    const addContribution = screen.getByRole("button", {
      name: /Add a contribution/,
    });
    for (let index = 0; index < 6; index++) fireEvent.click(addContribution);
    expect(addContribution).toBeDisabled();
    expect(container.querySelectorAll('[name$=".what"]')).toHaveLength(6);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove contribution 2" }),
    );
    expect(addContribution).toBeEnabled();
    expect(container.querySelectorAll('[name$=".what"]')).toHaveLength(5);
    await waitFor(() => expect(addContribution).toHaveFocus());
    const addLink = screen.getByRole("button", { name: /Add a link/ });
    for (let index = 0; index < 6; index++) fireEvent.click(addLink);
    expect(addLink).toBeDisabled();
    expect(container.querySelectorAll('[name$=".url"]')).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "Remove link 6" }));
    expect(addLink).toBeEnabled();
  });

  it("rejects unsafe links and preserves draft values when switching to Arabic", () => {
    const review = vi.fn();
    const draft = {
      ...completeDraft(),
      links: [{ label: "Public profile", url: "javascript:alert(1)" }],
    };
    const { rerender, container } = render(
      <Harness initial={draft} onReview={review} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Review nomination/ }));
    expect(review).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("Website or public profile URL"),
    ).toHaveFocus();
    rerender(<Harness language="ar" initial={draft} onReview={review} />);
    expect(container.querySelector('[name="city"]')).toHaveValue("São Paulo");
    const link = container.querySelector<HTMLInputElement>(
      '[name="links.0.url"]',
    )!;
    expect(link).toHaveAttribute("dir", "ltr");
    fireEvent.change(link, {
      target: { value: "https://example.com/profile" },
    });
    fireEvent.submit(container.querySelector("form")!);
    expect(review).toHaveBeenCalledWith(
      expect.objectContaining({
        links: [
          { label: "Public profile", url: "https://example.com/profile" },
        ],
      }),
    );
  });
});
