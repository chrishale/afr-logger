import create from "zustand";

export const RESOLUTION = 200

interface AFRStore {
  running: boolean
  latestAFR: number
  series: {
    name: string
    data: number[]
  }[]
  renameSeries: (i: number, name: string) => void
  interval?: ReturnType<typeof setInterval>
  updateAFR: (afr: number) => void,
  start: () => void
  stop: () => void
  split: () => void
  clear: () => void
}

const afrStore = create<AFRStore>((set, get) => ({
  running: false,
  latestAFR: 14.7,
  series: [],
  updateAFR(latestAFR) {
    set({ latestAFR })
  },
  start() {
    set(({ series }) => ({
      series: [
        ...series,
        { name: `AFR #${series.length + 1}`, data: Array(series[series.length - 1]?.data.length || 0).fill(0) },
      ]
    }))

    set({
      interval: setInterval(() => {
        set(({ series, latestAFR }) => ({
          series: series.map((srs, index) => {
            if (index === series.length - 1) {
              return {
                ...srs,
                data: [
                  ...srs.data,
                  latestAFR
                ]
              }
            }
            return srs
          })
        }))
      }, RESOLUTION),
      running: true,
    })
  },
  stop() {
    const { interval } = get()
    if (interval) clearInterval(interval)
    set({ interval: undefined, running: false })
  },
  split() {
    set(({ series }) => ({
      series: [
        ...series,
        { name: `AFR #${series.length + 1}`, data: Array(series[series.length - 1]?.data.length || 0).fill(0) },
      ]
    }))
  },
  clear() {
    set({
      series: [{ name: `AFR #1`, data: [] }]
    })
  },
  renameSeries(i, name) {
    set(({ series }) => ({
      series: series.map((srs, ix) => {
        if (i === ix) {
          return {...srs, name}
        }
        return srs
      })
    }))
  }
}))

export default afrStore