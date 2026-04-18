import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadialLinearScale,
  RadarController,
  Tooltip,
} from 'chart.js'
import { Line, Radar } from 'react-chartjs-2'
import type { LegendPatchHistory } from '../types/brawlmance'
import styles from './LegendDetailCharts.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  LineController,
  RadarController,
  Filler,
  Legend,
  Tooltip
)

const ORANGE = 'rgb(255, 159, 64)'
const ORANGE_FILL = 'rgba(255, 159, 64, 0.35)'
const GRAY = 'rgb(201, 203, 207)'
const GRAY_FILL = 'rgba(201, 203, 207, 0.35)'

const chartFont = {
  family: "'Lato', sans-serif",
}

const axisColor = 'rgba(255, 255, 255, 0.12)'
const tickColor = 'rgba(204, 204, 204, 0.9)'

type RadarProps = {
  legendRatings: { strength: number; dexterity: number; defense: number; speed: number }
  averageStats: { strength: number; dexterity: number; defense: number; speed: number }
}

export function LegendRadarBlock({ legendRatings, averageStats }: RadarProps) {
  const data = useMemo(
    () => ({
      labels: ['Strength', 'Dexterity', 'Defense', 'Speed'],
      datasets: [
        {
          label: 'This legend',
          data: [legendRatings.strength, legendRatings.dexterity, legendRatings.defense, legendRatings.speed],
          backgroundColor: ORANGE_FILL,
          borderColor: ORANGE,
          pointBackgroundColor: ORANGE,
          borderWidth: 2,
        },
        {
          label: 'Global average',
          data: [averageStats.strength, averageStats.dexterity, averageStats.defense, averageStats.speed],
          backgroundColor: GRAY_FILL,
          borderColor: GRAY,
          pointBackgroundColor: GRAY,
          borderWidth: 2,
        },
      ],
    }),
    [legendRatings, averageStats]
  )

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: tickColor,
            font: chartFont,
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(33, 33, 35, 0.94)',
          titleColor: '#eee',
          bodyColor: '#ddd',
          borderColor: axisColor,
          borderWidth: 1,
        },
      },
      scales: {
        r: {
          angleLines: { color: axisColor },
          grid: { color: axisColor },
          pointLabels: {
            color: tickColor,
            font: { ...chartFont, size: 12 },
          },
          ticks: {
            backdropColor: 'transparent',
            color: 'rgba(160, 160, 160, 0.95)',
            showLabelBackdrop: false,
          },
          suggestedMin: 0,
        },
      },
    }),
    []
  )

  return (
    <div className={styles.chartWrap}>
      <Radar data={data} options={options} />
    </div>
  )
}

type LineBlockProps = {
  title: string
  patchHistory: LegendPatchHistory
  legendKey: 'legendWinrates' | 'legendPlayrates'
  averageKey: 'averageWinrates' | 'averagePlayrates'
  ySuffix: string
}

export function LegendPatchLineBlock({ title, patchHistory, legendKey, averageKey, ySuffix }: LineBlockProps) {
  const data = useMemo(
    () => ({
      labels: patchHistory.patchIds,
      datasets: [
        {
          label: 'This legend',
          data: patchHistory[legendKey],
          backgroundColor: ORANGE_FILL,
          borderColor: ORANGE,
          pointBackgroundColor: ORANGE,
          borderWidth: 2,
          tension: 0.25,
          fill: true,
        },
        {
          label: 'Average (all legends)',
          data: patchHistory[averageKey],
          backgroundColor: GRAY_FILL,
          borderColor: GRAY,
          pointBackgroundColor: GRAY,
          borderWidth: 2,
          tension: 0.25,
          fill: true,
        },
      ],
    }),
    [patchHistory, legendKey, averageKey]
  )

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: tickColor,
            font: chartFont,
            boxWidth: 12,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(33, 33, 35, 0.94)',
          titleColor: '#eee',
          bodyColor: '#ddd',
          borderColor: axisColor,
          borderWidth: 1,
          callbacks: {
            label: (ctx: { dataset?: { label?: string }; parsed: { y: number | null } }) => {
              const v = ctx.parsed.y
              if (v === null || v === undefined) return `${ctx.dataset?.label ?? ''}: —`
              return `${ctx.dataset?.label ?? ''}: ${v.toFixed(2)}${ySuffix}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: axisColor },
          ticks: {
            color: tickColor,
            font: chartFont,
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          grid: { color: axisColor },
          ticks: {
            color: tickColor,
            font: chartFont,
            callback: (value: string | number) => `${value}${ySuffix}`,
          },
          beginAtZero: true,
        },
      },
    }),
    [ySuffix]
  )

  return (
    <div className={styles.lineSection}>
      <h3 className={styles.lineTitle}>{title}</h3>
      <div className={styles.chartWrapLine}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
