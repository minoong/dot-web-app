"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Toolbar } from "../components/toolbar";

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);

  const [tool, setTool] = useState<"select" | "pen" | "rect" | "circle">(
    "select"
  );
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const currentShape = useRef<any>(null);

  // Fabric.js 초기화
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = async () => {
      try {
        // Fabric.js v6 방식으로 import
        const fabricModule = await import("fabric");
        const { Canvas, PencilBrush } = fabricModule;

        const canvas = new Canvas(canvasRef.current!, {
          width: window.innerWidth - 40,
          height: window.innerHeight - 120,
          backgroundColor: "#ffffff",
        });

        // 브러시 명시적 초기화
        const brush = new PencilBrush(canvas);
        brush.color = strokeColor;
        brush.width = strokeWidth;
        brush.strokeLineCap = "round";
        brush.strokeLineJoin = "round";
        canvas.freeDrawingBrush = brush;

        fabricCanvasRef.current = canvas;

        // 리사이즈 핸들러
        const handleResize = () => {
          canvas.setDimensions({
            width: window.innerWidth - 40,
            height: window.innerHeight - 120,
          });
          canvas.renderAll();
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          canvas.dispose();
        };
      } catch (error) {
        console.error("Fabric.js 초기화 오류:", error);
      }
    };

    initCanvas();
  }, []);

  // 도구 변경 핸들링
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 모든 마우스 이벤트 제거
    canvas.off();

    if (tool === "pen") {
      // 자유 그리기 모드
      canvas.isDrawingMode = true;
      canvas.selection = false;

      // 브러시 설정 - 브러시가 없으면 새로 생성
      const initBrush = async () => {
        try {
          const fabricModule = await import("fabric");
          const { PencilBrush } = fabricModule;

          if (!canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush = new PencilBrush(canvas);
          }

          canvas.freeDrawingBrush.color = strokeColor;
          canvas.freeDrawingBrush.width = strokeWidth;
          canvas.freeDrawingBrush.strokeLineCap = "round";
          canvas.freeDrawingBrush.strokeLineJoin = "round";

          console.log("브러시 설정 완료:", {
            color: canvas.freeDrawingBrush.color,
            width: canvas.freeDrawingBrush.width,
            isDrawingMode: canvas.isDrawingMode,
          });
        } catch (error) {
          console.error("브러시 초기화 오류:", error);
        }
      };

      initBrush();
    } else if (tool === "select") {
      // 선택 모드
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else {
      // 도형 그리기 모드
      canvas.isDrawingMode = false;
      canvas.selection = false;

      // 도형 그리기 이벤트 설정
      const handleMouseDown = async (options: any) => {
        try {
          const fabricModule = await import("fabric");
          const { Rect, Circle } = fabricModule;

          isDrawing.current = true;
          const pointer = canvas.getPointer(options.e);
          startPoint.current = pointer;

          let shape: any = null;

          if (tool === "rect") {
            shape = new Rect({
              left: pointer.x,
              top: pointer.y,
              width: 1,
              height: 1,
              fill: "transparent",
              stroke: strokeColor,
              strokeWidth: strokeWidth,
              selectable: true,
            });
          } else if (tool === "circle") {
            shape = new Circle({
              left: pointer.x,
              top: pointer.y,
              radius: 1,
              fill: "transparent",
              stroke: strokeColor,
              strokeWidth: strokeWidth,
              selectable: true,
            });
          }

          if (shape) {
            canvas.add(shape);
            currentShape.current = shape;
            canvas.setActiveObject(shape);
            canvas.renderAll();
          }
        } catch (error) {
          console.error("도형 생성 오류:", error);
        }
      };

      const handleMouseMove = (options: any) => {
        if (!isDrawing.current || !startPoint.current || !currentShape.current)
          return;

        const pointer = canvas.getPointer(options.e);
        const shape = currentShape.current;

        try {
          if (tool === "rect") {
            const width = Math.abs(pointer.x - startPoint.current.x);
            const height = Math.abs(pointer.y - startPoint.current.y);
            const left = Math.min(pointer.x, startPoint.current.x);
            const top = Math.min(pointer.y, startPoint.current.y);

            shape.set({
              left: left,
              top: top,
              width: Math.max(width, 1),
              height: Math.max(height, 1),
            });
          } else if (tool === "circle") {
            const dx = pointer.x - startPoint.current.x;
            const dy = pointer.y - startPoint.current.y;
            const radius = Math.sqrt(dx * dx + dy * dy) / 2;

            shape.set({
              left: startPoint.current.x - radius,
              top: startPoint.current.y - radius,
              radius: Math.max(radius, 1),
            });
          }

          canvas.renderAll();
        } catch (error) {
          console.error("도형 업데이트 오류:", error);
        }
      };

      const handleMouseUp = () => {
        isDrawing.current = false;
        startPoint.current = null;
        currentShape.current = null;
      };

      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);
    }
  }, [tool, strokeColor, strokeWidth]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Delete 키로 선택된 객체 삭제
      if (e.key === "Delete") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects && activeObjects.length > 0) {
          activeObjects.forEach((obj: any) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }

      // 도구 단축키 (input 요소에 포커스가 없을 때만)
      if (document.activeElement?.tagName !== "INPUT") {
        switch (e.key.toLowerCase()) {
          case "v":
            setTool("select");
            break;
          case "p":
            setTool("pen");
            break;
          case "r":
            setTool("rect");
            break;
          case "o":
            setTool("circle");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      style={{
        backgroundColor: "var(--gray-2)",
        overflow: "hidden",
      }}
    >
      <Toolbar
        tool={tool}
        setTool={setTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />

      <Flex
        position="absolute"
        top="70px"
        left="20px"
        right="20px"
        bottom="20px"
        justify="center"
        align="center"
      >
        <Box
          position="relative"
          style={{
            border: "1px solid var(--gray-6)",
            borderRadius: "var(--radius-3)",
            backgroundColor: "white",
            boxShadow: "var(--shadow-3)",
          }}
        >
          <canvas ref={canvasRef} />
          {/* 상태 표시 */}
          <Box
            position="absolute"
            top="3"
            left="3"
            p="2"
            style={{
              background: "var(--gray-a2)",
              backdropFilter: "blur(12px)",
              borderRadius: "var(--radius-2)",
              boxShadow: "var(--shadow-3)",
            }}
          >
            <Text size="1" color="gray" weight="medium">
              도구: {tool} | 색상: {strokeColor} | 굵기: {strokeWidth}px
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
