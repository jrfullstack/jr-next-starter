import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { LocaleSwitcher } from "./locale-switcher";

const replace = vi.fn();
const usePathname = vi.fn(() => "/about");

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => usePathname(),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    replace.mockClear();
    usePathname.mockClear();
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

  // Regression: reading the path while the header renders on the server held
  // up Cache Components' validation of every page (dev overlay error)
  it("doesn't read the current path until the menu opens", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LocaleSwitcher />);
    expect(usePathname).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cambiar idioma" }));
    await screen.findByRole("menuitemradio", { name: "English" });
    expect(usePathname).toHaveBeenCalled();
  });
});
