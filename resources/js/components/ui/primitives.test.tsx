import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it} from "vitest";

import {Accordion, AccordionItem} from "@/components/ui/accordion";
import {CloseButton} from "@/components/ui/close-button";
import {Field} from "@/components/ui/field";
import {Checkbox, Input} from "@/components/ui/form-controls";

describe("accessible UI primitives", () => {
  it("gives an icon-only close action a specific accessible name", () => {
    render(<CloseButton label="Close leaf details"/>);
    expect(
        screen.getByRole("button", {name: "Close leaf details"}),
    ).toBeInTheDocument();
  });

  it("associates field label, description, error, and invalid state", () => {
    render(
        <Field
            description="Use an approved contact address."
            descriptionId="email-description"
            error="Email is required."
            errorId="email-error"
            htmlFor="email"
            label="Email"
            required
        >
          <Input
              aria-describedby="email-description email-error"
              aria-invalid="true"
              id="email"
              type="email"
          />
        </Field>,
    );

    const input = screen.getByRole("textbox", {name: "Email (required)"});
    expect(input).toHaveAttribute(
        "aria-describedby",
        "email-description email-error",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("associates a checkbox with its required stable identifier", () => {
    render(<Checkbox id="updates" label="Project updates"/>);
    expect(
        screen.getByRole("checkbox", {name: "Project updates"}),
    ).toHaveAttribute("id", "updates");
  });

  it("toggles accordion content with a native button", async () => {
    const user = userEvent.setup();
    render(
        <Accordion>
          <AccordionItem title="Foundation question">
            <p>Foundation answer.</p>
          </AccordionItem>
        </Accordion>,
    );

    const trigger = screen.getByRole("button", {name: "Foundation question"});
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Foundation answer.")).toBeVisible();
  });
});
