import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from "@mui/material/Button";
import Paper from '@mui/material/Paper';

const ImageCropper = ({
  selected_file,
  closeModal,
  updateAvatar,
  current_selection,
}) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [imgSrc, setImgSrc] = useState();
  const [loading, set_loading] = useState(false);
  const imgRef = useRef(null);

  // Minimum dimensions in pixels
  const MIN_CROP_WIDTH = 450;
  const MIN_CROP_HEIGHT = 250;

  // Aspect ratio constraints
  const MIN_ASPECT_RATIO = 0.5; // 1:2
  const MAX_ASPECT_RATIO = 2;   // 2:1

  useEffect(() => {
    if (selected_file) {
      setImgSrc(selected_file.preview);
    } else {
      closeModal();
    }
  }, [selected_file]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    
    // Calculate initial aspect ratio that fits within constraints
    const imageAspectRatio = width / height;
    let initialAspectRatio;
    
    if (imageAspectRatio < MIN_ASPECT_RATIO) {
      initialAspectRatio = MIN_ASPECT_RATIO; // Too tall, use 1:2
    } else if (imageAspectRatio > MAX_ASPECT_RATIO) {
      initialAspectRatio = MAX_ASPECT_RATIO; // Too wide, use 2:1
    } else {
      initialAspectRatio = imageAspectRatio; // Use image's natural aspect ratio
    }

    // Calculate initial crop dimensions based on aspect ratio
    const initialCropWidth = 80; // Start with 80% of width
    const initialCropHeight = (initialCropWidth / initialAspectRatio) * (width / height);
    
    setCrop({
      unit: '%',
      x: 10, // Start 10% from left
      y: 10, // Start 10% from top
      width: Math.min(initialCropWidth, 100),
      height: Math.min(initialCropHeight, 100),
    });
  };

  // Custom aspect ratio enforcement
  const handleCropChange = (crop, percentCrop) => {
    if (crop.width && crop.height) {
      const aspectRatio = crop.width / crop.height;
      
      // Enforce aspect ratio constraints
      if (aspectRatio < MIN_ASPECT_RATIO) {
        // Too tall - adjust width to maintain minimum aspect ratio
        const newWidth = crop.height * MIN_ASPECT_RATIO;
        crop.width = newWidth;
      } else if (aspectRatio > MAX_ASPECT_RATIO) {
        // Too wide - adjust height to maintain maximum aspect ratio
        const newHeight = crop.width / MAX_ASPECT_RATIO;
        crop.height = newHeight;
      }
    }
    
    setCrop(crop);
  };

  const showCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return;

    set_loading(true);
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Use the completed crop dimensions
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileUrl = URL.createObjectURL(blob);
      updateAvatar(fileUrl, current_selection);
      set_loading(false);
      closeModal(); // Close modal after successful crop
    }, 'image/jpeg', 0.95);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={undefined} // We handle aspect ratio manually
          minWidth={MIN_CROP_WIDTH}
          minHeight={MIN_CROP_HEIGHT}
          keepSelection={true}
          ruleOfThirds={true}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            style={{ 
              maxHeight: '70vh', 
              maxWidth: '100%',
              display: 'block'
            }}
            onLoad={onImageLoad}
            alt="Crop me"
          />
        </ReactCrop>
      )}
      
      {/* Aspect ratio info for user */}
      <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 10
      }}>
        محدوده مجاز: ۱:۲ تا ۲:۱
      </div>
      
      <div className="controls">
        {!loading ? (
          <Paper sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 11, 
            background: 'blue',
            borderRadius: 0
          }} elevation={9}>
            <Button 
              onClick={showCroppedImage} 
              fullWidth 
              size="large"
              sx={{ 
                color: 'white', 
                fontSize: '1.2rem',
                fontWeight: 'bold',
                py: 2
              }}
            >
              انتخاب
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 11, 
            background: 'black',
            borderRadius: 0
          }} elevation={9}>
            <Button 
              fullWidth 
              size="large"
              sx={{ 
                color: 'white', 
                fontSize: '1.2rem',
                fontWeight: 'bold',
                py: 2
              }}
              disabled
            >
              در حال پردازش...
            </Button>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default ImageCropper;