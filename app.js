const resistivity = {
  copper: 0.0175,
  aluminum: 0.0282,
};

const conductorAreas = [0.75, 1, 1.5, 2.5, 4, 6, 10, 16];

const form = document.querySelector("#calculatorForm");
const resetButton = document.querySelector("#resetButton");
const statusPill = document.querySelector("#statusPill");
const verdictLabel = document.querySelector("#verdictLabel");
const comparisonBody = document.querySelector("#comparisonBody");
const chart = document.querySelector("#dropChart");
const ctx = chart.getContext("2d");

const inputs = {
  circuitType: document.querySelector("#circuitType"),
  voltage: document.querySelector("#voltage"),
  power: document.querySelector("#power"),
  length: document.querySelector("#length"),
  area: document.querySelector("#area"),
  material: document.querySelector("#material"),
  limit: document.querySelector("#limit"),
};

const outputs = {
  current: document.querySelector("#currentOutput"),
  drop: document.querySelector("#dropOutput"),
  dropPercent: document.querySelector("#dropPercentOutput"),
  loss: document.querySelector("#lossOutput"),
};

const defaults = {
  circuitType: "dc",
  voltage: 24,
  power: 120,
  length: 18,
  area: 6,
  material: "copper",
  limit: 3,
};

function readInputs() {
  return {
    circuitType: inputs.circuitType.value,
    voltage: positiveNumber(inputs.voltage.value, defaults.voltage),
    power: positiveNumber(inputs.power.value, defaults.power),
    length: positiveNumber(inputs.length.value, defaults.length),
    area: positiveNumber(inputs.area.value, defaults.area),
    material: inputs.material.value,
    limit: positiveNumber(inputs.limit.value, defaults.limit),
  };
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function calculate(values, areaOverride = values.area) {
  const current = values.power / values.voltage;
  const loopLength = values.length * 2;
  const resistance = (resistivity[values.material] * loopLength) / areaOverride;
  const voltageDrop = current * resistance;
  const dropPercent = (voltageDrop / values.voltage) * 100;
  const cableLoss = current * current * resistance;
  const efficiency = (values.power / (values.power + cableLoss)) * 100;

  return {
    area: areaOverride,
    current,
    loopLength,
    resistance,
    voltageDrop,
    dropPercent,
    cableLoss,
    efficiency,
    passes: dropPercent <= values.limit,
  };
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function update() {
  const values = readInputs();
  const result = calculate(values);
  const comparisons = conductorAreas.map((area) => calculate(values, area));

  outputs.current.textContent = `${formatNumber(result.current)} A`;
  outputs.drop.textContent = `${formatNumber(result.voltageDrop)} V`;
  outputs.dropPercent.textContent = `${formatNumber(result.dropPercent)}%`;
  outputs.loss.textContent = `${formatNumber(result.cableLoss)} W`;

  setVerdict(result, values);
  renderTable(comparisons, values.limit);
  drawChart(comparisons, values.limit);
}

function setVerdict(result, values) {
  const selectedLabel = values.circuitType === "dc" ? "DC estimate" : "AC estimate";
  const passText = result.passes ? "Pass" : "Review";

  statusPill.textContent = selectedLabel;
  statusPill.className = "status-pill";
  verdictLabel.textContent = passText;
  verdictLabel.className = result.passes ? "mini-label" : "mini-label is-warning";

  if (!result.passes) {
    statusPill.classList.add("is-warning");
  }
}

function renderTable(rows, limit) {
  comparisonBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const statusClass = row.dropPercent <= limit ? "pass" : "review";
    const statusText = row.dropPercent <= limit ? "Pass" : "Review";

    tr.innerHTML = `
      <td>${formatNumber(row.area, 2)}</td>
      <td>${formatNumber(row.dropPercent)}%</td>
      <td>${formatNumber(row.cableLoss)} W</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
    `;

    comparisonBody.appendChild(tr);
  });
}

function drawChart(rows, limit) {
  const pixelRatio = window.devicePixelRatio || 1;
  const width = chart.clientWidth;
  const height = chart.clientHeight;
  chart.width = Math.floor(width * pixelRatio);
  chart.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 28, right: 24, bottom: 48, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxDrop = Math.max(limit * 1.25, ...rows.map((row) => row.dropPercent)) || 1;

  drawGrid(width, height, padding, plotWidth, plotHeight, maxDrop, limit);

  const barGap = 10;
  const barWidth = Math.max(18, (plotWidth - barGap * (rows.length - 1)) / rows.length);

  rows.forEach((row, index) => {
    const x = padding.left + index * (barWidth + barGap);
    const barHeight = (row.dropPercent / maxDrop) * plotHeight;
    const y = padding.top + plotHeight - barHeight;
    ctx.fillStyle = row.dropPercent <= limit ? "#0f766e" : "#b45309";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#62706a";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(row.area), x + barWidth / 2, height - 20);
  });
}

function drawGrid(width, height, padding, plotWidth, plotHeight, maxDrop, limit) {
  ctx.strokeStyle = "#d7ddd8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + plotHeight);
  ctx.lineTo(width - padding.right, padding.top + plotHeight);
  ctx.stroke();

  ctx.fillStyle = "#62706a";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.textAlign = "right";

  for (let i = 0; i <= 4; i += 1) {
    const value = (maxDrop / 4) * i;
    const y = padding.top + plotHeight - (value / maxDrop) * plotHeight;
    ctx.strokeStyle = "#edf0ed";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(`${formatNumber(value, 1)}%`, padding.left - 8, y + 4);
  }

  const limitY = padding.top + plotHeight - (limit / maxDrop) * plotHeight;
  ctx.strokeStyle = "#b42318";
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(padding.left, limitY);
  ctx.lineTo(width - padding.right, limitY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#17211b";
  ctx.textAlign = "left";
  ctx.font = "700 13px Segoe UI, sans-serif";
  ctx.fillText("Voltage drop by conductor area", padding.left, 18);
  ctx.fillStyle = "#b42318";
  ctx.fillText(`Limit ${formatNumber(limit, 1)}%`, width - padding.right - 72, Math.max(18, limitY - 8));
}

function resetInputs() {
  Object.entries(defaults).forEach(([key, value]) => {
    inputs[key].value = value;
  });
  update();
}

form.addEventListener("input", update);
form.addEventListener("change", update);
resetButton.addEventListener("click", resetInputs);
window.addEventListener("resize", update);

update();
