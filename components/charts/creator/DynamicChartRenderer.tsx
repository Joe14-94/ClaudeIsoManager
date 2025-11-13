import React from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';
import LineChart from './LineChart';
import AreaChart from './AreaChart';
import ScatterPlot from './ScatterPlot';
import BubbleChart from './BubbleChart';
import TreemapChart from './TreemapChart';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

interface DynamicChartRendererProps {
  chartType: 'bar' | 'pie' | 'line' | 'area' | 'scatter' | 'bubble' | 'treemap';
  data: any;
  config: any;
  colorPalette: ColorPalette;
  onChartElementClick: (data: any) => void;
  hiddenLabels: string[];
  setHiddenLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

const DynamicChartRenderer: React.FC<DynamicChartRendererProps> = ({ chartType, data, config, colorPalette, onChartElementClick, hiddenLabels, setHiddenLabels }) => {
  if (!data || (Array.isArray(data) && data.length === 0) || (data.children && data.children.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Aucune donnée à afficher pour la configuration sélectionnée.</p>
      </div>
    );
  }

  switch (chartType) {
    case 'bar':
      return <BarChart data={data} config={config} colorPalette={colorPalette} onBarClick={onChartElementClick} />;
    case 'pie':
      return <PieChart data={data} config={config} colorPalette={colorPalette} onSliceClick={onChartElementClick} hiddenLabels={hiddenLabels} setHiddenLabels={setHiddenLabels} />;
    case 'line':
      return <LineChart data={data} config={config} colorPalette={colorPalette} />;
    case 'area':
      return <AreaChart data={data} config={config} colorPalette={colorPalette} />;
    case 'scatter':
        return <ScatterPlot data={data} config={config} colorPalette={colorPalette} />;
    case 'bubble':
        return <BubbleChart data={data} config={config} colorPalette={colorPalette} />;
    case 'treemap':
        return <TreemapChart data={data} config={config} colorPalette={colorPalette} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p>Veuillez sélectionner un type de graphique pour commencer.</p>
        </div>
      );
  }
};

export default DynamicChartRenderer;