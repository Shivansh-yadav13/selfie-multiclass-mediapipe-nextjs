"use client"
import { useRef } from 'react';
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255] // Vivid Blue
];

export default function Home() {
 const imgRef = useRef(null);
 const canvasRef = useRef(null);

 const createImageSegmenter = async () => {
   const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');

   const imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
     baseOptions: {
      //  modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
       delegate: "CPU"
     },
     outputCategoryMask: true,
     outputConfidenceMasks: false,
     runningMode: "IMAGE"
   });

   if (imgRef.current && canvasRef.current) {
     imageSegmenter.segment(imgRef.current, (result) => {
        const canvas = document.getElementById("canvas");
        const img = document.getElementById("img");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);


        const { width, height } = result.categoryMask;
        let imageData = ctx.getImageData(0, 0, width, height).data;

        canvas.width = width;
        canvas.height = height;

        const mask = result.categoryMask.getAsUint8Array();

        for (let i in mask) {
          const legendColor = legendColors[mask[i] % legendColors.length]; // getting the color set for the segmented part
          // console.log(mask[i] % legendColors.length);
          // We divide by 2 to avegrage out the pixel color values from the original image and the legend color
          // imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2; // Red 
          // imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2; // Green
          // imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2; // Blue
          // imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2; // Alpha
          if (mask[i] % legendColors.length == 4) {
            mask[i] = 1;

            imageData[i * 4] = 255; // Red 
            imageData[i * 4 + 1] = 255; // Green
            imageData[i * 4 + 2] = 255; // Blue
            imageData[i * 4 + 3] = 255; // Alpha

            // imageData[i * 4] = legendColor[0]; // Red 
            // imageData[i * 4 + 1] = legendColor[1]; // Green
            // imageData[i * 4 + 2] = legendColor[2]; // Blue
            // imageData[i * 4 + 3] = legendColor[3]; // Alpha
          } else {
            mask[i] = 0;
            imageData[i * 4] = 0; // Red 
            imageData[i * 4 + 1] = 0; // Green
            imageData[i * 4 + 2] = 0; // Blue
            imageData[i * 4 + 3] = 0; // Alpha
          }
        }

        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(uint8Array, width, height);
        ctx.putImageData(dataNew, 0, 0);
     });
   }
 }

 return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>Segment Any Image</p>

      <div className="flex justify-between">
        <img
          src="/img.jpg"
          id='img'
          ref={imgRef}
          alt="Img"
        />

        <canvas ref={canvasRef} id="canvas"></canvas>
      </div>

      <button onClick={createImageSegmenter}>Segment Image</button>
    </main>
 );
}
