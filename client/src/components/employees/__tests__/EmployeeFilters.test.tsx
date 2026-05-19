import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Filters } from "../Filters";

const meta = {
  countries: ["India", "USA"],
  departments: ["Engineering", "Design"],
  jobTitles: ["Engineer", "Designer"],
};

describe("EmployeeFilters", () => {
  it("should render search input", () => {
    render(<Filters meta={meta} onFilterChange={() => {}} />);
    expect(
      screen.getByPlaceholderText("Search name or email…"),
    ).toBeInTheDocument();
  });

  it("should render country, department and status selects", () => {
    render(<Filters meta={meta} onFilterChange={() => {}} />);
    expect(screen.getByDisplayValue("All countries")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All departments")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All")).toBeInTheDocument();
  });

  it("should call onFilterChange when country changes", () => {
    const onFilterChange = vi.fn();
    render(<Filters meta={meta} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByDisplayValue("All countries"), {
      target: { value: "India" },
    });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ country: "India" }),
    );
  });

  it("should show reset button as red when filters are active", () => {
    const onFilterChange = vi.fn();
    render(<Filters meta={meta} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByDisplayValue("All countries"), {
      target: { value: "India" },
    });
    const resetBtn = screen.getByLabelText("Reset filters");
    expect(resetBtn.className).toContain("red");
  });

  it("should reset all filters on reset click", () => {
    const onFilterChange = vi.fn();
    render(<Filters meta={meta} onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByDisplayValue("All countries"), {
      target: { value: "India" },
    });
    fireEvent.click(screen.getByLabelText("Reset filters"));
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ country: undefined }),
    );
  });
});
