import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EcosystemHeaderGold from "./EcosystemHeaderGold";

// Mock the useAuth hook
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

// Mock wouter
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Wrapper component with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("EcosystemHeaderGold Accessibility", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Tooltips", () => {
    it("has tooltip on home button", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const homeLink = screen.getByRole("link", { name: /go to homepage/i });
      expect(homeLink).toBeDefined();
      expect(homeLink.getAttribute("title")).toBe("Return to homepage");
    });

    it("has tooltip on language switcher button", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const langButton = screen.getByRole("button", { name: /switch to french|changer la langue/i });
      expect(langButton).toBeDefined();
      // Title should indicate the language switch action
      const title = langButton.getAttribute("title");
      expect(title).toMatch(/changer la langue|change language/i);
    });

    it("has tooltip on login button", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const loginLink = screen.getByRole("link", { name: /login to your account/i });
      expect(loginLink).toBeDefined();
      expect(loginLink.getAttribute("title")).toBe("Sign in to your account");
    });

    it("has tooltip on mobile menu button", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toBeDefined();
      expect(menuButton.getAttribute("title")).toBe("Open menu");
    });
  });

  describe("ARIA Labels", () => {
    it("has aria-label on main navigation", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const nav = screen.getByRole("navigation", { name: /ecosystem navigation/i });
      expect(nav).toBeDefined();
    });

    it("has aria-label on mobile navigation", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
      expect(mobileNav).toBeDefined();
    });

    it("has aria-hidden on decorative icons", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      // Check that SVG icons have aria-hidden
      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Brand Cards", () => {
    it("has tooltips on brand cards", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const rusingLink = screen.getByRole("link", { name: /go to rusingâcademy/i });
      expect(rusingLink).toBeDefined();
      expect(rusingLink.getAttribute("title")).toBe("Explore RusingÂcademy");

      const lingueefyLink = screen.getByRole("link", { name: /go to lingueefy/i });
      expect(lingueefyLink).toBeDefined();
      expect(lingueefyLink.getAttribute("title")).toBe("Explore Lingueefy");

      const barholexLink = screen.getByRole("link", { name: /go to barholex media/i });
      expect(barholexLink).toBeDefined();
      expect(barholexLink.getAttribute("title")).toBe("Explore Barholex Media");
    });
  });

  describe("SLE AI Companion Widget", () => {
    it("has tooltip on SLE AI Companion button", () => {
      renderWithRouter(<EcosystemHeaderGold />);
      
      const widgetButton = screen.getByRole("button", { name: /sle ai companion/i });
      expect(widgetButton).toBeDefined();
      expect(widgetButton.getAttribute("title")).toBe("Chat with our AI coaches for SLE preparation help");
    });
  });
});
