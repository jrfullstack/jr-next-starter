import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/es",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn() }),
}));

describe("SiteHeader", () => {
  it("links the brand to the localized home page", () => {
    renderWithIntl(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute(
      "href",
      "/es",
    );
  });

  it("includes the language and theme switchers", () => {
    renderWithIntl(<SiteHeader />);

    expect(
      screen.getByRole("button", { name: "Cambiar idioma" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cambiar tema" }),
    ).toBeInTheDocument();
  });

  it("links to the English home page in English", () => {
    renderWithIntl(<SiteHeader />, { locale: "en" });

    expect(screen.getByRole("link", { name: "Go to home" })).toHaveAttribute(
      "href",
      "/en",
    );
  });
});
