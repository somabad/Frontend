import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const SimpleImageEditor = ({ image, onSave, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Function to apply enhancements and crop
  const applyEdits = () => {
    const imageElement = imgRef.current;
    const canvas = previewCanvasRef.current;
    
    if (!imageElement || !canvas || !completedCrop) {
      return;
    }

    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Draw the cropped image
    ctx.drawImage(
      imageElement,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Apply brightness and contrast
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const brightnessFactor = brightness / 100;
    const contrastFactor = contrast / 100;

    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = data[i] * brightnessFactor;
      data[i + 1] = data[i + 1] * brightnessFactor;
      data[i + 2] = data[i + 2] * brightnessFactor;
      
      // Apply contrast
      data[i] = (data[i] - 128) * contrastFactor + 128;
      data[i + 1] = (data[i + 1] - 128) * contrastFactor + 128;
      data[i + 2] = (data[i + 2] - 128) * contrastFactor + 128;
      
      // Clamp values between 0-255
      data[i] = Math.min(255, Math.max(0, data[i]));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Update preview when crop or enhancements change
  useEffect(() => {
    if (completedCrop) {
      applyEdits();
    }
  }, [completedCrop, brightness, contrast]);

  const handleEnhance = () => {
    setBrightness(110);
    setContrast(120);
  };

  const handleReset = () => {
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setBrightness(100);
    setContrast(100);
  };

  const handleSave = () => {
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(dataUrl);
    }
  };

  const onImageLoad = (img) => {
    imgRef.current = img;
    // Set initial crop to cover most of the image
    const initialCrop = {
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Editor Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #e9ecef',
        paddingBottom: '15px'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Edit Scanned Form
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Save Changes
          </button>
          <button 
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div>
        {/* Controls Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Crop Controls */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{
              marginBottom: '15px',
              color: '#495057',
              borderBottom: '2px solid #007bff',
              paddingBottom: '5px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Crop Image
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '15px',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              Drag the corners or edges to adjust the crop area. The preview will update automatically.
            </p>
          </div>

          {/* Enhancement Controls */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{
              marginBottom: '15px',
              color: '#495057',
              borderBottom: '2px solid #007bff',
              paddingBottom: '5px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Image Enhancement
            </h4>
            
            {/* Slider Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '15px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Brightness: {brightness}%
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#ddd',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Contrast: {contrast}%
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#ddd',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
            
            {/* Enhancement Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '15px'
            }}>
              <button 
                onClick={handleEnhance}
                style={{
                  padding: '8px 16px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Auto Enhance
              </button>
              <button 
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Crop and Preview Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginTop: '20px'
        }}>
          {/* Crop Column */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              marginBottom: '15px',
              color: '#333',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Original Image - Drag to Crop
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              padding: '10px',
              background: '#f8f9fa'
            }}>
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                keepSelection={true}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px'
                }}
              >
                <img
                  ref={imgRef}
                  src={image.preview}
                  alt="Crop me"
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px',
                    display: 'block'
                  }}
                />
              </ReactCrop>
            </div>
          </div>
          
          {/* Preview Column */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              marginBottom: '15px',
              color: '#333',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Preview
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              {completedCrop && (
                <>
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      border: '2px solid #dee2e6',
                      borderRadius: '8px',
                      background: '#f8f9fa'
                    }}
                  />
                  <div style={{
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    <p style={{ margin: '5px 0' }}>
                      Size: {completedCrop.width.toFixed(0)}% × {completedCrop.height.toFixed(0)}%
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      Position: ({completedCrop.x.toFixed(0)}%, {completedCrop.y.toFixed(0)}%)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageEditor;
