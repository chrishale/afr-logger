import { useState, useEffect, useCallback, useMemo } from 'react'
import Chart from 'react-apexcharts'
import ApexCharts, { ApexOptions } from 'apexcharts'

const SPEED = 200
const DEFAULT_RANGE = 100

type Series = {
  data: number[]
}

let series: Series[] = [{ data: [14.7] }]
let latestAFR = 0

const randomAFR = (min = 10, max = 20) => {
  return Math.random() * (max - min) + min;
}

const AFRChart = () => {
  const [running, setRunning] = useState(false)
  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      id: 'realtime',
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: SPEED
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
      show: false
    },
  })

  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [port, setPort] = useState<SerialPort>()

  useEffect(() => {
    setIsSupported("serial" in navigator)
  }, [])

  const handleExportRequest = useCallback(() => {
    console.log(series)
  }, [])

  const handlePortRequest = useCallback(async () => {
    if (isSupported) {
       const port = await navigator.serial.requestPort();
       setPort(port)
    }
  }, [isSupported])

  const logData = useCallback(async () => {
    let keepReading = true;
    let reader;

    if (port) {
      await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
      while (port.readable && keepReading) {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        while(true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }

          if (value) {
            const afr = parseFloat(value)
            console.log(afr)
          }
        }
      }
    }

    return () => port?.close()
  }, [port])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (running) {
      interval = setInterval(() => {
        series[series.length - 1].data.push(latestAFR)
        ApexCharts.exec('realtime', 'updateSeries', series)
      }, SPEED)
    }
    return () => clearInterval(interval)
  }, [running])

  // @TODO - REMOVE THIS
  useEffect(() => {
    let interval = setInterval(() => {
      latestAFR = randomAFR()
    }, 10)
    return () => clearInterval(interval)
  })

  const handleClearPress = useCallback(() => {
    if (confirm('Are you sure?')) {
      series = [{ data: [14.7]}]
      ApexCharts.exec('realtime', 'updateSeries', series)
    }
  }, [])

  const handlePauseResumePress = useCallback(() => {
    setRunning(running => {
      if (running) {
        series.push({ data: Array(series[series.length - 1].data.length).fill(0) })
      }
      return !running
    })
  }, [])

  const handleKeyframePress = useCallback(() => {
    series.push({ data: Array(series[series.length - 1].data.length).fill(0) })
  }, [])

  if (isSupported === false) {
    return <div>Unsupported, sucks to be you.</div>
  }

  if (isSupported === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Chart {...{ options, series }} type="line" height={600} />
      <nav>
        <button onClick={handlePortRequest}>Connect</button>
        <button onClick={handleExportRequest}>Export</button>
        <button onClick={handlePauseResumePress}>{running ? 'Pause' : 'Resume'}</button>
        <button onClick={handleClearPress}>Clear</button>
        <button onClick={handleKeyframePress}>Split</button>
      </nav>
    </div>
  )
}

export default AFRChart