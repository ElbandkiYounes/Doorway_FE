"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"

interface IntervieweeStatusChartProps {
  data: {
    labels: string[]
    series: number[]
  }
}

export function IntervieweeStatusChart({ data }: IntervieweeStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interviewee Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          type="donut"
          width="100%"
          height={200}
          series={data.series}
          options={{
            labels: data.labels,
            legend: {
              position: "bottom",
            },
            plotOptions: {
              pie: {
                donut: {
                  size: "65%",
                },
              },
            },
          }}
        />
      </CardContent>
    </Card>
  )
}

