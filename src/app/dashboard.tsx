'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { World } from '@prisma/client';

type DashboardProps = {
  worlds: World[];
};

export default function Dashboard({ worlds }: DashboardProps) {
  const router = useRouter();

  useEffect(() => {
    const createWorld = async () => {
      const response = await fetch('/world', {
        method: 'POST',
      });

      const world = await response.json();
      router.push(`/world/${world.id}`);
    };

    if (worlds.length === 0) {
      createWorld();
    }
  }, [router, worlds]);

  if (worlds.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {worlds.map((world) => (
        <div key={world.id}>
          <Link href={`/world/${world.id}`}>World {world.id}</Link>
        </div>
      ))}
    </div>
  );
}
