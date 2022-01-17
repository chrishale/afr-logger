import {
  Cable,
  Cookie,
  DeleteForever,
  Pause,
  PlayArrow,
  PlusOne
} from '@mui/icons-material'
import { Box, ButtonGroup, IconButton, Stack } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Chart from 'react-apexcharts'
import shallow from 'zustand/shallow'

import useAFRStore from '../../stores/afr'
import useApexChartOptions from '../hooks/useApexChartOptions'
import AFRStream from './AFRStream'

const DEFAULT_RANGE = 100

const AFRChart = () => {
  const [connectedPort, setConnectedPort] = useState<SerialPort>()
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
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            reader.releaseLock()
            break
          }
          if (value) {
            const afr = parseFloat(value)
            if (!isNaN(afr)) {
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

  const formattedLatestAFR = useMemo(() => latestAFR.toFixed(2), [latestAFR])

  const [xAxisRange] = useState(DEFAULT_RANGE)

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

  const afrColor = useMemo(() => {
    if (latestAFR > 14.7) {
      return 'red'
    } else if (latestAFR < 12.5) {
      return 'red'
    }
    return 'green'
  }, [latestAFR])

  if (isSupported === false) {
    return <div>Unsupported, sucks to be you.</div>
  }

  if (isSupported === null) {
    return <div>Loading...</div>
  }

  return (
    <Box py={4} gap={4} height="100vh" display="flex" flexDirection="column">
      <Stack
        px={4}
        height={40}
        direction="row"
        justifyContent="space-between"
        alignItems="center">
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
        {Boolean(connectedPort) && (
          <Box
            fontSize={32}
            display="flex"
            alignItems="center"
            color={afrColor}
            fontFamily="monospace">
            <span>{formattedLatestAFR}</span>
          </Box>
        )}
      </Stack>
      <Box height="100%" px={4}>
        <Chart {...{ options, series }} type="line" height="100%" />
      </Box>
      <Box px={4} textAlign="center">
        <p>
          <span
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              paddingRight: '1em'
            }}>
            <Cookie />
          </span>
          This site uses a few cookies for me to track usage analytics, so that
          I can see how popular this tool is and if it is worth me spending more
          time developing and adding features. If you have any issues, questions
          or suggestions, feel free to{' '}
          <a href="mailto:hello@chrishale.co.uk">reach out</a>
        </p>
      </Box>
    </Box>
  )
}

export default AFRChart
