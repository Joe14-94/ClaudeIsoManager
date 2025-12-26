import React, { useState, useMemo, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useData } from '../contexts/DataContext';
import { WIDGET_REGISTRY, WidgetConfig } from '../components/dashboard/widgets/WidgetRegistry';
import AddWidgetModal from '../components/dashboard/AddWidgetModal';
// FIX: Import the 'Check' icon to resolve a "Cannot find name" error and remove unused icon imports.
import { Edit, Plus, Trash2, Move, Check } from 'lucide-react';
import WidgetContainer from '../components/dashboard/WidgetContainer';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetItem {
  id: string;
  config: WidgetConfig;
}

const CustomDashboardPage: React.FC = () => {
  const { dashboardLayouts, setDashboardLayouts } = useData();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  
  const widgets: WidgetItem[] = useMemo(() => {
    const mainLayout = dashboardLayouts[currentBreakpoint] || dashboardLayouts['lg'] || [];
    return mainLayout
      .map(item => {
        const widgetConfig = WIDGET_REGISTRY.find(w => w.id === item.i);
        return widgetConfig ? { id: widgetConfig.id, config: widgetConfig } : null;
      })
      .filter((w): w is WidgetItem => w !== null);
  }, [dashboardLayouts, currentBreakpoint]);
  
  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: { [breakpoint: string]: Layout[] }) => {
    if (isEditMode) {
      setDashboardLayouts(allLayouts);
    }
  }, [isEditMode, setDashboardLayouts]);

  const onBreakpointChange = useCallback((newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  }, []);

  const addWidget = (widgetConfig: WidgetConfig) => {
    const newItem: Layout = {
      i: widgetConfig.id,
      x: (widgets.length * widgetConfig.defaultLayout.w) % 12,
      y: Infinity, // Place le nouvel élément en bas
      ...widgetConfig.defaultLayout
    };
    
    setDashboardLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts };
      const definedBreakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
      
      definedBreakpoints.forEach(bp => {
        newLayouts[bp] = [...(newLayouts[bp] || []).filter(l => l.i !== newItem.i), { ...newItem }];
      });
      return newLayouts;
    });
  };

  const removeWidget = (widgetId: string) => {
    setDashboardLayouts(prevLayouts => {
        const newLayouts = { ...prevLayouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetId);
        });
        return newLayouts;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={20} /> Ajouter un widget
              </button>
              <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Check size={20} /> Terminer
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
              <Edit size={20} /> Modifier le tableau de bord
            </button>
          )}
        </div>
      </div>
      
      {widgets.length === 0 ? (
         <div className="flex items-center justify-center h-96 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
            <div className="text-center">
                <p className="text-lg font-medium text-slate-500">Votre tableau de bord est vide.</p>
                <p className="text-sm text-slate-400 mt-1">
                    {isEditMode
                        ? "Cliquez sur 'Ajouter un widget' pour commencer."
                        : "Passez en mode édition pour ajouter des widgets."
                    }
                </p>
            </div>
        </div>
      ) : (
        <ResponsiveGridLayout
          className={`layout transition-all duration-300 ${isEditMode ? 'border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 p-2' : ''}`}
          layouts={dashboardLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          onBreakpointChange={onBreakpointChange}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          draggableCancel=".non-draggable"
          draggableHandle=".drag-handle"
          margin={[16, 16]}
        >
          {widgets.map(widget => (
            <div key={widget.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col relative group">
              {isEditMode && (
                <>
                  <div className="absolute top-2 right-2 z-20">
                    <button onClick={() => removeWidget(widget.id)} title="Supprimer le widget" className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                   <div className="drag-handle absolute top-2 left-1/2 -translate-x-1/2 z-20 h-5 w-12 bg-slate-200/80 flex items-center justify-center cursor-move text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Move size={14} />
                   </div>
                </>
              )}
              <WidgetContainer>
                <widget.config.component {...widget.config.props} isEditMode={isEditMode} />
              </WidgetContainer>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
      
      <AddWidgetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWidget={addWidget}
        existingWidgetIds={widgets.map(w => w.id)}
      />
    </div>
  );
};

export default CustomDashboardPage;