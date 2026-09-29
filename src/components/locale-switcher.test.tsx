import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { LocaleSwitcher } from "./locale-switcher";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/about",
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("renders an accessible trigger button", () => {
    renderWithIntl(<LocaleSwitcher />);

    expect(
      screen.getByRole("button", { name: "Cambiar idioma" }),
    ).toBeInTheDocument();
  });

  it("lists every locale by its own name and marks the active one", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LocaleSwitcher />);

    await user.click(screen.getByRole("button", { name: "Cambiar idioma" }));

    expect(
      await screen.findByRole("menuitemradio", { name: "Español" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "English" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("keeps the current page when switching locale", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LocaleSwitcher />);

    await user.click(screen.getByRole("button", { name: "Cambiar idioma" }));
    await user.click(
      await screen.findByRole("menuitemradio", { name: "English" }),
    );

    expect(replace).toHaveBeenCalledWith("/about", { locale: "en" });
  });
});
