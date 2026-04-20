/* �Ż���ѩ��Ч�� - ����ԭ��ʽһ����ʽ���ĸ�����Canvasʵ�� */
function OptimizedSnowEffect() {
  this.canvas = null;
  this.ctx = null;

  // ��ʽһ���ã�ģ��DOM &#10052; ѩ����
  this.style1Config = {
    maxFlakes: 8,         // ��һ������������������
    minSize: 18,
    maxSize: 40,
    newOn: 500,           // �������ɼ��
    flakeColor: "#AFDAEF"
  };

  // ��ʽ�����ã�Բ��ѩ����
  this.style2Config = {
    maxFlakes: 25,        // ����������������
    flakeSize: 8,
    fallSpeed: .7
  };

  this.style1Flakes = [];
  this.style2Flakes = [];
  this.animationId = null;
  this.isVisible = true;
  this.lastStyle1Create = 0;

  // ���ܼ��
  this.lastFrameTime = 0;
  this.frameCount = 0;
  this.isScrolling = false;
  this.scrollTimer = null;

  this.init();
}

OptimizedSnowEffect.prototype.init = function () {
  this.createCanvas();
  this.createStyle2Flakes();
  this.bindEvents();
  this.animate();
};

OptimizedSnowEffect.prototype.createCanvas = function () {
  this.canvas = document.createElement('canvas');
  this.canvas.id = 'optimized-snow-canvas';
  this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -999;
        pointer-events: none;
        background: transparent;
        will-change: transform;
    `;

  this.updateCanvasSize();
  document.body.appendChild(this.canvas);
  this.ctx = this.canvas.getContext('2d');

  // �Ż�Canvas���ã�������˸
  this.ctx.imageSmoothingEnabled = true;
  this.ctx.imageSmoothingQuality = 'high';
};

OptimizedSnowEffect.prototype.updateCanvasSize = function () {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
};

// ������ʽһѩ����ģ��ԭDOMЧ����
OptimizedSnowEffect.prototype.createStyle1Flake = function () {
  const config = this.style1Config;
  const startX = Math.random() * this.canvas.width - 100;
  return {
    type: 'style1',
    x: startX,
    y: -50,
    size: config.minSize + Math.random() * (config.maxSize - config.minSize),
    baseOpacity: 0.5 + Math.random() * 0.5, // ����͸���ȣ����ٱ仯
    opacity: 0.5 + Math.random() * 0.5, color: config.flakeColor,
    startX: startX,
    endY: this.canvas.height + 50, // ��ѩ���䵽��Ļ�ײ�����
    endX: startX - 500 + Math.random() * 1000,
    duration: this.canvas.height * 10 + Math.random() * 5000, startTime: Date.now(),
    // ������ת�������
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.005, // ������ת�ٶȣ�����Ȼ
    initialRotation: Math.random() * Math.PI * 2 // ��ʼ��ת�Ƕ�
  };
};

// ������ʽ��ѩ��
OptimizedSnowEffect.prototype.createStyle2Flakes = function () {
  this.style2Flakes = [];
  const config = this.style2Config;
  for (let i = 0; i < config.maxFlakes; i++) {
    this.style2Flakes.push({
      type: 'style2',
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * config.flakeSize + 2,
      maxSize: config.flakeSize,
      speed: Math.random() * 1 + config.fallSpeed,
      velY: Math.random() * 1 + config.fallSpeed,
      velX: 0, stepSize: Math.random() / 30 + 0.01, // ������С�ڰڷ���
      step: Math.random() * Math.PI * 2, // �����ʼ��λ
      // ���Ӹ��������˶�����
      swaySpeed: 0.02 + Math.random() * 0.06, // �ڶ��ٶȱ仯
      swayAmplitude: 0.3 + Math.random() * 0.4, // ��С�ڶ����ȣ�ȷ����Ҫ�Ǵ�ֱ����
      verticalVariation: Math.random() * 0.2 + 0.8, // ��ߴ�ֱ�ٶȱ仯ϵ����ȷ�������˶�
      horizontalDrift: (Math.random() - 0.5) * 0.03 // �����СˮƽƯ������
    });
  }
};


OptimizedSnowEffect.prototype.updateStyle1Flake = function (flake) {
  const elapsed = Date.now() - flake.startTime;
  const progress = Math.min(1, elapsed / flake.duration);

  // ����Ƿ���ɶ����򳬳���Ļ�ײ�
  if (progress >= 1 || flake.y > this.canvas.height + 100) {
    return false; // ���Ϊ��Ҫ�Ƴ�
  }

  // ���Բ�ֵ����λ�ã�ʹ�û���͸���ȱ�����˸
  flake.x = flake.startX + (flake.endX - flake.startX) * progress;
  flake.y = -50 + (flake.endY + 50) * progress;
  // ʹ�ù̶��Ļ���͸���ȣ�ֻ���½�����ƽ���仯
  flake.opacity = Math.max(0.2, flake.baseOpacity * (1 - progress * 0.8));

  // ������ת�Ƕ�
  flake.rotation = flake.initialRotation + elapsed * flake.rotationSpeed;

  return true;
};

// ������ʽ��ѩ��
OptimizedSnowEffect.prototype.updateStyle2Flake = function (flake) {    // ʹ�ø��Ի����˶�����
  flake.velX *= 0.95; // ����ˮƽ����������ˮƽƮ��
  if (flake.velY <= flake.speed * flake.verticalVariation) {
    flake.velY = flake.speed * flake.verticalVariation;
  }

  // �����ӵİڶ�����
  flake.step += flake.swaySpeed;
  flake.velX += Math.cos(flake.step) * flake.stepSize * flake.swayAmplitude;
  flake.velX += flake.horizontalDrift; // ����ˮƽƯ��

  flake.y += flake.velY;
  flake.x += flake.velX;

  // �ɳ��߽�Ĵ���
  if (flake.x >= this.canvas.width || flake.x <= 0 || flake.y >= this.canvas.height || flake.y <= 0) {
    flake.x = Math.random() * this.canvas.width;
    flake.y = 0;
    flake.size = Math.random() * flake.maxSize + 2;
    flake.speed = Math.random() * 1 + this.style2Config.fallSpeed;
    flake.velY = flake.speed * flake.verticalVariation;
    flake.velX = 0;        // ����������˶�����
    flake.step = Math.random() * Math.PI * 2;
    flake.swaySpeed = 0.02 + Math.random() * 0.06;
    flake.swayAmplitude = 0.3 + Math.random() * 0.4;
    flake.verticalVariation = Math.random() * 0.2 + 0.8;
    flake.horizontalDrift = (Math.random() - 0.5) * 0.03;
  }
};

// ������ʽһѩ������ȷģ�� &#10052; ���ţ�
OptimizedSnowEffect.prototype.drawStyle1Flake = function (flake) {
  this.ctx.save();
  this.ctx.globalAlpha = flake.opacity;
  this.ctx.fillStyle = flake.color;
  this.ctx.strokeStyle = flake.color;
  this.ctx.lineWidth = Math.max(1, flake.size * 0.05);
  this.ctx.lineCap = 'round';
  this.ctx.translate(flake.x, flake.y);

  // Ӧ����ת
  this.ctx.rotate(flake.rotation);

  // ���� &#10052; ��ʽ��8������ѩ��
  const size = flake.size / 2.2;
  this.ctx.beginPath();

  // 8�����ߣ�ģ�� &#10052; ���ŵ���״��
  for (let i = 0; i < 8; i++) {
    this.ctx.save();
    this.ctx.rotate((i * Math.PI) / 4);

    // ������
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(0, size);

    // ����Сװ�Σ�ֻ����Ҫ����
    if (i % 2 === 0) {
      // ����װ��
      this.ctx.moveTo(0, -size * 0.7);
      this.ctx.lineTo(-size * 0.15, -size * 0.55);
      this.ctx.moveTo(0, -size * 0.7);
      this.ctx.lineTo(size * 0.15, -size * 0.55);

      // �ײ�װ��
      this.ctx.moveTo(0, size * 0.7);
      this.ctx.lineTo(-size * 0.15, size * 0.55);
      this.ctx.moveTo(0, size * 0.7);
      this.ctx.lineTo(size * 0.15, size * 0.55);
    }

    this.ctx.restore();
  }

  this.ctx.stroke();

  // ����װ�ε�
  this.ctx.beginPath();
  this.ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
  this.ctx.fill();

  this.ctx.restore();
};

// ������ʽ��ѩ������ȫ��ԭ���뽥��Ч����
OptimizedSnowEffect.prototype.drawStyle2Flake = function (flake) {
  const gradient = this.ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.size);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  this.ctx.save();
  this.ctx.fillStyle = gradient;
  this.ctx.beginPath();
  this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
  this.ctx.fill();
  this.ctx.restore();
};

OptimizedSnowEffect.prototype.animate = function () {
  if (!this.isVisible) return;

  const now = performance.now();

  // ���ܼ�� - ���֡�ʹ��ͣ�����һЩ֡
  if (this.lastFrameTime && now - this.lastFrameTime < 16.67) {
    this.animationId = requestAnimationFrame(() => this.animate());
    return;
  }
  this.lastFrameTime = now;

  // ����ʱ��������Ҫ��
  if (this.isScrolling) {
    // ����ʱֻ���£������ƣ����߽���֡��
    if (this.frameCount % 2 !== 0) {
      this.frameCount++;
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
  }
  this.frameCount++;

  // ����Ч�������ʽ
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  const nowTime = Date.now();

  // ��Ƶ�ʴ�����ʽһѩ��
  if (nowTime - this.lastStyle1Create > this.style1Config.newOn &&
    this.style1Flakes.length < this.style1Config.maxFlakes) {
    this.style1Flakes.push(this.createStyle1Flake());
    this.lastStyle1Create = nowTime;
  }

  // ���ºͻ�����ʽһѩ��
  this.style1Flakes = this.style1Flakes.filter(flake => {
    if (this.updateStyle1Flake(flake)) {
      this.drawStyle1Flake(flake);
      return true;
    }
    return false;
  });

  // ���ºͻ�����ʽ��ѩ��
  for (let flake of this.style2Flakes) {
    this.updateStyle2Flake(flake);
    this.drawStyle2Flake(flake);
  }

  this.animationId = requestAnimationFrame(() => this.animate());
};

OptimizedSnowEffect.prototype.bindEvents = function () {
  window.addEventListener('resize', () => {
    this.updateCanvasSize();
  });


  // ҳ��ɼ��Ա仯ʱ��ͣ/�ָ�
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  });

  // �����Ż����ڵ͵��������������豸���Զ�����
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    this.style1Config.maxFlakes = 4;
    this.style2Config.maxFlakes = 15;
  }
};

OptimizedSnowEffect.prototype.pause = function () {
  this.isVisible = false;
  if (this.animationId) {
    cancelAnimationFrame(this.animationId);
  }
};

OptimizedSnowEffect.prototype.resume = function () {
  this.isVisible = true;
  this.animate();
};

OptimizedSnowEffect.prototype.destroy = function () {
  this.pause();
  if (this.canvas) {
    document.body.removeChild(this.canvas);
    this.canvas = null;
    this.ctx = null;
  }
  this.style1Flakes = [];
  this.style2Flakes = [];
};

// ���³�ʼ��ѩ��Ч��
OptimizedSnowEffect.prototype.reinitialize = function () {
  this.destroy();
  this.init();
};

// �����Ż���ѩ��Ч��
const optimizedSnow = new OptimizedSnowEffect();

// optimizedSnow
