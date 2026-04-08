import { render, screen } from "@testing-library/react";
import CodeViewer from "../CodeViewer";
import type { Comment } from "@/types";

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <code>{children}</code>,
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
}));

const comments: Comment[] = [
  {
    id: "c1",
    author: { id: "u1", username: "bob" },
    line_number: 2,
    body: "Consider using a guard clause here",
    created_at: "2024-06-15T10:00:00Z",
  },
];

describe("CodeViewer", () => {
  it("renders code with line numbers", () => {
    render(
      <CodeViewer code={"const x = 1;\nconst y = 2;"} language="javascript" comments={[]} />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(screen.getByText("const y = 2;")).toBeInTheDocument();
  });

  it("renders existing comments on the correct lines", () => {
    render(
      <CodeViewer
        code={"line one\nline two\nline three"}
        language="python"
        comments={comments}
      />
    );
    expect(screen.getByText("Consider using a guard clause here")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
  });
});
