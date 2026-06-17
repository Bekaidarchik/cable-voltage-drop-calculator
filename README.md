# Cable Voltage Drop Calculator

A beginner-friendly electrical engineering portfolio project that estimates cable voltage drop, power loss, and efficiency for small DC and single-phase AC circuits.

**Live demo:** https://bekaidarchik.github.io/cable-voltage-drop-calculator/

## Portfolio Summary

- Built an interactive browser calculator for practical cable voltage-drop checks in low-voltage DC and single-phase AC estimates.
- Used HTML, CSS, JavaScript, engineering formulas, responsive UI layout, conductor comparison tables, and canvas chart rendering.
- Demonstrated clear design tradeoffs by calculating load current, voltage drop, cable loss, efficiency, and pass/review status against a selected drop limit.

## Why this project matters

Voltage drop is a practical design check for lighting, battery systems, control circuits, and small distribution runs. This tool helps compare conductor sizes and quickly see whether a design stays inside a selected voltage-drop limit.

## Features

- Calculates load current from power and supply voltage.
- Estimates cable resistance using copper or aluminum resistivity.
- Handles one-way cable length and the full outgoing-and-return path.
- Shows voltage drop, percent drop, cable loss, and efficiency.
- Compares common conductor sizes in a recommendation table.
- Draws a simple voltage-drop chart in the browser.

## Formula Summary

For a two-wire circuit:

```text
Current, I = P / V
Loop length = 2 x one-way length
Resistance, R = rho x loop length / area
Voltage drop = I x R
Power loss = I^2 x R
Efficiency = load power / (load power + cable loss)
```

For single-phase AC, the calculator uses the same resistive approximation. It is suitable for early estimates and portfolio demonstration. Real designs should also check insulation rating, installation method, ambient temperature, protection devices, local code, and manufacturer data.

## How to Run

Open `index.html` in any modern browser, or use the GitHub Pages demo above.

## Suggested Portfolio Description

Built an interactive electrical engineering calculator that applies voltage-drop and cable-loss formulas to compare copper and aluminum conductors. The project demonstrates engineering calculations, UI design, JavaScript, and clear documentation for practical design decisions.

## Project Structure

```text
.
|-- index.html
|-- styles.css
|-- app.js
|-- README.md
`-- .gitignore
```
