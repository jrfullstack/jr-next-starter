import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { ModeToggle } from "./mode-toggle";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme }),
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it("renders an accessible trigger button", () => {
    renderWithIntl(<ModeToggle />);

    expect(
      screen.getByRole("button", { name: "Cambiar tema" }),
    ).toBeInTheDocument();
  });

  it("is translated to English", () => {
    renderWithIntl(<ModeToggle />, { locale: "en" });

    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["Claro", "light"],
    ["Oscuro", "dark"],
    ["Sistema", "system"],
  ])("selecting %s sets the %s theme", async (label, theme) => {
    const user = userEvent.setup();
    renderWithIntl(<ModeToggle />);

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    await user.click(await screen.findByRole("menuitem", { name: label }));

    expect(setTheme).toHaveBeenCalledWith(theme);
  });
});
