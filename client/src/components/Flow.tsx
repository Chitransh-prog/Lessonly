import {
  Background,
  Edge,
  FitViewOptions,
  Node,
  ReactFlow,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";

import { ZoomSlider } from "./zoom-slider";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ActionBarNodeDemo } from "./Actionbar";

const nodeTypes = {
  baseNodeFull: ActionBarNodeDemo,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.3,
};

interface FlowProps {
  nodes: Node[];
  edges: Edge[];
  reactFlowWrapper?: React.RefObject<HTMLDivElement>; // Fixed type
}

export default function Flow({ nodes, edges, reactFlowWrapper }: FlowProps) {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  // Internal state for React Flow to handle dragging/deleting/adding
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Sync props with internal state when AI generates a new map
  useEffect(() => {
    setRfNodes(nodes);
    setRfEdges(edges);
  }, [nodes, edges, setRfNodes, setRfEdges]);

  return (
    <div ref={reactFlowWrapper} className="reactflow-wrapper h-full w-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1} // Allow zooming out further
      >
        <Background />

        <ZoomSlider position="top-left" orientation={orientation} />

        <Panel position="bottom-right">
          <Button
            onClick={() =>
              setOrientation(
                orientation === "horizontal" ? "vertical" : "horizontal"
              )
            }
            className="bg-white text-black hover:bg-gray-100 border shadow-sm"
          >
            Toggle orientation
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
