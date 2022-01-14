class AFRStream extends TransformStream<Uint8Array, string> {
  constructor() {
    const textencoder = new TextEncoder()
    let buffer = Buffer.alloc(0)
    const delimiter = Buffer.from("\r\n")
    super({
      start() {},
      async transform(chunk, controller) {
        let data = Buffer.concat([buffer, chunk])
        let position
        while ((position = data.indexOf(delimiter)) !== -1) {
          const value = data.slice(0, position)
          controller.enqueue(value.toString())
          data = data.slice(position + delimiter.length)
        }
        buffer = data
      }
    }) 
  }
}

export default AFRStream