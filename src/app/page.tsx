import { Button } from "@radix-ui/themes";
import { Drawing } from "./components/drawing";

export default function Home() {
  return (
    <div>
      <Button variant="outline">Let&apos;s go</Button>
      <Drawing />
    </div>
  );
}
