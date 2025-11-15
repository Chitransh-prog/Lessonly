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

import { useNodeId, useReactFlow, Handle, Position } from "@xyflow/react";
import { EllipsisVertical, Rocket, Trash } from "lucide-react";

export const ActionBarNodeDemo = memo(({ data }) => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();
  const [showMore, setShowMore] = useState(false);

  const handleDelete = useCallback(() => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  }, [id, setNodes]);

  const handleTitleChange = () => {
    const newTitle = prompt("Enter new title:", data.label);
    if (!newTitle) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: newTitle,
              },
            }
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
          ? {
              ...node,
              data: {
                ...node.data,
                detail: newDesc,
              },
            }
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
            <DropdownMenuItem onClick={handleDelete}>
              Delete Node
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleTitleChange}>
              Edit title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDescriptionChange}>
              Edit Description
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          className="nodrag p-1 ml-auto"
          onClick={handleDelete}
        >
          <Trash className="size-4" />
        </Button>
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
