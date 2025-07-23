import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

interface CashFlowChartProps {
  data?: {
    labels: string[];
    data: number[];
  };
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [12000, 15000, 18000, 14000, 19000, 22000]
  };

  const chartData = data || defaultData;

  useEffect(() => {
    if (!chartRef.current) return;

    const loadChart = async () => {
      const { default: Chart } = await import('chart.js/auto');
      
      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current!.getContext('2d');
      if (!ctx) return;

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Cash Flow',
            data: chartData.data,
            borderColor: 'hsl(263, 70%, 50%)',
            backgroundColor: 'hsla(263, 70%, 50%, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'hsl(263, 70%, 50%)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'white',
              titleColor: 'hsl(210, 40%, 8%)',
              bodyColor: 'hsl(210, 40%, 8%)',
              borderColor: 'hsl(214, 32%, 91%)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'hsl(214, 32%, 91%)',
                drawBorder: false,
              },
              ticks: {
                color: 'hsl(215, 16%, 47%)',
                callback: function(value) {
                  return '$' + (value as number).toLocaleString();
                }
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                color: 'hsl(215, 16%, 47%)',
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        }
      });
    };

    loadChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Card className="stat-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-violet-600" />
            Cash Flow Overview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue="30days">
              <SelectTrigger className="w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
