import { describe, it, expect } from "vitest";
import {
  JoblResumeSchema,
  validateResume,
  validatePartial,
  emptyResume,
} from "./index.js";

const validFull = {
  jobl_version: "0.1.0",
  person: {
    name: "Jake Goldsborough",
    headline: "Infrastructure Engineer",
    location: "United States",
    email: "jake@example.com",
    website: "https://jakegoldsborough.com",
    phone: "+1-555-0100",
    summary: "Backend systems and deployment automation.",
  },
  skills: {
    languages: ["Ruby", "JavaScript", "Rust"],
    devops: ["Docker", "Nix", "systemd"],
  },
  experience: [
    {
      title: "Software Engineer",
      company: "Discourse",
      location: "Remote",
      start: "2020-01",
      end: "present",
      summary: "Infrastructure team.",
      technologies: ["Ruby", "Docker"],
      highlights: ["Improved deploy pipeline"],
    },
  ],
  projects: [
    {
      name: "Scrob",
      url: "https://github.com/ducks/scrob",
      summary: "Self-hosted scrobbling server.",
      role: "Creator",
      start: "2023-06",
      technologies: ["Rust", "Axum"],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. Computer Science",
      location: "Somewhere, US",
      start: "2012-08",
      end: "2016-05",
      details: ["Dean's List"],
    },
  ],
};

const validMinimal = {
  jobl_version: "0.1.0",
  person: { name: "Ada Lovelace" },
};

describe("JoblResumeSchema", () => {
  it("accepts a full valid resume", () => {
    const result = JoblResumeSchema.safeParse(validFull);
    expect(result.success).toBe(true);
  });

  it("accepts a minimal valid resume", () => {
    const result = JoblResumeSchema.safeParse(validMinimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing jobl_version", () => {
    const result = JoblResumeSchema.safeParse({
      person: { name: "Test" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing person", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty person name", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "Test", email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "Test" },
      experience: [
        {
          title: "Dev",
          company: "Co",
          start: "January 2020",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts 'present' as end date", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "Test" },
      experience: [
        {
          title: "Dev",
          company: "Co",
          start: "2020-01",
          end: "present",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects experience entry missing required fields", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "Test" },
      experience: [{ title: "Dev" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string values in skills arrays", () => {
    const result = JoblResumeSchema.safeParse({
      jobl_version: "0.1.0",
      person: { name: "Test" },
      skills: { languages: [1, 2, 3] },
    });
    expect(result.success).toBe(false);
  });
});

describe("validateResume", () => {
  it("returns success with data for valid input", () => {
    const result = validateResume(validFull);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.person.name).toBe("Jake Goldsborough");
    }
  });

  it("returns flat errors for invalid input", () => {
    const result = validateResume({
      person: { name: "" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      for (const err of result.errors) {
        expect(err).toHaveProperty("path");
        expect(err).toHaveProperty("message");
        expect(typeof err.path).toBe("string");
        expect(typeof err.message).toBe("string");
      }
    }
  });

  it("includes dotted path for nested errors", () => {
    const result = validateResume({
      jobl_version: "0.1.0",
      person: { name: "Test", email: "bad" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.errors.find(
        (e) => e.path === "person.email"
      );
      expect(emailError).toBeDefined();
    }
  });
});

describe("validatePartial", () => {
  it("accepts an empty object", () => {
    const result = validatePartial({});
    expect(result.success).toBe(true);
  });

  it("accepts a resume with only person", () => {
    const result = validatePartial({
      person: { name: "Test" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a resume with only jobl_version", () => {
    const result = validatePartial({
      jobl_version: "0.1.0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects completely invalid data types", () => {
    const result = validatePartial("not an object");
    expect(result.success).toBe(false);
  });
});

describe("emptyResume", () => {
  it("returns a valid structure", () => {
    const resume = emptyResume();
    expect(resume.jobl_version).toBe("0.1.0");
    expect(resume.person.name).toBe("");
  });

  it("passes partial validation", () => {
    const result = validatePartial(emptyResume());
    expect(result.success).toBe(true);
  });
});
