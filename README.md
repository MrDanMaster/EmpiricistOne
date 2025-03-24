# EmpiricistTwo

A React-based economic simulation tool that models and visualizes various economic variables and their relationships over time.

## Features

- Real-time economic variable simulation
- Interactive variable adjustment through sliders
- Time series visualization of economic variables
- Detailed variable information display
- Support for both basic and derived economic variables
- Step-by-step or continuous simulation modes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MrDanMaster/EmpircistTwo.git
cd EmpircistTwo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Usage

1. Use the sliders to adjust the values of basic economic variables
2. Select variables to plot on the time series graph
3. Click "Start" to begin the simulation
4. Choose between running for a specific number of steps or continuously
5. Use "Reset" to clear the simulation history
6. Use "Reset to Pre-Simulation" to restore initial variable values

## Project Structure

```
src/
  ├── components/         # React components
  │   ├── Simulation.tsx # Main simulation component
  │   ├── Slider.tsx     # Variable adjustment slider
  │   └── VariableDetails.tsx # Variable information display
  ├── types/             # TypeScript type definitions
  │   ├── EconomicTypes.ts
  │   └── ComponentTypes.ts
  ├── App.tsx           # Main application component
  └── index.tsx         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
