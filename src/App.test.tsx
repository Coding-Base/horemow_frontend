import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

describe("public HOREMOW shell", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the home page, 3D gallery and primary actions without a preview banner", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /restoring/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/preview build/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /conference & crusade gallery/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /explore sermons/i })[0],
    ).toHaveAttribute("href", "/sermons");
  });

  it("plays the homepage video muted without visible video controls", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const video = screen.getByTestId("home-background-video");
    expect(video).toHaveProperty("muted", true);
    expect(video).not.toHaveAttribute("controls");
    expect(screen.queryByRole("button", { name: /unmute.*video/i })).not.toBeInTheDocument();
  });

  it("uses the muted video intro and fixed top navigation on every public page", () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <App />
      </MemoryRouter>,
    );

    const header = screen.getByTestId("public-header");
    const pageVideo = screen.getByTestId("page-intro-video");
    expect(header).toHaveClass("fixed", "top-0");
    expect(pageVideo).toHaveProperty("muted", true);
    expect(pageVideo).not.toHaveAttribute("controls");
    expect(screen.getByRole("heading", { name: /events & conferences/i })).toBeInTheDocument();
  });

  it("renders a classic searchable directory without the green verification badge", () => {
    render(
      <MemoryRouter initialEntries={["/directory"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /leadership directory/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /a directory for connection/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search leaders/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pastor paul rika/i })).toBeInTheDocument();
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
  });

  it("shows both ministry leaders in large, uncropped profile images on the about page", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /servants of the movement/i })).toBeInTheDocument();
    const pastor = screen.getByRole("img", { name: /pastor paul rika/i });
    const evangelist = screen.getByRole("img", { name: /evangelist linda paul rika/i });
    expect(pastor).toHaveClass("object-contain");
    expect(evangelist).toHaveClass("object-contain");
    expect(pastor.getAttribute("src")).toContain("cloudinary.com");
    expect(evangelist.getAttribute("src")).toContain("cloudinary.com");
    expect(screen.getByText(/founder & international director/i)).toBeInTheDocument();
    expect(screen.getByText(/international women coordinator/i)).toBeInTheDocument();
  });

  it("renders the payment checkout summary without claiming a payment has succeeded", () => {
    render(
      <MemoryRouter initialEntries={["/give"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /set up your gift/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /your contribution/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to secure checkout/i })).toBeInTheDocument();
    expect(screen.queryByText(/official donation receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/verified 256-bit ssl/i)).not.toBeInTheDocument();
  });

  it("shows image-backed event and journal previews on the homepage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /upcoming gatherings/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /from the horemow journal/i })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /horemow gathering:/i })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: /a daily walk shaped by the word/i })).toBeInTheDocument();
  });

  it("shows the public conference gallery with authentic category filtering", () => {
    render(
      <MemoryRouter initialEntries={["/gallery"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /horemow gallery/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/visual window into sacred worship, conferences, miracle crusades/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
  });

  it("provides the admin dashboard without a preview banner", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByText(/admin preview only/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/admin/gallery");
    expect(screen.queryByText("Admin portal")).not.toBeInTheDocument();
  });

  it("opens and closes the mobile admin navigation from the hamburger", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", { name: /open admin navigation/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menuButton);
    expect(screen.getByRole("button", { name: /close admin navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close admin navigation/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("link", { name: "Gallery" }));
    expect(screen.getByRole("button", { name: /open admin navigation/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("omits the extra module strip above admin manager content", () => {
    render(
      <MemoryRouter initialEntries={["/admin/content"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /homepage content manager/i })).toBeInTheDocument();
    expect(screen.getAllByText("Publishing")).toHaveLength(1);
    expect(screen.queryByText("Publishing workspace")).not.toBeInTheDocument();
  });

  it("shows a muted video-backed admin sign-in and registration experience", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <App />
      </MemoryRouter>,
    );

    const video = screen.getByTestId("admin-auth-video");
    expect(video).toHaveProperty("muted", true);
    expect(video).not.toHaveAttribute("controls");
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/administrator email/i)).toHaveValue("");
    expect(screen.queryByText(/demo credentials/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(
      await screen.findByRole("heading", { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/official email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^administrative role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password/i)).toBeInTheDocument();
  });

  it("renders the admin site content editor for homepage dynamic customization", () => {
    render(
      <MemoryRouter initialEntries={["/admin/content"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /homepage content manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/pastor name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save all sections/i })).toBeInTheDocument();
  });

  it("renders the admin gallery management tool to add new images and manage gallery", () => {
    render(
      <MemoryRouter initialEntries={["/admin/gallery"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /add new gallery photograph/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/photograph title/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to gallery/i }),
    ).toBeInTheDocument();
  });
});
