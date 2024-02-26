'use client';

import { Entity } from '@prisma/client';
import { useState } from 'react';
import EntityCard from './entity-card';

type EntityStackProps = {
  entities: Entity[];
  onVote: (entity: Entity, vote: boolean) => void;
  className?: string;
};

export function EntityStack({ entities, onVote }: EntityStackProps) {
  const [stack, setStack] = useState<Entity[]>(entities);

  const handleVote = (vote: boolean) => {
    onVote(stack[stack.length - 1], vote);

    let newStack = stack.slice(0, stack.length - 1);
    setStack(newStack);
  };

  if (stack.length === 0) {
    return <div>No entities to vote on.</div>;
  }

  return (
    <div className="w-screen h-screen">
      {stack.map((entity, index) => {
        const isTop = index === stack.length - 1;
        const zIndex = isTop ? stack.length : index;

        return (
          <EntityCard drag={isTop} key={entity.id} entity={entity} className={`inset-0 m-auto`} style={{ zIndex }} onVote={handleVote} />
        );
      })}
    </div>
  );
}
