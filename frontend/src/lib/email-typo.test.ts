import { describe, expect, it } from "vitest";
import { suggestEmail } from "./email-typo";

describe("suggestEmail", () => {
  it("suggests gmail.com for gmial.com (spec scenario)", () => {
    expect(suggestEmail("mette@gmial.com")).toBe("mette@gmail.com");
  });

  it("suggests hotmail.dk for hotmial.dk", () => {
    expect(suggestEmail("mette@hotmial.dk")).toBe("mette@hotmail.dk");
  });

  it("stays quiet for a correct common domain", () => {
    expect(suggestEmail("mette@gmail.com")).toBeNull();
  });

  it("stays quiet for an unknown domain far from any common one", () => {
    expect(suggestEmail("mette@blomster-holbaek.dk")).toBeNull();
  });

  it("stays quiet without a domain", () => {
    expect(suggestEmail("mette")).toBeNull();
  });
});
