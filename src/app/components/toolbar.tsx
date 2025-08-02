import { Flex, Button, Separator, Tooltip, Select } from "@radix-ui/themes";
import {
  CursorArrowIcon,
  Pencil1Icon,
  SquareIcon,
  CircleIcon,
} from "@radix-ui/react-icons";
import { ColorPicker } from "./ColorPicker";

interface ToolbarProps {
  tool: string;
  setTool: (tool: "select" | "pen" | "rect" | "circle") => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

export function Toolbar({
  tool,
  setTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
}: ToolbarProps) {
  const handleToolClick =
    (newTool: "select" | "pen" | "rect" | "circle") =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setTool(newTool);
    };

  return (
    <Flex
      position="fixed"
      top="2"
      left="50%"
      align="center"
      p="3"
      gap="3"
      style={{
        transform: "translateX(-50%)",
        background: "var(--gray-a2)",
        backdropFilter: "blur(12px)",
        borderRadius: "var(--radius-4)",
        boxShadow: "var(--shadow-3)",
        zIndex: 1000,
        userSelect: "none",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Flex gap="2">
        <Tooltip content="선택 (V)">
          <Button
            variant={tool === "select" ? "solid" : "surface"}
            onClick={handleToolClick("select")}
          >
            <CursorArrowIcon />
          </Button>
        </Tooltip>

        <Tooltip content="펜 (P)">
          <Button
            variant={tool === "pen" ? "solid" : "surface"}
            onClick={handleToolClick("pen")}
          >
            <Pencil1Icon />
          </Button>
        </Tooltip>

        <Tooltip content="사각형 (R)">
          <Button
            variant={tool === "rect" ? "solid" : "surface"}
            onClick={handleToolClick("rect")}
          >
            <SquareIcon />
          </Button>
        </Tooltip>

        <Tooltip content="원 (O)">
          <Button
            variant={tool === "circle" ? "solid" : "surface"}
            onClick={handleToolClick("circle")}
          >
            <CircleIcon />
          </Button>
        </Tooltip>
      </Flex>

      <Separator orientation="vertical" />

      <Flex gap="2" align="center" onClick={(e) => e.stopPropagation()}>
        <Tooltip content="색상 선택">
          <Flex align="center" gap="2">
            <ColorPicker color={strokeColor} onChange={setStrokeColor} />
          </Flex>
        </Tooltip>

        <Tooltip content="선 굵기">
          <Select.Root
            value={strokeWidth.toString()}
            onValueChange={(value) => setStrokeWidth(Number(value))}
          >
            <Select.Trigger />
            <Select.Content position="popper" sideOffset={5}>
              <Select.Item value="1">얇게</Select.Item>
              <Select.Item value="2">보통</Select.Item>
              <Select.Item value="4">굵게</Select.Item>
              <Select.Item value="6">매우 굵게</Select.Item>
            </Select.Content>
          </Select.Root>
        </Tooltip>
      </Flex>
    </Flex>
  );
}
