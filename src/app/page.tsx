import db from '@/lib/db';
import Dashboard from './dashboard';

export default async function Home() {
  const worlds = await db.world.findMany();

  return <Dashboard worlds={worlds} />;
}
