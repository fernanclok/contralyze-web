'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Registrar los componentes necesarios de ChartJS
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Paleta de colores consistente con la aplicación
const appColors = {
  // Colores primarios
  primary: '#2563eb',    // Azul principal
  secondary: '#4f46e5',  // Indigo
  
  // Estados
  success: '#16a34a',    // Verde para aprobados/activos
  warning: '#eab308',    // Amarillo para pendientes
  danger: '#dc2626',     // Rojo para rechazados
  info: '#0891b2',       // Cyan para información
  
  // Categorías
  category1: '#2563eb',  // Azul
  category2: '#7c3aed',  // Violeta
  category3: '#0891b2',  // Cyan
  category4: '#059669',  // Esmeralda
  category5: '#84cc16',  // Lima
  category6: '#eab308',  // Ámbar
  
  // Estados adicionales
  inactive: '#94a3b8',   // Gris para inactivos
  expired: '#f97316',    // Naranja para expirados
};

interface BudgetPieChartProps {
  title: string;
  data: ChartData<'pie'>;
  showPercentage?: boolean;
  withCard?: boolean;
}

export function BudgetPieChart({ title, data, showPercentage = true, withCard = true }: BudgetPieChartProps) {
  const total = data.datasets[0].data.reduce((sum: number, value: any) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
  
  const chartContent = (
    <div className="h-[280px] flex items-center justify-center">
      <Pie 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 12
                },
                generateLabels: showPercentage ? (chart) => {
                  const datasets = chart.data.datasets;
                  return chart.data.labels?.map((label, i) => {
                    const value = datasets[0].data[i] as number;
                    const percentage = Math.round((value / total) * 100);
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: datasets[0].backgroundColor 
                        ? Array.isArray(datasets[0].backgroundColor) 
                          ? datasets[0].backgroundColor[i] as string
                          : datasets[0].backgroundColor as string
                        : '#000',
                      hidden: false,
                      lineCap: 'butt',
                      lineDash: [],
                      lineDashOffset: 0,
                      lineJoin: 'miter',
                      lineWidth: 1,
                      strokeStyle: '#fff',
                      index: i
                    };
                  }) || [];
                } : undefined,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }}
      />
    </div>
  );

  if (!withCard) {
    return chartContent;
  }
  
  return (
    <Card className="h-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-100">
      <CardHeader className="pb-2 space-y-1.5 px-6 pt-6">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {chartContent}
      </CardContent>
    </Card>
  );
}

// Componente para gráfico de barras
interface BudgetBarChartProps {
  title: string;
  data: ChartData<'bar'>;
  showPercentage?: boolean;
  withCard?: boolean;
}

