import { Box, Flex, Grid, Tabs } from "@radix-ui/themes";
import * as Popover from "@radix-ui/react-popover";
import { TransparencyGridIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { EyeDropperIcon } from "./icons/EyeDropperIcon";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const BASIC_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#800080",
  "#008080",
  "#000080",
];

const RECENT_COLORS_KEY = "recentColors";

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENT_COLORS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const addToRecentColors = (newColor: string) => {
    const updated = [
      newColor,
      ...recentColors.filter((c) => c !== newColor),
    ].slice(0, 10);
    setRecentColors(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
    }
  };

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    addToRecentColors(newColor);
  };

  const handleEyeDropper = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (e) {
      console.error("EyeDropper not supported or permission denied");
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Box
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            background: color,
            cursor: "pointer",
            border: "1px solid var(--gray-a8)",
          }}
        />
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        style={{
          width: "240px",
          backgroundColor: "var(--color-background)",
          borderRadius: "var(--radius-4)",
          boxShadow: "var(--shadow-5)",
          zIndex: 1000,
        }}
      >
        <Tabs.Root defaultValue="palette">
          <Tabs.List>
            <Tabs.Trigger value="palette">팔레트</Tabs.Trigger>
            <Tabs.Trigger value="recent">최근 사용</Tabs.Trigger>
          </Tabs.List>

          <Box p="3">
            <Tabs.Content value="palette">
              <Grid columns="5" gap="2" mb="3">
                {BASIC_COLORS.map((c) => (
                  <ColorButton
                    key={c}
                    color={c}
                    onClick={() => handleColorChange(c)}
                    isSelected={color === c}
                  />
                ))}
              </Grid>
            </Tabs.Content>

            <Tabs.Content value="recent">
              <Grid columns="5" gap="2" mb="3">
                {recentColors.map((c) => (
                  <ColorButton
                    key={c}
                    color={c}
                    onClick={() => handleColorChange(c)}
                    isSelected={color === c}
                  />
                ))}
              </Grid>
            </Tabs.Content>

            <Flex gap="2" mt="3">
              <Box
                onClick={handleEyeDropper}
                style={{
                  padding: "8px",
                  borderRadius: "var(--radius-2)",
                  cursor: "pointer",
                  backgroundColor: "var(--gray-a3)",
                }}
              >
                <EyeDropperIcon />
              </Box>
              <Box
                onClick={() => handleColorChange("transparent")}
                style={{
                  padding: "8px",
                  borderRadius: "var(--radius-2)",
                  cursor: "pointer",
                  backgroundColor: "var(--gray-a3)",
                }}
              >
                <TransparencyGridIcon />
              </Box>
              <input
                type="color"
                value={color === "transparent" ? "#ffffff" : color}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              />
            </Flex>
          </Box>
        </Tabs.Root>
      </Popover.Content>
    </Popover.Root>
  );
}

interface ColorButtonProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

function ColorButton({ color, onClick, isSelected }: ColorButtonProps) {
  return (
    <Box
      onClick={onClick}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        background:
          color === "transparent"
            ? "repeating-conic-gradient(#CCCCCC 0% 25%, transparent 0% 50%) 50% / 8px 8px"
            : color,
        cursor: "pointer",
        border: isSelected
          ? "2px solid var(--accent-9)"
          : "1px solid var(--gray-a8)",
      }}
    />
  );
}
