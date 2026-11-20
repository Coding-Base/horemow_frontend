import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminEventsManager from "../admin/AdminEventsManager";
import HomepageAnnouncementModal from "./HomepageAnnouncementModal";
import {
  getHomepageAnnouncement,
  resetHomepageAnnouncement,
  saveHomepageAnnouncement,
} from "../../lib/contentStore";

vi.mock("../../lib/homepageAnnouncementApi", () => ({
  fetchHomepageAnnouncement: vi.fn(),
  isHomepageAnnouncementApiConfigured: false,
  saveHomepageAnnouncementToApi: vi.fn(),
}));

afterEach(() => {
  cleanup();
  resetHomepageAnnouncement();
  sessionStorage.clear();
});

describe("homepage announcement", () => {
  it("shows enabled updates, then remembers dismissal for the current version", async () => {
    saveHomepageAnnouncement({
      enabled: true,
      eyebrow: "Ministry news",
      title: "A new conference update",
      message: "Registration details are now available.",
      imageUrl: "",
      actionLabel: "View schedule",
      actionUrl: "/events",
      updatedAt: "version-1",
    });

    const renderModal = () =>
      render(
        <MemoryRouter>
          <HomepageAnnouncementModal />
        </MemoryRouter>,
      );

    const firstRender = renderModal();
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A new conference update" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view schedule/i })).toHaveAttribute("href", "/events");

    fireEvent.click(screen.getByRole("button", { name: /close announcement/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    firstRender.unmount();

    renderModal();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets administrators configure and publish an update from Events", async () => {
    render(<AdminEventsManager />);

    fireEvent.click(screen.getByRole("button", { name: /configure homepage update/i }));
    fireEvent.click(screen.getByRole("switch", { name: /show popup on homepage/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /update headline/i }), {
      target: { value: "Camp registration is open" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /announcement message/i }), {
      target: { value: "Register for the upcoming conference." },
    });
    fireEvent.click(screen.getByRole("button", { name: /save homepage update/i }));

    await waitFor(() => {
      expect(getHomepageAnnouncement()).toMatchObject({
        enabled: true,
        title: "Camp registration is open",
        message: "Register for the upcoming conference.",
      });
    });
  });
});
