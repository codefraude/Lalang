import { render, screen } from "@testing-library/react";
import { PasswordStrength } from "@/components/auth/password-strength";

describe("<PasswordStrength />", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the strength label and requirements for a strong password", () => {
    render(<PasswordStrength password="Tr0ub4dour&3xplore!" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(screen.getByText("A symbol")).toBeInTheDocument();
  });

  it("labels a weak password", () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });
});
