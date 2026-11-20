import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DevotionalPage from "./DevotionalPage";

vi.mock("../lib/devotionalApi", () => ({
  fetchTodayDevotional: vi.fn().mockResolvedValue(null),
  fetchDevotional: vi.fn().mockResolvedValue(null),
}));

afterEach(cleanup);

describe("DevotionalPage", () => {
  it("shows today's devotional without date navigation, style, or share controls", async () => {
    render(<DevotionalPage />);

    expect(await screen.findByText(/please check back later/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous day/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next day/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /share devotional/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/reading style/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/select devotional date/i)).not.toBeInTheDocument();
  });
});
