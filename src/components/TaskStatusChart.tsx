"use client";

import { TrendingUp, ChartBarBig } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getCompletionRateColor } from "@/constants"

interface TaskStatistics {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
}

interface TaskStatusChartProps {
  statistics?: TaskStatistics;
}

export function TaskStatusChart({ statistics }: TaskStatusChartProps) {
  const t = useTranslations();
  
  // Provide default values if statistics is undefined
  const safeStatistics: TaskStatistics = statistics || {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
  };

  const chartConfig = {
    count: {
      label: t('status.count'),
    },
    todo: {
      label: t('status.todo'),
      color: "#737373", // zinc-500
    },
    in_progress: {
      label: t('status.inProgress'),
      color: "#00a6f4", // sky-500
    },
    in_review: {
      label: t('status.inReview'),
      color: "#f0b100", // yellow-500
    },
    done: {
      label: t('status.done'),
      color: "#7ccf00", // lime-500
    },
  } satisfies ChartConfig

  const chartData = [
    { status: t('status.todo'), count: safeStatistics.todo, fill: "var(--color-todo)" },
    { status: t('status.inProgress'), count: safeStatistics.in_progress, fill: "var(--color-in_progress)" },
    { status: t('status.inReview'), count: safeStatistics.in_review, fill: "var(--color-in_review)" },
    { status: t('status.done'), count: safeStatistics.done, fill: "var(--color-done)" },
  ]

  const totalTasks = safeStatistics.todo + safeStatistics.in_progress + safeStatistics.in_review + safeStatistics.done
  const hasTasks = totalTasks > 0
  const completionRate = totalTasks > 0 
    ? Math.round((safeStatistics.done / totalTasks) * 100) 
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBarBig className="w-5 h-5" />
          {t('dashboard.taskStatistics')}
        </CardTitle>
        <CardDescription>{t('dashboard.taskStatisticsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="h-[280px] w-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">{t('dashboard.noData')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.noTasksInSystem')}</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
                left: 16,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="count"
                radius={4}
              >
                <LabelList
                  dataKey="status"
                  position="insideLeft"
                  offset={8}
                  className="fill-white font-medium"
                  fontSize={12}
                />
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {hasTasks ? (
          <>
            <div 
              className="flex gap-2 leading-none font-medium"
              style={{ color: getCompletionRateColor(completionRate) }}
            >
              {t('dashboard.completionRate', { rate: completionRate })} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              {t('dashboard.showingAllTasks', { count: totalTasks })}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground leading-none">
            {t('dashboard.noDataAtThisTime')}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
