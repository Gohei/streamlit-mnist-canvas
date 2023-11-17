class StreamlitCanvas {
  constructor() {
    this.ctx = null;
    this.strokeWidth = 10;
    this.strokeColor = "#ffffff";
    this.backgroundColor = null;
    this.isDrawing = false;
    this.sendData = false;
    this.lines = [];
  }

  onRender(event) {
    if (this.sendData) {
      this.sendData = false;
      return;
    }

    const { 
      strokeWidth, strokeColor, backgroundColor, canvasWidth, canvasHeight, 
      buttonHeight, submitButtonLabel, submitBackgroundColor, 
      clearButtonLabel, clearBackgroundColor 
    } = event.detail.args;

    this.initializeCanvasProperties(strokeWidth, strokeColor, backgroundColor);
    this.setupCanvas(canvasWidth, canvasHeight);
    this.setupButtons(buttonHeight, submitButtonLabel, submitBackgroundColor, clearButtonLabel, clearBackgroundColor);
    this.setFrameHeight(canvasHeight, buttonHeight);
  }
  
  initializeCanvasProperties(strokeWidth, strokeColor, backgroundColor) {
    this.strokeWidth = strokeWidth;
    this.strokeColor = strokeColor;
    this.backgroundColor = backgroundColor;
  }

  setupCanvas(canvasWidth, canvasHeight) {
    const canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    this.backgroundColor = this.backgroundColor;
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.setupCanvasEvents(canvas);
  }

  setupCanvasEvents(canvas) {
    const getPoint = (event) => {
      if (event.touches) {
        return { x: event.touches[0].clientX - canvas.getBoundingClientRect().left, 
                 y: event.touches[0].clientY - canvas.getBoundingClientRect().top };
      } else {
        return { x: event.offsetX, y: event.offsetY };
      }
    };
  
    const startDrawing = (event) => {
      this.isDrawing = true;
      this.lastPoint = getPoint(event);
      event.preventDefault();
    };
  
    const getMidPoints = (pointA, pointB) => {
      const midX = (pointA.x + pointB.x) / 2;
      const midY = (pointA.y + pointB.y) / 2;
      return { x: midX, y: midY };
    };
    
    const drawLine = (newPoint) => {
  
      const midPoint1 = getMidPoints(this.lastPoint, newPoint);
      const midPoint2 = getMidPoints(newPoint, this.lastPoint);
  
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      this.ctx.quadraticCurveTo(this.lastPoint.x, this.lastPoint.y, midPoint1.x, midPoint1.y);
      this.ctx.quadraticCurveTo(midPoint2.x, midPoint2.y, newPoint.x, newPoint.y);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
  
      this.lastPoint = newPoint;
      if (this.isDrawing) {
        this.lines.push({ start: this.lastPoint, end: newPoint });
      }
    };
  
    const stopDrawing = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
      }
    };
  
    // Adding event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', (event) => {
      if (this.isDrawing) {
        drawLine(getPoint(event));
      }
    });
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', (event) => {
      if (this.isDrawing) {
        drawLine(getPoint(event));
      }
    });
    canvas.addEventListener('touchend', stopDrawing);
  }

  setupButtons(buttonHeight, submitButtonLabel, submitBackgroundColor, clearButtonLabel, clearBackgroundColor) {
    const buttonContainer = this.createButtonContainer();
  
    const submitButton = this.createButton(
      'submitButton', submitButtonLabel, submitBackgroundColor, buttonHeight, 0.6
    );
    submitButton.addEventListener('click', () => this.sendDrawingData(canvas));
  
    const clearButton = this.createButton(
      'clearButton', clearButtonLabel, clearBackgroundColor, buttonHeight, 0.4
    );
    clearButton.addEventListener('click', () => this.clearCanvas());
  
    buttonContainer.appendChild(submitButton);
    buttonContainer.appendChild(clearButton);
  
    canvas.parentNode.insertBefore(buttonContainer, canvas.nextSibling);
  }

  createButtonContainer() {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.width = `${canvas.width}px`;
    return buttonContainer;
  }

  createButton(id, label, backgroundColor, buttonHeight, widthRatio) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = label;
    button.classList.add('button');
    button.style.height = `${buttonHeight}px`;
    button.style.width = `${canvas.width * widthRatio}px`;
    button.style.fontSize = this.adjustButtonFontSize(button, 20, 1);
    button.style.color = 'black';
    button.style.backgroundColor = backgroundColor;
    button.style.borderRadius = `${buttonHeight * 0.5}px`;
    return button;
  }

  setFrameHeight(canvasHeight, buttonHeight) {
    const autoMargin = 18;
    const buttonMarginTop = 10;
    const totalBorderSize = 4;
    const totalHeight = canvasHeight + autoMargin + buttonHeight + buttonMarginTop + totalBorderSize;
    Streamlit.setFrameHeight(totalHeight);
  }

  sendDrawingData(canvas) {
    const imageData = canvas.toDataURL();
    const value = {
      is_submitted: true,
      image_data: imageData
    };
    this.sendData = true;
    Streamlit.setComponentValue(value);
  }

  sendNoDrawingData() {
    const value = {
      is_submitted: false,
      image_data: null
    };
    this.sendData = true;
    Streamlit.setComponentValue(value);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.lines = [];
    this.sendNoDrawingData();
  }

  measureTextWidth(text, fontFamily, fontSize) {
    const testElement = document.createElement('span');
    testElement.style.fontFamily = fontFamily;
    testElement.style.fontSize = fontSize + 'px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.whiteSpace = 'nowrap';
    testElement.textContent = text;
    document.body.appendChild(testElement);

    const width = testElement.offsetWidth;
    document.body.removeChild(testElement);

    return width;
  }

  adjustButtonFontSize(button, maxFontSize, minFontSize) {
    let fontSize = maxFontSize;
    const text = button.textContent || button.innerText;
    const fontFamily = window.getComputedStyle(button).fontFamily;
    const buttonWidth = parseInt(button.style.width, 10) * 0.8;
    const buttonHeight = parseInt(button.style.height, 10);
  
    fontSize = Math.min(fontSize, buttonHeight);
  
    while (fontSize > minFontSize) {
      const textWidth = this.measureTextWidth(text, fontFamily, fontSize);
      if (textWidth <= buttonWidth) {
        break;
      }
      fontSize--;
    }
    button.style.fontSize = `${fontSize}px`;
  }
}

let streamlitCanvas = new StreamlitCanvas();
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, (event) => streamlitCanvas.onRender(event));
Streamlit.setComponentReady();
