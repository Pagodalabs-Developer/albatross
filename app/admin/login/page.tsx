import { existsSync } from "node:fs";
import path from "node:path";
import { LoginForm } from "./login-form";

const CANDIDATES = [
  "login-stage.jpg",
  "login-stage.jpeg",
  "login-stage.png",
  "login-stage.webp",
  "login-stage.avif",
];

function stageBackdrop(): string | undefined {
  const dir = path.join(process.cwd(), "public");
  const found = CANDIDATES.find((file) => existsSync(path.join(dir, file)));
  return found ? `/${found}` : undefined;
}

export default function AdminLoginPage() {
  return <LoginForm stage={stageBackdrop()} />;
}
