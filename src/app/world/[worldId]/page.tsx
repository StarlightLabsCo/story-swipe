import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { EntityState } from '@prisma/client';
import { EntityEditor } from './entity-editor';

export default async function World({ params }: { params: { worldId: string } }) {
  const world = await db.world.findUnique({
    where: { id: params.worldId },
    include: {
      entities: {
        where: { state: EntityState.SUGGESTED },
      },
    },
  });

  if (!world) {
    redirect('/');
  }

  return <EntityEditor world={world} />;
}
