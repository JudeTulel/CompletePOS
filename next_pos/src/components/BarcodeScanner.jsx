"use client"
import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Check } from 'lucide-react';

const BarcodeScanner = ({ isOpen, onClose, onScan }) => {
  const [scannedValue, setScannedValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const hasScannedRef = useRef(false);

  // Init & Cleanup
  useEffect(() => {
    if (isOpen) {
      codeReaderRef.current = new BrowserMultiFormatReader();
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!videoRef.current || !codeReaderRef.current) return;

    try {
      setIsScanning(true);
      setError('');
      hasScannedRef.current = false;

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            setScannedValue(result.getText());
            setIsScanning(false);
            stopScanning(); // Stop after a successful scan
          }

          if (err && err.name !== 'NotFoundException') {
            console.error('Scanning error:', err);
          }
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to access the camera. Check permissions or device availability.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setScannedValue('');
    setError('');
    startScanning();
  };

  const handleDone = () => {
    if (scannedValue && onScan) {
      onScan(scannedValue);
    }
    handleClose();
  };

  const handleClose = () => {
    stopScanning();
    setScannedValue('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-grey rounded-xl p-6 w-full max-w-md border border-light-grey/20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-off-white">Scan Barcode</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-light-grey/20 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-warm-grey" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative mb-6">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-error-red mb-4">{error}</p>
              <button onClick={handleRetry} className="btn-secondary">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-64 object-cover bg-deep-charcoal rounded-lg"
                autoPlay
                playsInline
                muted
              />

              {/* Guide Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-0.5 bg-maroon shadow-lg animate-pulse"></div>
              </div>

              {/* Corner Guides */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-3/4 h-32">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-off-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-off-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-off-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-off-white"></div>
                </div>
              </div>

              {/* Scanning Status */}
              {isScanning && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-off-white text-sm bg-black/50 px-3 py-1 rounded-full inline-block">
                    Position barcode within the frame
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scanned Value Display */}
        {scannedValue && (
          <div className="p-4 bg-success-green/20 border border-success-green/30 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-5 w-5 text-success-green" />
              <span className="text-sm font-medium text-success-green">Barcode Scanned</span>
            </div>
            <div className="bg-slate-grey p-3 rounded border border-light-grey/20">
              <p className="text-sm text-warm-grey mb-1">Scanned Value:</p>
              <p className="font-mono text-lg text-off-white break-all">{scannedValue}</p>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex space-x-3">
          <button onClick={handleClose} className="btn-secondary flex-1">
            Cancel
          </button>
          {scannedValue ? (
            <button onClick={handleDone} className="btn-primary flex-1">
              Done
            </button>
          ) : (
            !isScanning && !error && (
              <button onClick={handleRetry} className="btn-primary flex-1">
                Start Scanning
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
