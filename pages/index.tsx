import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
const Chart = dynamic(() => import('../src/components/AFRChart'), {
  ssr: false
})

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>AFR Logger</title>
      </Head>
      <Chart />
    </>
  )
}

export default Home