export function BudgetBarChart({ title, data, showPercentage = false, withCard = true }: BudgetBarChartProps) {
  const total = data.datasets[0].data.reduce((sum: number, value: any) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
  
  const chartContent = (
    <div className="h-[280px] flex items-center justify-center">
      <Bar 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const percentage = Math.round((value / total) * 100);
                  return showPercentage 
                    ? `Total: ${value} (${percentage}%)`
                    : `Total: ${value}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }}
      />
    </div>
  );

  if (!withCard) {
    return chartContent;
  }
  
  return (
    <Card className="h-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-100">
      <CardHeader className="pb-2 space-y-1.5 px-6 pt-6">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {chartContent}
      </CardContent>
    </Card>
  );
}

// Componente específico para la distribución por categoría
interface BudgetCategoryPieChartProps {
  budgets: any[];
  withCard?: boolean;
}

export function BudgetCategoryPieChart({ budgets, withCard = true }: BudgetCategoryPieChartProps) {
  // Contar presupuestos por categoría (en vez de sumar montos)
  const categoryCounts: Record<string, number> = {};
  
  budgets.forEach(budget => {
    const categoryName = budget.category?.name || 'Uncategorized';
    
    if (!categoryCounts[categoryName]) {
      categoryCounts[categoryName] = 0;
    }
    
    // Incrementar el contador de la categoría
    categoryCounts[categoryName] += 1;
  });
  
  // Calcular el total para obtener porcentajes
  const totalBudgets = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Ordenar categorías por cantidad (mayor a menor)
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Mostrar solo las 6 principales categorías para mejor legibilidad
  
  // Obtener el porcentaje de cada categoría basado en cantidad
  const categoryPercentages = sortedCategories.map(([category, count]) => {
    return {
      category,
      count,
      percentage: Math.round((count / totalBudgets) * 100)
    };
  });
  
  // Preparar datos para el gráfico
  const data = {
    labels: categoryPercentages.map(item => item.category),
    datasets: [
      {
        data: categoryPercentages.map(item => item.count),
        backgroundColor: [
          appColors.category1,
          appColors.category2,
          appColors.category3,
          appColors.category4,
          appColors.category5,
          appColors.category6,
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };
  
  return <BudgetPieChart title="Budget Distribution by Category" data={data} showPercentage={true} withCard={withCard} />;
}

// Componente específico para estados de los presupuestos: active, inactive, expired
interface BudgetActiveStatusPieChartProps {
  budgets: any[];
  withCard?: boolean;
}

export function BudgetActiveStatusPieChart({ budgets, withCard = true }: BudgetActiveStatusPieChartProps) {
  // Contar presupuestos por estado de actividad
  const statusCounts: Record<string, number> = {
    'active': 0,
    'inactive': 0,
    'expired': 0,
  };
  
  budgets.forEach(budget => {
    let status = budget.status || 'inactive';
    // Convertir otros estados a uno de los tres principales
    if (status === 'completed' || status === 'cancelled') {
      status = 'expired';
    }
    if (!statusCounts[status]) {
      statusCounts[status] = 0;
    }
    statusCounts[status] += 1;
  });
  
  // Calcular el total para obtener porcentajes
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  // Traducir nombres de estados
  const statusLabels: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'expired': 'Expired',
  };
  
  // Preparar datos para el gráfico
  const data = {
    labels: Object.keys(statusCounts).map(key => statusLabels[key] || key),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          appColors.success,    // Verde - Active
          appColors.inactive,   // Gris - Inactive
          appColors.expired,    // Naranja - Expired
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };
  
  return <BudgetPieChart title="Budget Status" data={data} showPercentage={true} withCard={withCard} />;
}

// Componente para solicitudes por estado: approved, rejected, pending
interface RequestStatusPieChartProps {
  requests: any[];
  withCard?: boolean;
}

export function RequestStatusPieChart({ requests, withCard = true }: RequestStatusPieChartProps) {
  // Contar solicitudes por estado
  const statusCounts: Record<string, number> = {
    'approved': 0,
    'rejected': 0,
    'pending': 0,
  };
  
  requests.forEach(request => {
    const status = request.status || 'pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  // Calcular el total para obtener porcentajes
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  // Traducir nombres de estados
  const statusLabels: Record<string, string> = {
    'approved': 'Approved',
    'rejected': 'Rejected',
    'pending': 'Pending',
  };
  
  // Preparar datos para el gráfico
  const data = {
    labels: Object.keys(statusCounts).map(key => statusLabels[key] || key),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          appColors.success,    // Verde - Approved
          appColors.danger,     // Rojo - Rejected
          appColors.warning,    // Amarillo - Pending
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };
  
  return <BudgetPieChart title="Request Status" data={data} showPercentage={true} withCard={withCard} />;
}

// Componente de gráfico de barras para mostrar solicitudes por categoría
interface RequestsByCategoryBarChartProps {
  requests: any[];
  withCard?: boolean;
}

export function RequestsByCategoryBarChart({ requests, withCard = true }: RequestsByCategoryBarChartProps) {
  // Contar solicitudes por categoría
  const categoryCounts: Record<string, number> = {};
  
  requests.forEach(request => {
    const categoryName = request.category?.name || 'Uncategorized';
    
    if (!categoryCounts[categoryName]) {
      categoryCounts[categoryName] = 0;
    }
    
    categoryCounts[categoryName] += 1;
  });
  
  // Ordenar categorías por cantidad (mayor a menor)
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Mostrar solo las 6 principales para mejor legibilidad
  
  // Calcular el total para porcentajes
  const total = sortedCategories.reduce((sum, [_, count]) => sum + count, 0);
  
  // Añadir porcentaje a cada categoría
  const categoryPercentages = sortedCategories.map(([category, count]) => {
    return {
      category,
      count,
      percentage: Math.round((count / total) * 100)
    };
  });
  
  // Preparar datos para el gráfico con degradado
  const data = {
    labels: categoryPercentages.map(item => item.category),
    datasets: [
      {
        label: 'Requests',
        data: categoryPercentages.map(item => item.count),
        backgroundColor: appColors.primary,
        barThickness: 30,
        borderRadius: 6,
        borderColor: 'transparent',
      },
    ],
  };
  
  return <BudgetBarChart title="Requests by Category" data={data} showPercentage={true} withCard={withCard} />;
} 