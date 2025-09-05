import React, { useState } from 'react';
import { Calendar, Thermometer, Eye } from 'lucide-react';

interface HeatmapData {
  month: string;
  productName: string;
  quantity: number;
  value: number;
  intensity: number; // 0-1 pour la couleur
}

interface SalesHeatmapProps {
  data: HeatmapData[];
  products: string[];
  months: string[];
  selectedYear: number;
}

export default function SalesHeatmap({ data, products, months, selectedYear }: SalesHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ month: string; product: string } | null>(null);
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('quantity');

  const getCellData = (month: string, product: string) => {
    return data.find(d => d.month === month && d.productName === product);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    
    const colors = [
      'bg-red-100',    // 0-20%
      'bg-orange-200', // 20-40%
      'bg-yellow-300', // 40-60%
      'bg-green-400',  // 60-80%
      'bg-green-500'   // 80-100%
    ];
    
    const colorIndex = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[colorIndex];
  };

  const getTooltipContent = (cellData: HeatmapData | undefined, month: string, product: string) => {
    if (!cellData) {
      return {
        title: `${product} - ${month}`,
        content: 'Aucune vente'
      };
    }

    return {
      title: `${product} - ${month}`,
      content: `${cellData.quantity.toFixed(1)} unités • ${cellData.value.toLocaleString()} MAD`
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Heatmap des Ventes {selectedYear}</h3>
          <p className="text-sm text-gray-600">Intensité des ventes par produit et par mois</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mode d'affichage */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('quantity')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'quantity' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quantité
            </button>
            <button
              onClick={() => setViewMode('value')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'value' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Valeur
            </button>
          </div>
          
          <Thermometer className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header avec les mois */}
          <div className="flex mb-2">
            <div className="w-32 flex-shrink-0"></div> {/* Espace pour les noms de produits */}
            {months.map((month, index) => (
              <div key={index} className="w-20 text-center">
                <div className="text-xs font-medium text-gray-700 transform -rotate-45 origin-center">
                  {month}
                </div>
              </div>
            ))}
          </div>

          {/* Lignes de produits */}
          <div className="space-y-1">
            {products.map((product, productIndex) => (
              <div key={productIndex} className="flex items-center">
                {/* Nom du produit */}
                <div className="w-32 flex-shrink-0 pr-4">
                  <div className="text-sm font-medium text-gray-900 truncate" title={product}>
                    {product}
                  </div>
                </div>

                {/* Cellules pour chaque mois */}
                {months.map((month, monthIndex) => {
                  const cellData = getCellData(month, product);
                  const tooltip = getTooltipContent(cellData, month, product);
                  
                  return (
                    <div
                      key={monthIndex}
                      className={`w-20 h-12 border border-gray-300 cursor-pointer transition-all duration-200 ${
                        getIntensityColor(cellData?.intensity || 0)
                      } ${
                        hoveredCell?.month === month && hoveredCell?.product === product
                          ? 'ring-2 ring-purple-500 ring-offset-1 transform scale-110 z-10 relative'
                          : 'hover:ring-1 hover:ring-purple-300'
                      }`}
                      onMouseEnter={() => setHoveredCell({ month, product })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={tooltip.content}
                    >
                      {/* Contenu de la cellule */}
                      <div className="w-full h-full flex items-center justify-center">
                        {cellData && (
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900">
                              {viewMode === 'quantity' 
                                ? cellData.quantity.toFixed(0)
                                : (cellData.value / 1000).toFixed(0) + 'k'
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip détaillé */}
      {hoveredCell && (
        <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">
              {hoveredCell.product} - {hoveredCell.month}
            </span>
          </div>
          
          {(() => {
            const cellData = getCellData(hoveredCell.month, hoveredCell.product);
            if (!cellData) {
              return <p className="text-sm text-gray-600">Aucune vente ce mois-ci</p>;
            }
            
            return (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{cellData.quantity.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Quantité</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{cellData.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">MAD</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{(cellData.intensity * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">Intensité</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Légende de couleurs */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Intensité des ventes:</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Faible</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <div className="w-4 h-4 bg-yellow-300 rounded"></div>
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
            <span className="text-xs text-gray-500">Forte</span>
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée de vente pour {selectedYear}</p>
        </div>
      )}
    </div>
  );
}