const TRESHOLD = 20;

class Video {
  constructor(root, video) {
    this.root = root;
    this.video = video;
    this.canvas = root.querySelector('canvas');
    this.volumeLevel = 0;
    this.audioContext = null;
    this.lastImagePixelData = null;
  }

  updateCanvas = () => {
    const context = this.canvas.getContext('2d');
    const { width, height } = this.canvas;
    const update = () => {
          context.clearRect(0, 0, width, height);
          context.drawImage(this.video, 0, 0, width, height);
          if (this.video && !this.video.paused && !this.video.ended) {
            if (this.lastImagePixelData === null) {
              this.lastImagePixelData = this.getImagePixelsData(context, width, height);
            } else {
              const newImagePixelData = this.getImagePixelsData(context, width, height);
              const rect = this.getImageDiffRect(this.lastImagePixelData, newImagePixelData);
              context.strokeStyle = 'blue';
              context.strokeRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
              this.lastImagePixelData = newImagePixelData;
            }
          context.fillStyle = 'green';
          context.fillRect(0, 0, 10, this.volumeLevel);
        }
        requestAnimationFrame(update);
    }
    update();
  }

  recalculateStyles = (elem) => {
    const rect = elem.getBoundingClientRect();
    elem.style.width = `${rect.width}px`;
    elem.style.height = `${rect.height}px`;
    elem.style.top = `${rect.top}px`;
    elem.style.left = `${rect.left}px`;
  }

  getAverageVolume = (buffer) => {
    let sum = 0;
    let len = buffer.length;
    for (let i = 0; i < len; i++) {
        sum += buffer[i];
    }

    return sum / len;
  }

  init = () => {
    const btnAllCameras = this.root.querySelector('.BtnAllCameras');
    const inputBrightness = this.root.querySelector('.Input-Brightness');
    const inputContrast = this.root.querySelector('.Input-Contrast');
    const playButton = this.root.querySelector('.Button-Play');
    const pauseButton = this.root.querySelector('.Button-Pause');
    this.recalculateStyles(this.root);
    this.canvas.addEventListener('click', () => {
      this.root.classList.add('Video_fullscreen');
    });

    if (btnAllCameras !== null) {
        btnAllCameras.addEventListener('click', () => {
          this.root.classList.remove('Video_fullscreen');
        });
    }

    if (inputBrightness !== null) {
        inputBrightness.addEventListener('change', (e) => {
            const ctx = this.canvas.getContext('2d');
            ctx.filter = `brightness(${e.target.value})`;
        });
    }

    if (inputContrast !== null) {
        inputContrast.addEventListener('change', (e) => {
            const ctx = this.canvas.getContext('2d');
            ctx.filter = `contrast(${e.target.value})`;
        })
    }

    if (playButton !== null) {
      playButton.addEventListener('click', () => {
        this.video.play();
        if (this.audioContext === null) {
          this.createAudioContext();
        }
      });
    }

    if (pauseButton !== null) {
      pauseButton.addEventListener('click', () => {
        this.video.pause();
      });
    }
  }

  getImagePixelsData = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const pixelData = imageData.data;
    let x = 0, y = 0;
    const data = [];
    for (let i = 0; i < pixelData.length; i+=4) {
      if (i % (width * 4) === 0) {
        y++;
        x = 0;
      }
      const obj = {x, y, data: ''};
      obj.data = 0.299 * pixelData[i] + 0.587 * pixelData[i + 1] + 0.114 * pixelData[i + 2];
      x++;
      data.push(obj);
    }

    return data;
  }

  getImageDiffRect = (imageData1, imageData2) => {
    const rect = { x1: Number.MAX_VALUE, x2: Number.MIN_VALUE, y1: Number.MAX_VALUE, y2: Number.MIN_VALUE };
    for (let i = 0; i < imageData1.length; i++) {
      if (Math.abs(imageData1[i].data - imageData2[i].data) > TRESHOLD) {
        rect.x1 = Math.min(rect.x1, imageData1[i].x);
        rect.x2 = Math.max(rect.x2, imageData1[i].x);
        rect.y1 = Math.min(rect.y1, imageData1[i].y);
        rect.y2 = Math.max(rect.y2, imageData1[i].y);
      }
    }

    return rect;
  }

  createAudioContext = () => {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = this.audioContext .createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 32;
    const source = this.audioContext .createMediaElementSource(this.video);
    const processor = this.audioContext.createScriptProcessor(512, 1, 1);
    source.connect(analyser);
    analyser.connect(processor);
    source.connect(this.audioContext .destination);
    processor.connect(this.audioContext .destination);
    processor.onaudioprocess = (e) => {
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buffer);
      const average = this.getAverageVolume(buffer);
      this.volumeLevel = average;
    }
  }
}