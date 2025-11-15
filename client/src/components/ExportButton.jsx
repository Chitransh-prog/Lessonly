import { ReactFlowProvider, useReactFlow } from "@xyflow/react";

function ExButton() {
  const { toImage } = useReactFlow();

  const handleExport = async () => {
    const image = await toImage({
      type: "image/png",
      backgroundColor: "#ffffff", // optional
      pixelRatio: 2, // for HD output
    });

    // Download
    const link = document.createElement("a");
    link.href = image;
    link.download = "mindmap.png";
    link.click();
  };

  return (
    <button
      onClick={ExportButton}
      className={`mt-3 px-6 py-3 rounded-lg text-white font-semibold 
        `}
    >
      Download PNG
    </button>
  );
}

export default function ExportButton() {
  return (
    <ReactFlowProvider>
      <ExButton />
    </ReactFlowProvider>
  );
}
