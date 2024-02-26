'use client';

import { useEffect, useState } from 'react';
import { Entity, World } from '@prisma/client';
import { EntityStack } from './entity-stack';

type EntityEditorProps = {
  world: World & {
    entities: Entity[];
  };
};

export function EntityEditor({ world }: EntityEditorProps) {
  const [stack, setStack] = useState<Entity[]>(world.entities);
  const [loading, setLoading] = useState(false);

  const handleVote = (entity: Entity, vote: boolean) => {
    console.log(entity, vote);
  };

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);

      const results = await fetch(`/world/${world.id}/entity`, {
        method: 'POST',
        body: JSON.stringify({ count: 10 }),
      }).then((response) => response.json());

      setStack(results);
      setLoading(false);

      return results;
    };

    if (world.entities.length === 0 && !loading) {
      fetchEntities();
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (stack.length === 0) {
    return <div>No entities to vote on.</div>;
  }

  return <EntityStack entities={stack} onVote={handleVote} />;
}
