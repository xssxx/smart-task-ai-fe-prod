import { TrendingUp, ChartBarBig } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
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
  // Provide default values if statistics is undefined
  const safeStatistics: TaskStatistics = statistics || {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
  };

  const chartConfig = {
    count: {
      label: "จำนวน",
    },
    todo: {
      label: "รอดำเนินการ",
      color: "#737373", // zinc-500
    },
    in_progress: {
      label: "กำลังดำเนินการ",
      color: "#00a6f4", // sky-500
    },
    in_review: {
      label: "รอตรวจสอบ",
      color: "#f0b100", // yellow-500
    },
    done: {
      label: "เสร็จสิ้น",
      color: "#7ccf00", // lime-500
    },
  } satisfies ChartConfig

  const chartData = [
    { status: "รอดำเนินการ", count: safeStatistics.todo, fill: "var(--color-todo)" },
    { status: "กำลังดำเนินการ", count: safeStatistics.in_progress, fill: "var(--color-in_progress)" },
    { status: "รอตรวจสอบ", count: safeStatistics.in_review, fill: "var(--color-in_review)" },
    { status: "เสร็จสิ้น", count: safeStatistics.done, fill: "var(--color-done)" },
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
          สถิติงานตาม Status
        </CardTitle>
        <CardDescription>แสดงจำนวนงานทั้งหมดแยกตามสถานะ</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="h-[280px] w-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">ไม่มีข้อมูล</p>
              <p className="text-xs text-gray-400 mt-1">ยังไม่มีงานในระบบ</p>
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
              อัตราความสำเร็จ {completionRate}% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              แสดงข้อมูลงานทั้งหมด {totalTasks} งาน
            </div>
          </>
        ) : (
          <div className="text-muted-foreground leading-none">
            ไม่มีข้อมูลในช่วงเวลานี้
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
