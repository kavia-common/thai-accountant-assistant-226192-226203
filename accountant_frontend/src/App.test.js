import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);
  expect(screen.getByText(/Uploads/i)).toBeInTheDocument();
  expect(screen.getByText(/Transactions/i)).toBeInTheDocument();
});
