import { describe, expect, it } from "vitest";
import { invalidFields, resetPasswordSchema, signUpSchema } from "./schemas";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  password: "12345678",
  confirmPassword: "12345678",
};

const signUp = signUpSchema(8);

describe("signUpSchema", () => {
  it("accepts a valid sign-up", () => {
    expect(signUp.safeParse(valid).success).toBe(true);
  });

  it("flags each invalid field, including a password mismatch", () => {
    const result = signUp.safeParse({
      name: " ",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(invalidFields(result.error)).toEqual({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
  });
});

describe("resetPasswordSchema", () => {
  it("requires a password of the configured length, confirmed twice", () => {
    const schema = resetPasswordSchema(10);
    const ok = schema.safeParse({
      password: "1234567890",
      confirmPassword: "1234567890",
    });
    const tooShort = schema.safeParse({
      password: "12345678",
      confirmPassword: "12345678",
    });
    const mismatch = schema.safeParse({
      password: "1234567890",
      confirmPassword: "0987654321",
    });

    expect(ok.success).toBe(true);
    expect(tooShort.success).toBe(false);
    expect(mismatch.success).toBe(false);
  });
});
