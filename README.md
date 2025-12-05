# ChartYap

**ChartYap** is an intelligent data visualization tool that bridges the gap between raw data and desired aesthetics. 
It combines **Simultaneous Data & Image Upload** to understand not just *what* you want to visualize, but *how* you want it to look.

![App Screenshot](public/vite.svg) *<!-- Replace with actual screenshot later -->*

## 🚀 Features

*   **Dual Input Engine**: Upload your dataset (Excel, CSV, JSON) and an inspiration image side-by-side.
*   **Style Matcher**: The system analyzes your uploaded image (e.g., a "Density Plot" or "Pie Chart") and automatically prioritizes that chart type for your data.
*   **20+ Supported Chart Types**:
    *   **Basics**: Bar, Line, Area, Scatter, Pie, Donut.
    *   **Advanced**: Density Plots, Heatmaps, Trellis (Faceted) Charts, Radial Bars.
    *   **Complex**: Dual Axis, 100% Stacked Area/Bar, Pyramid Charts.
*   **Smart Analysis**: Automatically detects categorical, numerical, and date columns to suggest the most relevant visualizations.
*   **Swiss Design**: A minimalist, high-contrast UI inspired by the International Typographic Style.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (v4)
*   **Visualization**: Vega-Lite (via React-Vega)
*   **Icons**: Lucide React
*   **Data Parsing**: SheetJS (XLSX)

## 📦 Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/mustafa-karakoyun/ChartYap.git
    cd ChartYap
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 🧠 How It Works

1.  **Drag & Drop Data**: Drop your Excel or CSV file into the left box.
2.  **Drag & Drop Style**: Drop a chart image (screenshot, photo) into the right box.
3.  **Analysis**:
    *   The app mimics a vision analysis to identify the chart type in your image.
    *   It analyzes your data's structure (columns, types).
4.  **Generation**: It generates a list of recommended charts, boosting the ranking of the chart type that matches your uploaded image.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
