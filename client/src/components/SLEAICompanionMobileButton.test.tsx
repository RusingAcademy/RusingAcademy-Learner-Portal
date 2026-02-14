import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SLEAICompanionMobileButton from "./SLEAICompanionMobileButton";

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("SLEAICompanionMobileButton", () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    mockMatchMedia(true); // Default to mobile view
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the mobile button with correct accessibility attributes", () => {
    render(<SLEAICompanionMobileButton />);
    
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    expect(button).toBeDefined();
    expect(button.getAttribute("title")).toBe("Chat with our AI coaches for SLE preparation help");
    expect(button.getAttribute("aria-label")).toBe("SLE AI Companion - Click to start a conversation with our AI coaches");
  });

  it("dispatches openSLEAICompanion event when clicked", () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    
    render(<SLEAICompanionMobileButton />);
    
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    fireEvent.click(button);
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "openSLEAICompanion",
      })
    );
  });

  it("has lg:hidden class to hide on desktop", () => {
    render(<SLEAICompanionMobileButton />);
    
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    expect(button.className).toContain("lg:hidden");
  });

  it("has fixed positioning for floating effect", () => {
    render(<SLEAICompanionMobileButton />);
    
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    expect(button.className).toContain("fixed");
    expect(button.className).toContain("bottom-6");
    expect(button.className).toContain("right-6");
  });

  it("has online indicator", () => {
    render(<SLEAICompanionMobileButton />);
    
    // The online indicator is a span with bg-green-500
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    const onlineIndicator = button.querySelector(".bg-green-500");
    expect(onlineIndicator).toBeDefined();
  });

  it("has breathing animation class", () => {
    render(<SLEAICompanionMobileButton />);
    
    const button = screen.getByRole("button", { name: /SLE AI Companion/i });
    // Check for animation-related classes
    expect(button.className).toContain("animate-");
  });
});
