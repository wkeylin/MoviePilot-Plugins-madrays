// 此脚本用于生成TOTP助手浏览器扩展所需的图标
// 使用方法: 在浏览器中打开此文件，然后点击生成按钮
// 图标生成后会自动下载

document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>生成TOTP图标</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .preview {
      display: flex;
      margin: 20px 0;
      align-items: center;
    }
    canvas {
      border: 1px solid #ccc;
      margin-right: 20px;
    }
    button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 10px 0;
    }
    .instructions {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>TOTP助手图标生成器</h1>
  
  <div class="instructions">
    <h3>使用说明：</h3>
    <ol>
      <li>点击下方"生成图标"按钮</li>
      <li>图标将自动下载到您的下载文件夹</li>
      <li>将下载的图标文件移动到TOTP/icons目录中</li>
    </ol>
  </div>
  
  <div class="preview">
    <canvas id="icon16" width="16" height="16"></canvas>
    <span>16x16 图标</span>
  </div>
  
  <div class="preview">
    <canvas id="icon48" width="48" height="48"></canvas>
    <span>48x48 图标</span>
  </div>
  
  <div class="preview">
    <canvas id="icon128" width="128" height="128"></canvas>
    <span>128x128 图标</span>
  </div>
  
  <button onclick="generateAndDownloadIcons()">生成图标</button>
  
  <script>
    // 绘制图标
    function drawIcon(canvas, size) {
      const ctx = canvas.getContext('2d');
      
      // 背景
      ctx.fillStyle = '#4285F4'; // Google蓝色
      ctx.fillRect(0, 0, size, size);
      
      // 内圆
      ctx.beginPath();
      ctx.arc(size/2, size/2, size*0.4, 0, Math.PI*2);
      ctx.fillStyle = 'white';
      ctx.fill();
      
      // 指针
      ctx.save();
      ctx.translate(size/2, size/2);
      ctx.rotate(Math.PI * 1.5 + Math.PI * 0.75); // 指向10点钟方向
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size*0.35);
      ctx.lineWidth = size*0.07;
      ctx.strokeStyle = '#DB4437'; // Google红色
      ctx.lineCap = 'round';
      ctx.stroke();
      
      ctx.restore();
      
      // 中心点
      ctx.beginPath();
      ctx.arc(size/2, size/2, size*0.05, 0, Math.PI*2);
      ctx.fillStyle = '#DB4437'; // Google红色
      ctx.fill();
      
      // 添加数字标记
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.font = \`bold \${size*0.15}px Arial\`;
      
      // 添加"2FA"文字
      ctx.fillText("2FA", size/2, size/2 + size*0.2);
      
      return canvas;
    }
    
    // 生成并下载所有图标
    function generateAndDownloadIcons() {
      const sizes = [16, 48, 128];
      
      sizes.forEach(size => {
        const canvas = document.getElementById(\`icon\${size}\`);
        drawIcon(canvas, size);
        
        // 下载图标
        const link = document.createElement('a');
        link.download = \`icon\${size}.png\`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
      
      alert("图标已生成，请检查您的下载文件夹，并将图标移动到TOTP/icons目录");
    }
    
    // 初始化预览
    window.onload = function() {
      drawIcon(document.getElementById('icon16'), 16);
      drawIcon(document.getElementById('icon48'), 48);
      drawIcon(document.getElementById('icon128'), 128);
    };
  </script>
</body>
</html>
`); 