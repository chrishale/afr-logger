import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic';
import Container from '@mui/material/Container';
const Chart = dynamic(() => import('../src/components/AFRChart'), { ssr: false });

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>AFR Logger</title>
      </Head>
      <Container maxWidth="lg">
        <Chart />
      </Container>
    </>
  )
}

export default Home
