import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function ClientSignatureForm({
  setClientSignaturePreview,
  loading,
  onGenerate,
}) {
  const clientSigCanvas = useRef(null);

  return (
    <div className="mt-6">
      <label className="font-medium block mb-2">Draw your signature (Client):</label>
      <SignatureCanvas
        ref={clientSigCanvas}
        penColor="black"
        canvasProps={{ width: 400, height: 150, className: "border rounded bg-white" }}
        clearOnResize={false}
      />
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => {
            clientSigCanvas.current.clear();
            setClientSignaturePreview(null);
          }}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            const img = clientSigCanvas.current.toDataURL();
            setClientSignaturePreview(img);
          }}
          className="px-3 py-1 border rounded bg-blue-100 hover:bg-blue-200"
        >
          Add to Form
        </button>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className={`mt-6 w-full py-2 rounded text-white font-semibold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Generate Draft Contract"}
      </button>
    </div>
  );
}
