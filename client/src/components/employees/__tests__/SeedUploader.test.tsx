import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeedUploader } from "../SeedUploader";

function renderComponent() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <SeedUploader onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("SeedUploader", () => {
  it("should render format selection step first", () => {
    renderComponent();

    expect(screen.getByText(/choose file format/i)).toBeInTheDocument();
  });

  it("should render all 4 format options", () => {
    renderComponent();

    expect(screen.getByText("TXT")).toBeInTheDocument();
    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
    expect(screen.getByText("Excel")).toBeInTheDocument();
  });

  it("should show TXT type step after selecting TXT", () => {
    renderComponent();

    fireEvent.click(screen.getByText("TXT"));

    expect(screen.getByText(/choose txt type/i)).toBeInTheDocument();
  });

  it("should show upload step after selecting TXT pair format", () => {
    renderComponent();

    fireEvent.click(screen.getByText("TXT"));
    fireEvent.click(screen.getByText(/two name files/i));

    expect(screen.getByText(/upload name files/i)).toBeInTheDocument();
  });

  it("should show start over button after selecting format", () => {
    renderComponent();

    fireEvent.click(screen.getByText("CSV"));

    expect(screen.getByText(/start over/i)).toBeInTheDocument();
  });

  it("should go back to format selection on start over click", () => {
    renderComponent();

    fireEvent.click(screen.getByText("CSV"));
    fireEvent.click(screen.getByText(/start over/i));

    expect(screen.getByText(/choose file format/i)).toBeInTheDocument();
  });

  it("should call onClose when cancel is clicked", () => {
    const onClose = vi.fn();

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <SeedUploader onClose={onClose} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByText(/cancel/i));

    expect(onClose).toHaveBeenCalled();
  });

  it("should show disabled seed button initially", () => {
    renderComponent();

    const seedButton = screen.getByRole("button", {
      name: /seed/i,
    });

    expect(seedButton).toBeDisabled();
  });

  it("should show max records note in header", () => {
    renderComponent();

    expect(screen.getByText(/up to 15,000 records/i)).toBeInTheDocument();
  });
});
