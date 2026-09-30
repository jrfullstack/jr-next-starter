import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthFormSkeleton } from "./auth-skeletons";

describe("AuthFormSkeleton", () => {
  // Regression: a <div> skeleton inside the footer <p> broke hydration
  it("keeps block elements out of paragraphs", () => {
    const { container } = render(
      <AuthFormSkeleton title="Title" description="Description" fields={2} />,
    );
    expect(container.querySelector("p div")).toBeNull();
  });
});
