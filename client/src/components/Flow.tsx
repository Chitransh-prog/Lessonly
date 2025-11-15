import {
  Background,
  Edge,
  FitViewOptions,
  Node,
  ReactFlow,
} from "@xyflow/react";

import { ZoomSlider } from "./zoom-slider";
import { Button } from "./ui/button";
import { Panel } from "@xyflow/react";

import { useState } from "react";

import { ActionBarNodeDemo } from "./Actionbar";

const nodeTypes = {
  baseNodeFull: ActionBarNodeDemo,
};

const fitViewOptions: FitViewOptions = {
  padding: "100px",
};

interface FlowProps {
  nodes: Node[];
  edges: Edge[];
}

export default function App({ nodes, edges }: FlowProps) {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-screen w-full">
        <ReactFlow
          defaultNodes={nodes}
          defaultEdges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
        >
          <Background />
          <ZoomSlider position="top-left" orientation={orientation} />
          <Panel position="bottom-right" />
          <Button
            onClick={() =>
              setOrientation(
                orientation === "horizontal" ? "vertical" : "horizontal"
              )
            }
          >
            Toggle orientation
          </Button>
        </ReactFlow>
      </div>
    </div>
  );
}
