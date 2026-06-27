import { useEffect, useRef, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { HiOutlineArrowDownTray, HiOutlineCamera } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';

const VirtualTryOn = ({ isOpen, onClose, productImg }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const glassesRef = useRef(null);
  const isTrackingRef = useRef(false);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    let camera = null;
    let faceMesh = null;

    if (isOpen) {
      setHasPermission(false);
      setError('');
      setIsTracking(false);
      isTrackingRef.current = false;
      setSnapshot(null);

      // Guard: check if MediaPipe scripts are loaded
      const FaceMesh = window.FaceMesh;
      const Camera = window.Camera;
      if (!FaceMesh || !Camera) {
        setError('AR engine failed to load. Please refresh the page and try again.');
        return;
      }

      // Initialize Google MediaPipe Face Mesh AI
      faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results) => {
        if (!isTrackingRef.current) {
          isTrackingRef.current = true;
          setIsTracking(true);
        }
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          // Left eye is landmark 33 (User's actual left eye, appears on RIGHT of mirrored screen)
          // Right eye is landmark 263 (User's actual right eye, appears on LEFT of mirrored screen)
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];

          if (videoRef.current && glassesRef.current) {
            const videoWidth = videoRef.current.offsetWidth;
            const videoHeight = videoRef.current.offsetHeight;

            // Invert X because video is CSS mirrored (-scale-x-100)
            const x1 = (1 - leftEye.x) * videoWidth; // Screen Right
            const y1 = leftEye.y * videoHeight;
            const x2 = (1 - rightEye.x) * videoWidth; // Screen Left
            const y2 = rightEye.y * videoHeight;

            const eyeDist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            
            // Vector from Screen Left (x2, y2) to Screen Right (x1, y1) guarantees upright angle
            const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Product image has background padding, so we scale it 3.5x the eye distance
            const glassesWidth = eyeDist * 3.5;
            
            glassesRef.current.style.width = `${glassesWidth}px`;
            glassesRef.current.style.left = `${midX}px`;
            glassesRef.current.style.top = `${midY}px`;
            glassesRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            glassesRef.current.style.opacity = '1';
          }
        } else {
          if (glassesRef.current) glassesRef.current.style.opacity = '0';
        }
      });

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMesh) {
              try {
                await faceMesh.send({ image: videoRef.current });
              } catch (e) {
                // Ignore send errors after cleanup
              }
            }
          },
          width: 640,
          height: 480
        });

        camera.start()
          .then(() => setHasPermission(true))
          .catch(() => setError('Camera access denied or unavailable. Please allow camera permissions.'));
      }
    }

    return () => {
      if (camera) camera.stop();
      if (faceMesh) faceMesh.close();
    };
  }, [isOpen]);

  const takeSnapshot = () => {
    if (!videoRef.current || !glassesRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw flipped video
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const glassesWidthStr = glassesRef.current.style.width;
    const leftStr = glassesRef.current.style.left;
    const topStr = glassesRef.current.style.top;
    const transformStr = glassesRef.current.style.transform;

    if (!glassesWidthStr) return; // Tracking hasn't started fully

    const glassesWidth = parseFloat(glassesWidthStr);
    const midX = parseFloat(leftStr);
    const midY = parseFloat(topStr);
    
    const match = transformStr.match(/rotate\(([-\d.]+)deg\)/);
    const angle = match ? parseFloat(match[1]) : 0;

    const scaleX = canvas.width / video.offsetWidth;
    const scaleY = canvas.height / video.offsetHeight;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const gWidth = glassesWidth * scaleX;
      const gHeight = (img.height / img.width) * gWidth;
      
      const drawX = midX * scaleX;
      const drawY = midY * scaleY;

      ctx.save();
      ctx.translate(drawX, drawY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -gWidth / 2, -gHeight / 2, gWidth, gHeight);
      ctx.restore();

      setSnapshot(canvas.toDataURL('image/png'));
      toast.success('Snapshot taken!', {
        style: { background: '#111', color: '#d4af37', border: '1px solid #d4af37' }
      });
    };
    img.src = productImg;
  };

  const downloadSnapshot = () => {
    const link = document.createElement('a');
    link.href = snapshot;
    link.download = 'radheshyam-virtual-tryon.png';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-4xl bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent">
          <h3 className="text-luxury-gold tracking-widest uppercase text-sm font-medium flex items-center gap-2">
            <HiOutlineCamera className="w-5 h-5" /> Live AR Virtual Try-On
          </h3>
          <button onClick={onClose} className="text-white hover:text-luxury-gold transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md cursor-pointer">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Main Area */}
        <div className="relative aspect-[4/3] sm:aspect-video w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
          
          {snapshot ? (
            // Show snapshot
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[var(--bg-primary)]">
               <img src={snapshot} alt="Snapshot" className="w-full h-full object-contain" />
               <button 
                  onClick={downloadSnapshot}
                  className="absolute bottom-6 bg-luxury-gold text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
               >
                 <HiOutlineArrowDownTray className="w-5 h-5" /> Download Snapshot
               </button>
               <button 
                  onClick={() => setSnapshot(null)}
                  className="absolute top-6 right-6 bg-white/20 text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest hover:bg-white/40 transition-colors cursor-pointer"
               >
                 Retake
               </button>
            </div>
          ) : (
            // Show Live Feed
            <>
              {!hasPermission && !error && (
                <div className="text-luxury-gold animate-pulse flex flex-col items-center z-10 absolute">
                  <HiOutlineCamera className="w-12 h-12 mb-4 opacity-80" />
                  <p className="uppercase tracking-widest text-sm">Requesting camera...</p>
                </div>
              )}
              
              {hasPermission && !isTracking && (
                <div className="text-luxury-gold animate-pulse flex flex-col items-center z-10 absolute">
                  <p className="uppercase tracking-widest text-sm">Initializing Face AI...</p>
                </div>
              )}
              
              {error && (
                <div className="text-red-400 text-center p-6 z-10 absolute bg-red-900/20 border border-red-900/50 rounded-xl">
                  <p className="font-medium text-lg mb-2">{error}</p>
                </div>
              )}

              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover transform -scale-x-100 ${hasPermission ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}
                playsInline
                autoPlay
                muted
              />

              {/* AR Overlay Image */}
              {hasPermission && (
                <img 
                  ref={glassesRef}
                  src={productImg}
                  alt="Glasses Overlay"
                  className="absolute pointer-events-none drop-shadow-2xl opacity-0 transition-all duration-75"
                  style={{ transformOrigin: 'center center', mixBlendMode: 'multiply' }}
                />
              )}
              
              {/* Hidden Canvas for Snapshots */}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}

        </div>

        {/* Footer */}
        {!snapshot && (
          <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] text-center flex justify-center gap-4">
            <button onClick={onClose} className="px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm cursor-pointer">
              Cancel
            </button>
            <button 
              onClick={takeSnapshot}
              disabled={!isTracking}
              className={`px-10 py-3 rounded-full font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] text-sm ${isTracking ? 'bg-luxury-gold text-black hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:scale-105 cursor-pointer' : 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed'}`}
            >
              Take Snapshot
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VirtualTryOn;
