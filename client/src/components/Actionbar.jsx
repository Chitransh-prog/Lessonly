import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "./base-node";

// Added setEdges and getNode to hooks
import { useNodeId, useReactFlow, Handle, Position } from "@xyflow/react";
import { EllipsisVertical, Rocket, Trash, PlusCircle } from "lucide-react";

export const ActionBarNodeDemo = memo(({ data }) => {
  const id = useNodeId();
  const { setNodes, setEdges, getNode } = useReactFlow(); // Get extra helpers
  const [showMore, setShowMore] = useState(false);

  // --- NEW FUNCTION: Add Child Node ---
  const handleAddChild = useCallback(() => {
    // 1. Get the current node's position to calculate where the child goes
    const currentNode = getNode(id);
    if (!currentNode) return;

    const childLabel = prompt("Enter title for new child:", "New Idea");
    if (!childLabel) return;

    const childDetail = prompt("Enter details (optional):", "");

    const newId = `manual_${Date.now()}`;

    // 2. Create the new node slightly offset to the right and down
    const newNode = {
      id: newId,
      type: "baseNodeFull", // Reuse this same component type
      data: {
        label: childLabel,
        detail: childDetail || "No details provided.",
      },
      position: {
        x: currentNode.position.x + 350, // Shift right
        y: currentNode.position.y + 100, // Shift down
      },
    };

    // 3. Connect the edge from current node (source) to new node (target)
    const newEdge = {
      id: `edge_${id}_to_${newId}`,
      source: id,
      target: newId,
      type: "default", // or "smoothstep", "bezier"
    };

    // 4. Update State
    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
  }, [id, getNode, setNodes, setEdges]);
  // ------------------------------------

  const handleDelete = useCallback(() => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  }, [id, setNodes]);

  const handleTitleChange = () => {
    const newTitle = prompt("Enter new title:", data.label);
    if (!newTitle) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newTitle } }
          : node
      )
    );
  };

  const handleDescriptionChange = () => {
    const newDesc = prompt("Enter new description:", data.detail || "");
    if (newDesc === null) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, detail: newDesc } }
          : node
      )
    );
  };

  return (
    <BaseNode className="max-w-[260px] w-fit relative">
      <Handle
        type="target"
        position={Position.Top}
        className="bg-blue-500 w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-blue-500 w-3 h-3"
      />

      <BaseNodeHeader className="border-b flex items-center gap-2">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle>{data.label}</BaseNodeHeaderTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="nodrag p-1">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Node Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* --- NEW MENU ITEM --- */}
            <DropdownMenuItem
              onClick={handleAddChild}
              className="cursor-pointer text-blue-600 focus:text-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Child Node
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* --------------------- */}

            <DropdownMenuItem onClick={handleTitleChange}>
              Edit Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDescriptionChange}>
              Edit Description
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-700"
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Node
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BaseNodeHeader>

      <BaseNodeContent>
        {showMore ? (
          <p className="text-sm">{data.detail}</p>
        ) : (
          <p className="text-sm line-clamp-2">{data.detail}</p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="p-0 mt-1 text-xs nodrag"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : "Show More"}
        </Button>
      </BaseNodeContent>
    </BaseNode>
  );
});
