import type { NextPage } from 'next'
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('../components/AFRChart'), { ssr: false });

const Home: NextPage = () => {
  return (
    <div>
      <Chart />
    </div>
  )
}

export default Home
