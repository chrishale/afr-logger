import {
  Cable,
  DeleteForever,
  Pause,
  PlayArrow,
  PlusOne
} from '@mui/icons-material'
import { Box, ButtonGroup, IconButton, Stack } from '@mui/material'
import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import Chart from 'react-apexcharts'
import shallow from 'zustand/shallow'

import useAFRStore from '../../stores/afr'
import useApexChartOptions from '../hooks/useApexChartOptions'
import AFRStream from './AFRStream'

const DEFAULT_RANGE = 100

const randomAFR = (min = 10, max = 20) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

const AFRChart = () => {
  const [connectedPort, setConnectedPort] = useState<SerialPort>()
  const [editSeriesIndex, setEditSeriesIndex] = useState<number>()
  const [latestAFR, updateAFR] = useAFRStore(
    s => [s.latestAFR, s.updateAFR],
    shallow
  )
  const [running, start, split, stop, series, clear] = useAFRStore(
    s => [s.running, s.start, s.split, s.stop, s.series, s.clear],
    shallow
  )

  const [isSupported, setIsSupported] = useState<boolean | null>(null)

  useEffect(() => {
    setIsSupported('serial' in navigator)
  }, [])

  const handleExportRequest = useCallback(() => {
    console.log({ series })
    // @TODO - export to CSV
  }, [series])

  const handlePortRequest = useCallback(async () => {
    if (isSupported) {
      const port = await navigator.serial.requestPort()
      setConnectedPort(port)
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })
      while (port.readable) {
        const afrStream = new AFRStream()
        port.readable.pipeTo(afrStream.writable)
        const reader = afrStream.readable.getReader()
        while (true) {
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

  const handleSeriesSelectionChange: ChangeEventHandler<HTMLSelectElement> =
    useCallback(e => {
      if (e.currentTarget.value) {
        setEditSeriesIndex(parseInt(e.currentTarget.value))
      } else {
        setEditSeriesIndex(undefined)
      }
    }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      updateAFR(randomAFR(14.1, 14.7))
    }, 200)
    return () => clearInterval(interval)
  }, [updateAFR])

  const formattedLatestAFR = useMemo(() => latestAFR.toFixed(2), [latestAFR])

  const [xAxisRange, setXAxisRange] = useState(DEFAULT_RANGE)

  const options = useApexChartOptions(
    useMemo(
      () => ({
        xaxis: {
          range: running ? xAxisRange : undefined
        },
        chart: {
          zoom: {
            enabled: !running,
            type: 'x'
          },
          toolbar: {
            show: !running
          }
        }
      }),
      [xAxisRange, running]
    )
  )

  if (isSupported === false) {
    return <div>Unsupported, sucks to be you.</div>
  }

  if (isSupported === null) {
    return <div>Loading...</div>
  }

  return (
    <Box pt={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <ButtonGroup>
          <IconButton
            color="primary"
            aria-label="Connect"
            disabled={Boolean(connectedPort)}
            onClick={handlePortRequest}>
            <Cable />
          </IconButton>
          {Boolean(connectedPort) && (
            <>
              <IconButton onClick={handleToggleRunningPress}>
                {running ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleKeyframePress} disabled={!running}>
                <PlusOne />
              </IconButton>
              <IconButton aria-label="Clear" onClick={handleClearPress}>
                <DeleteForever />
              </IconButton>
            </>
          )}
        </ButtonGroup>
        {Boolean(connectedPort) && <h1>{formattedLatestAFR}</h1>}
      </Stack>
      <Box pt={4}>
        <Chart {...{ options, series }} type="line" height={600} />
      </Box>
    </Box>
  )
}

export default AFRChart
