import { ApexOptions } from 'apexcharts'
import deepmerge from 'deepmerge'
import { useMemo } from 'react'

import { RESOLUTION } from '../../stores/afr'

const useApexChartOptions = (value: ApexOptions) => {
  return useMemo(
    () =>
      deepmerge(
        {
          chart: {
            id: 'realtime',
            type: 'line',
            animations: {
              enabled: true,
              easing: 'linear',
              dynamicAnimation: {
                speed: RESOLUTION
              }
            }
          },
          annotations: {
            yaxis: [
              {
                y: 14.75,
                borderColor: 'green',
                borderWidth: 4,
                label: {
                  text: '14.75'
                }
              }
            ]
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth'
          },
          tooltip: {
            enabled: false
          },
          markers: {
            size: 0
          },
          yaxis: {
            min: 10,
            max: 20,
            labels: {
              style: {
                fontSize: '18px'
              },
              formatter: (val: number) => val.toFixed(0)
            },
            crosshairs: {
              show: false
            }
          },
          xaxis: {
            labels: {
              show: false
            },
            crosshairs: {
              show: false
            }
          },
          legend: {
            show: false
          }
        },
        value
      ),
    [value]
  )
}

export default useApexChartOptions
