import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the current year and the author", () => {
    vi.useFakeTimers({ now: new Date("2030-05-01") });
    renderWithIntl(<SiteFooter />);

    expect(screen.getByText("© 2030 JR Next Starter")).toBeInTheDocument();
    expect(screen.getByText("Hecho por Jimmy Reyes")).toBeInTheDocument();
  });

  it("is translated to English", () => {
    renderWithIntl(<SiteFooter />, { locale: "en" });

    expect(screen.getByText("Made by Jimmy Reyes")).toBeInTheDocument();
  });
});
