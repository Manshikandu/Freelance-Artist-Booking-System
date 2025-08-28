import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import axios from '../lib/axios';

const PDFViewer = ({ contractUrl, isOpen, onClose, title = "Contract" }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);

  const fetchSignedUrl = async () => {
    if (!contractUrl) return;
    
    setLoading(true);
    setError(null);      try {
        const publicId = extractPublicIdFromCloudinaryUrl(contractUrl);
        
        if (publicId) {
          const response = await axios.get(`/contracts/signed-url/${publicId}`);
          setPdfUrl(response.data.signedUrl);
        } else {
          setPdfUrl(contractUrl);
        }
      } catch (err) {
      console.error('Error fetching signed URL:', err);
      setError('Failed to load contract. Please try again.');
      setPdfUrl(contractUrl);
    } finally {
      setLoading(false);
    }
  };

  const extractPublicIdFromCloudinaryUrl = (url) => {
    try {
      
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (match) {
        let publicId = match[1];
        if (publicId.startsWith('contracts/')) {
          publicId = publicId.replace('contracts/', '');
        }
        return publicId;
      }
      return null;
    } catch (err) {
      console.error('Error extracting public ID:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadContract = async () => {
      if (!contractUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const publicId = extractPublicIdFromCloudinaryUrl(contractUrl);
        
        if (publicId) {
          const response = await axios.get(`/contracts/signed-url/${publicId}`);
          setPdfUrl(response.data.signedUrl);
        } else {
          setPdfUrl(contractUrl);
        }
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setError('Failed to load contract. Please try again.');
        setPdfUrl(contractUrl);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && contractUrl) {
      loadContract();
    }
  }, [isOpen, contractUrl]);



  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>



            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading contract...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchSignedUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-full overflow-auto">
              <iframe
                src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`}
                className="w-full h-full border-0"
                title={title}
                style={{ minHeight: '500px' }}
                allow="fullscreen"
                loading="eager"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No contract available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
