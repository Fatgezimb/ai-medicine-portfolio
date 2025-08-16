// Draw a simple line chart without external dependencies.
// The chart visualises a hypothetical increase in AI‑related publications in medicine.

function drawChart() {
  const canvas = document.getElementById('aiChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [100, 200, 350, 550, 800, 1100];
  const labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const maxVal = Math.max(...data) * 1.1; // add 10% headroom
  const width = canvas.width;
  const height = canvas.height;
  const margin = 50;
  const chartWidth = width - margin * 2;
  const chartHeight = height - margin * 2;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px Segoe UI';
  ctx.fillStyle = '#333';
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  // draw axes
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();
  // y-axis grid lines and labels
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const y = margin + (chartHeight * i) / ySteps;
    const value = Math.round(maxVal - (maxVal * i) / ySteps);
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillText(value.toString(), 5, y + 4);
  }
  // x-axis grid lines and labels
  for (let i = 0; i < labels.length; i++) {
    const x = margin + (chartWidth * i) / (labels.length - 1);
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, height - margin);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillText(labels[i], x - 15, height - margin + 20);
  }
  // draw line
  ctx.strokeStyle = 'rgba(53, 162, 235, 1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((value, index) => {
    const x = margin + (chartWidth * index) / (data.length - 1);
    const y = margin + chartHeight - (chartHeight * value) / maxVal;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  // draw points
  data.forEach((value, index) => {
    const x = margin + (chartWidth * index) / (data.length - 1);
    const y = margin + chartHeight - (chartHeight * value) / maxVal;
    ctx.fillStyle = '#35a2eb';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Redraw the chart when the page loads or the window is resized
document.addEventListener('DOMContentLoaded', drawChart);
window.addEventListener('resize', () => {
  // To maintain aspect ratio on resize, re-draw chart.
  // Ensure the canvas size stays constant (fixed width/height attributes) in CSS or HTML.
  drawChart();
});