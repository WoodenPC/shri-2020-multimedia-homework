class Video {
  constructor(root, video) {
    this.root = root;
    this.video = video;
    this.canvas = root.querySelector('canvas');
  }

  updateCanvas = () => {
    const context = this.canvas.getContext('2d');
    const { width, height } = this.canvas;
    const update = () => {
        if (this.video && !this.video.paused && !this.video.ended) {
            context.drawImage(this.video, 0, 0, width, height);
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
  }
}