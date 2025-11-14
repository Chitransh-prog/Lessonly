import { memo, useCallback } from "react";

import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "../components/base-node";

import { useNodeId, useReactFlow } from "@xyflow/react";
import { EllipsisVertical, Rocket, Trash } from "lucide-react";

const CustomMindmapNode = memo(({ data }) => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();

  const handleDelete = useCallback(() => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  }, [id, setNodes]);

  return (
    <BaseNode>
      <BaseNodeHeader className="border-b">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle>{data?.label || "Node"}</BaseNodeHeaderTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="nodrag p-1">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Node Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete}>
              Delete Node
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="nodrag p-1" onClick={handleDelete}>
          <Trash className="size-4" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent>
        <p>{data?.detail || "Add your content here."}</p>
      </BaseNodeContent>
    </BaseNode>
  );
});

export default CustomMindmapNode;
