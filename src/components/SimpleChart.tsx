"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleChartProps {
  title: string;
  description?: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type?: "bar" | "line" | "pie";
  className?: string;
}

export default function SimpleChart({ 
  title, 
  description, 
  data, 
  type = "bar", 
  className 
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === "bar") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.color || "bg-blue-500"
                    }`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "line") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end space-x-1">
            {data.map((item, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  item.color || "bg-blue-500"
                } transition-all duration-300`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {data.map((item, index) => (
              <span key={index} className="truncate">
                {item.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pie chart (simplified)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  item.color || "bg-blue-500"
                }`}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
