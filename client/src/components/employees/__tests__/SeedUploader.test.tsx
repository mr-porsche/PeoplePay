import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeedUploader } from "../SeedUploader";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("SeedUploader", () => {
  it("should render upload areas for both files", () => {
    render(<SeedUploader onClose={() => {}} />, { wrapper });
    expect(screen.getByText("First names file")).toBeInTheDocument();
    expect(screen.getByText("Last names file")).toBeInTheDocument();
  });

  it("should render header with description", () => {
    render(<SeedUploader onClose={() => {}} />, { wrapper });
    expect(screen.getByText("Seed Employees from Files")).toBeInTheDocument();
    expect(screen.getByText(/paired by line number/i)).toBeInTheDocument();
  });

  it("should call onClose when cancel is clicked", () => {
    const onClose = vi.fn();
    render(<SeedUploader onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should disable seed button when no files loaded", () => {
    render(<SeedUploader onClose={() => {}} />, { wrapper });
    expect(screen.getByText(/Seed/)).toBeDisabled();
  });

  it("should show helper text when no files uploaded", () => {
    render(<SeedUploader onClose={() => {}} />, { wrapper });
    expect(
      screen.getByText("Upload both files to continue"),
    ).toBeInTheDocument();
  });
});
