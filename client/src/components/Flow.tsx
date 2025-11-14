import {
  Background,
  Edge,
  FitViewOptions,
  Node,
  ReactFlow,
} from "@xyflow/react";

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
        </ReactFlow>
      </div>
    </div>
  );
}
