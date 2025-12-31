import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sidebar navigation", () => {
  render(<App />);
  // Use role-based queries to avoid ambiguity (there are multiple 'Uploads' texts on the page).
  expect(screen.getByRole("link", { name: /^Uploads$/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^Transactions$/i })).toBeInTheDocument();
});
