export const mindmapSchema = {
  type: "object",
  properties: {
    nodes: {
      type: "array",
      maxItems: 25, // HARD LIMIT
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["baseNodeFull"] },
          data: {
            type: "object",
            properties: {
              label: { type: "string", maxLength: 60 },
              detail: { type: "string", maxLength: 200 },
            },
            required: ["label"],
            additionalProperties: false,
          },
          position: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
            },
            required: ["x", "y"],
            additionalProperties: false,
          },
        },
        required: ["id", "type", "data", "position"],
        additionalProperties: false,
      },
    },

    edges: {
      type: "array",
      maxItems: 40, // HARD LIMIT
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
        },
        required: ["id", "source", "target"],
        additionalProperties: false,
      },
    },
  },

  required: ["nodes", "edges"],
  additionalProperties: false,
};
