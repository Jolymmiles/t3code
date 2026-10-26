import { ProviderDriverKind, type ProviderOptionDescriptor } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";
import { buildTraitsTriggerDisplay } from "./modelTraits.ts";

const effort = (currentValue: string): ProviderOptionDescriptor => ({
  id: "reasoningEffort",
  label: "Reasoning",
  type: "select",
  currentValue,
  options: ["low", "medium", "high", "xhigh", "max", "ultrathink"].map((id) => ({
    id,
    label: id,
    ...(id === "low" ? { isDefault: true } : {}),
  })),
  promptInjectedValues: ["ultrathink"],
});

const serviceTier = (currentValue: string): ProviderOptionDescriptor => ({
  id: "serviceTier",
  label: "Service Tier",
  type: "select",
  currentValue,
  options: [
    { id: "default", label: "Standard", isDefault: true },
    { id: "priority", label: "Fast" },
    { id: "ultra", label: "Ultrafast" },
  ],
});

describe("buildTraitsTriggerDisplay gauge", () => {
  it("places the selected reasoning level among all levels and reads the speed tier", () => {
    const { label, gauge } = buildTraitsTriggerDisplay({
      provider: ProviderDriverKind.make("codex"),
      descriptors: [effort("xhigh"), serviceTier("ultra")],
      primarySelectDescriptorId: "reasoningEffort",
      ultrathinkPromptControlled: false,
    });
    expect(label).toBe("xhigh Ultrafast");
    expect(gauge).toEqual({ reasoning: { level: 3, levels: 6 }, speed: "ultrafast" });
  });

  it("puts a prompt-controlled Ultrathink at its own level", () => {
    const { gauge } = buildTraitsTriggerDisplay({
      provider: ProviderDriverKind.make("claudeAgent"),
      descriptors: [
        effort("medium"),
        { id: "fastMode", label: "Fast Mode", type: "boolean", currentValue: true },
      ],
      primarySelectDescriptorId: "reasoningEffort",
      ultrathinkPromptControlled: true,
    });
    expect(gauge).toEqual({ reasoning: { level: 5, levels: 6 }, speed: "fast" });
  });

  it("has no reasoning level when the model offers none", () => {
    const { gauge } = buildTraitsTriggerDisplay({
      provider: ProviderDriverKind.make("codex"),
      descriptors: [serviceTier("default")],
      primarySelectDescriptorId: "serviceTier",
      ultrathinkPromptControlled: false,
    });
    expect(gauge).toEqual({ reasoning: null, speed: null });
  });
});
