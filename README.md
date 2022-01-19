# AFR Logger

A web application that logs and plots AFR values from a serial enabled wideband lambda gauge such as the AEM X-SERIES UEGO GAUGE. Other gauges might work if they follow the same RS232 standard.

## You'll need
- RS232 complient AFR gauge
- DB9 to USB cable
- Latest version of Chrome (other browsers are untested)

## Instructions

- Connect the DB9 end of the cable to your gauge, and the USB end of the cable to your computer
- Go to: https://afr-logger.chrishale.co.uk/
- Click connect, and you should see the live AFR value update in realtime
- Use Start to begin logging, each time you stop/start logging a new series is plotted on the graph. Or you can manually create a new one using the split button.

## Features I'd like to add

- [ ] Export as CSV
- [ ] Make it look nice
- [ ] Ability to update series name
- [ ] Ability to recall, or replay graph in realtime
- [ ] Plot other metrics along side AFR, like RPM, and intake vaccum
- [ ] Configurable annotations for y-axis
