"use client";

import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line, Rect, Circle, Transformer } from "react-konva";
import { Toolbar } from "./toolbar";

type Shape = {
  id: string;
  type: "rect" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
};

export function Drawing() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "pen" | "rect" | "circle">(
    "select"
  );
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = transformerRef.current.getStage().findOne("#" + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "v") setTool("select");
      if (e.key === "p") setTool("pen");
      if (e.key === "r") setTool("rect");
      if (e.key === "o") setTool("circle");
      if (e.key === "Delete" && selectedId) {
        setShapes(shapes.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, shapes]);

  const handleMouseDown = (e: any) => {
    if (tool === "select") {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
        return;
      }
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === "pen") {
      setLines([
        ...lines,
        { points: [pos.x, pos.y], stroke: strokeColor, strokeWidth },
      ]);
    } else {
      const newShape: Shape = {
        id: Math.random().toString(),
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth,
        draggable: true,
      };

      if (tool === "circle") {
        newShape.radius = 0;
      }

      setShapes([...shapes, newShape]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const pos = { x: point.x, y: point.y };

    if (tool === "pen") {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    } else {
      const lastShape = shapes[shapes.length - 1];
      const newShapes = [...shapes];

      if (tool === "rect") {
        newShapes[shapes.length - 1] = {
          ...lastShape,
          width: pos.x - lastShape.x,
          height: pos.y - lastShape.y,
        };
      } else if (tool === "circle") {
        const dx = pos.x - lastShape.x;
        const dy = pos.y - lastShape.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        newShapes[shapes.length - 1] = {
          ...lastShape,
          radius,
        };
      }

      setShapes(newShapes);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const ShapeComponent = ({ shape }: { shape: Shape }) => {
    if (shape.type === "rect") {
      return (
        <Rect
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scaleX(1);
            node.scaleY(1);

            const newShapes = shapes.map((s) => {
              if (s.id === shape.id) {
                return {
                  ...s,
                  x: node.x(),
                  y: node.y(),
                  width: node.width() * scaleX,
                  height: node.height() * scaleY,
                };
              }
              return s;
            });

            setShapes(newShapes);
          }}
        />
      );
    }

    if (shape.type === "circle") {
      return (
        <Circle
          id={shape.id}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          draggable={shape.draggable}
          onClick={() => setSelectedId(shape.id)}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();

            node.scaleX(1);
            node.scaleY(1);

            const newShapes = shapes.map((s) => {
              if (s.id === shape.id) {
                return {
                  ...s,
                  x: node.x(),
                  y: node.y(),
                  radius: node.radius() * scaleX,
                };
              }
              return s;
            });

            setShapes(newShapes);
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      <Toolbar
        tool={tool}
        setTool={setTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      <div style={{ touchAction: "none" }}>
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onMouseleave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
            {shapes.map((shape) => (
              <ShapeComponent key={shape.id} shape={shape} />
            ))}
            {selectedId && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  const minSize = 5;
                  if (newBox.width < minSize || newBox.height < minSize) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </>
  );
}
