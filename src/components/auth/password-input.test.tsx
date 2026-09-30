import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("toggles between hidden and visible text", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PasswordInput aria-label="Contraseña" />);
    const input = screen.getByLabelText("Contraseña", { exact: true });
    const toggle = screen.getByRole("button", { name: "Mostrar contraseña" });

    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
  });
});
