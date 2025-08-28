import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function ArtistSignatureForm({
  artistSignaturePreview,
  setArtistSignaturePreview,
  loading,
  onArtistSign,
}) {
  const artistSigCanvas = useRef(null);

  return (
    <div className="mt-10">
      <label className="font-medium block mb-2">Draw your signature (Artist):</label>
      <SignatureCanvas
        ref={artistSigCanvas}
        penColor="black"
        canvasProps={{ width: 400, height: 150, className: "border rounded bg-white" }}
        clearOnResize={false}
      />
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => {
            artistSigCanvas.current.clear();
            setArtistSignaturePreview(null);
          }}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            const img = artistSigCanvas.current.toDataURL();
            setArtistSignaturePreview(img);
          }}
          className="px-3 py-1 border rounded bg-green-100 hover:bg-green-200"
        >
          Add to Form
        </button>
      </div>

      <button
        onClick={onArtistSign}
        disabled={loading || !artistSignaturePreview}
        className={`mt-6 w-full py-2 rounded text-white font-semibold transition ${
          loading || !artistSignaturePreview ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Signing..." : "Sign Contract"}
      </button>
    </div>
  );
}
