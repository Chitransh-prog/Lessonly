import { getMindmap } from "@/api/getMindmapHistory";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import Flow from "@/components/Flow";

function InnerFlowRenderer({
  nodes,
  edges,
  reactFlowWrapper,
  mindmapName,
  fileName,
}) {
  return (
    <>
      <div
        ref={reactFlowWrapper}
        className="h-[70vh] w-[90vw] mt-4 border rounded-lg shadow-lg bg-white relative"
      >
        <Flow nodes={nodes} edges={edges} />
      </div>
    </>
  );
}

function ViewMindmap() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // 👇 required for exporting & Flow bounds
  const reactFlowWrapper = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMindmap(id);
      console.log("this is the data: ", data[0]);
      setResult(data[0]);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      {result && (
        <ReactFlowProvider>
          <InnerFlowRenderer
            nodes={result.mindmap_json.nodes}
            edges={result.mindmap_json.edges}
            reactFlowWrapper={reactFlowWrapper}
            mindmapName={result.name}
            fileName={result.source_text}
          />
        </ReactFlowProvider>
      )}
    </>
  );
}

export default ViewMindmap;
