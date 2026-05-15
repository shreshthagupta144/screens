// 1. GLOBAL VARIABLES
let handPose;
let video;
let hands = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 1. NORMAL WEBCAM BACKGROUND
  image(video, 0, 0, width, height);

  // 2. FIND BOTH HANDS
  let leftHand = hands.find(h => h.handedness === 'Left');
  let rightHand = hands.find(h => h.handedness === 'Right');

  // 3. THE "DIRECTOR'S FRAME" LOGIC
  // Only activate if BOTH hands are on the screen
  if (leftHand && rightHand) {
    
    // Grab the 4 points we need: Index and Thumb from both hands
    let lIndex = leftHand.keypoints[8];
    let lThumb = leftHand.keypoints[4];
    let rIndex = rightHand.keypoints[8];
    let rThumb = rightHand.keypoints[4];

    // Find the outer edges of these 4 fingers to draw a perfect rectangle
    let minX = min(lIndex.x, lThumb.x, rIndex.x, rThumb.x);
    let maxX = max(lIndex.x, lThumb.x, rIndex.x, rThumb.x);
    let minY = min(lIndex.y, lThumb.y, rIndex.y, rThumb.y);
    let maxY = max(lIndex.y, lThumb.y, rIndex.y, rThumb.y);

    let frameWidth = maxX - minX;
    let frameHeight = maxY - minY;

    // Only draw the screen if the frame is large enough (prevents glitching when hands are resting)
    if (frameWidth > 50 && frameHeight > 50) {
      
      // --- THE THERMAL SCREEN EFFECT ---
      // We use the canvas drawing context to "clip" our effect so it ONLY happens inside the rectangle
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.rect(minX, minY, frameWidth, frameHeight);
      drawingContext.clip();

      // Draw a highly saturated rectangle with a DIFFERENCE blend mode.
      // This mathematically inverts the colors of the video underneath it, faking a thermal look.
      blendMode(DIFFERENCE);
      fill(255, 100, 0, 255); // Neon Orange/Red
      noStroke();
      rect(minX, minY, frameWidth, frameHeight);

      // Reset the blend mode back to normal
      blendMode(BLEND); 
      
      // End the clipping mask
      drawingContext.restore();

      // --- THE HUD BORDERS ---
      // Draw a cool high-tech border around the frame
      stroke(0, 255, 0); // Neon Green
      strokeWeight(3);
      noFill();
      rect(minX, minY, frameWidth, frameHeight);
      
      // Draw connection points on your fingertips so it looks tracked
      fill(0, 255, 0);
      noStroke();
      circle(lIndex.x, lIndex.y, 10);
      circle(lThumb.x, lThumb.y, 10);
      circle(rIndex.x, rIndex.y, 10);
      circle(rThumb.x, rThumb.y, 10);
    }
  }
}

function gotHands(results) {
  hands = results;
}
