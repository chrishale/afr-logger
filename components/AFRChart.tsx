import { useState, useEffect, useCallback, useMemo, ChangeEventHandler } from 'react'
import Chart from 'react-apexcharts'
import ApexCharts, { ApexOptions } from 'apexcharts'
import AFRStream from './AFRStream'
import useAFRStore, { RESOLUTION } from '../stores/afr'
import shallow from 'zustand/shallow'

const DEFAULT_RANGE = 100

const randomAFR = (min = 10, max = 20) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

const AFRChart = () => {
  const [connectedPort, setConnectedPort] = useState<SerialPort>()
  const [editSeriesIndex, setEditSeriesIndex] = useState<number>()
  const [latestAFR, updateAFR] = useAFRStore(s => [s.latestAFR, s.updateAFR], shallow)
  const [running, start, split, stop, series, clear] = useAFRStore(s => [s.running, s.start, s.split, s.stop, s.series, s.clear], shallow)
  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      id: 'realtime',
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: RESOLUTION
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    annotations: {
      yaxis: [
        {
          y: 14.7,
          y2: 13.5,
          borderColor: 'red',
          label: {
            text: 'Idle'
          }
        },
        {
          y: 12.5,
          y2: 13.1,
          fillColor: 'red',
          label: {
            text: 'WOT'
          }
        },
        {
          y: 15,
          y2: 17,
          fillColor: 'green',
          label: {
            text: 'Cruise'
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
          fontSize: '18px',
        },
        formatter: val => val.toFixed(1)
      },
      crosshairs: {
        show: false
      }
    },
    xaxis: {
      range: DEFAULT_RANGE,
      labels: {
        show: false
      },
      crosshairs: {
        show: false
      }
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      onItemClick: {
        toggleDataSeries: true
      },
    },
  })

  const [isSupported, setIsSupported] = useState<boolean | null>(null)

  useEffect(() => {
    setIsSupported("serial" in navigator)
  }, [])

  const handleExportRequest = useCallback(() => {
    // @TODO - export to CSV
  }, [])

  const handlePortRequest = useCallback(async () => {
    if (isSupported) {
      const port = await navigator.serial.requestPort();
      setConnectedPort(port)
      await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
      while (port.readable) {
        const afrStream = new AFRStream()
        port.readable.pipeTo(afrStream.writable)
        const reader = afrStream.readable.getReader()
        while(true) {
          const { value, done } = await reader.read()
          if (done) {
            reader.releaseLock()
            break
          }
          if (value) {
            const afr = parseFloat(value)
            if (afr !== NaN) {
              updateAFR(afr)
            }
          }
        }
      }
      await port.close()
      setConnectedPort(undefined)
    }
  }, [isSupported, updateAFR])

  const handleClearPress = useCallback(() => {
    if (confirm('Are you sure?')) {
      clear()
    }
  }, [clear])

  const handleToggleRunningPress = useCallback(() => {
    if (running) {
      stop()
    } else {
      start()
    }
  }, [running, stop, start])

  const handleKeyframePress = useCallback(() => {
    split()
  }, [split])

  const handleSeriesSelectionChange: ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
    if (e.currentTarget.value) {
      setEditSeriesIndex(parseInt(e.currentTarget.value))
    } else {
      setEditSeriesIndex(undefined)
    }
  }, [])

  const formattedLatestAFR = useMemo(() => latestAFR.toFixed(1), [latestAFR])

  if (isSupported === false) {
    return <div>Unsupported, sucks to be you.</div>
  }

  if (isSupported === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{formattedLatestAFR}</h1>
      <button disabled={Boolean(connectedPort)} onClick={handlePortRequest}>{connectedPort ? "Connected" : "Connect"}</button>
      <Chart {...{ options, series }} type="line" height={600} />
      {Boolean(connectedPort) && (
        <div>
          <nav>
            <button onClick={handleToggleRunningPress}>{running ? 'Stop' : 'Start'}</button>
            <button onClick={handleKeyframePress} disabled={!running}>Split</button>
            <button onClick={handleClearPress}>Clear</button>
          </nav>

          {/* <hr />
    
          <h1>Export (in progress)</h1>
          <select onChange={handleSeriesSelectionChange} value={editSeriesIndex}>
            <option>All series</option>
            {series.map((series, index) => (
              <option key={series.name} value={index}>{series.name}</option>
            ))}
          </select>
    
          <button onClick={handleExportRequest}>Export</button> */}
        </div>
      )}

    </div>
  )
}

export default AFRChart