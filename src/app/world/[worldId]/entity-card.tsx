import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Entity } from '@prisma/client';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type EntityCardProps = {
  entity: Entity;
  onVote: (vote: boolean) => void;
  drag?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function EntityCard({ entity, onVote, drag, className, style }: EntityCardProps) {
  const cardElem = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const controls = useAnimation();

  const [constrained, setConstrained] = useState(true);
  const direction = useRef<string | undefined>();
  const velocity = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!drag) return;
      if (event.key === 'ArrowLeft') {
        direction.current = 'left';
        flyAway(-1);
      } else if (event.key === 'ArrowRight') {
        direction.current = 'right';
        flyAway(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drag]);

  const getVote = (childNode: HTMLElement, parentNode: HTMLElement) => {
    const childRect = childNode.getBoundingClientRect();
    const parentRect = parentNode.getBoundingClientRect();
    let result = parentRect.left >= childRect.right ? false : parentRect.right <= childRect.left ? true : undefined;
    return result;
  };

  const getDirection = () => {
    return velocity.current >= 1 ? 'right' : velocity.current <= -1 ? 'left' : undefined;
  };

  const getTrajectory = () => {
    velocity.current = x.getVelocity();
    direction.current = getDirection();
  };

  const flyAway = (min: number) => {
    const flyAwayDistance = (direction: string) => {
      if (!cardElem.current || !(cardElem.current.parentNode instanceof Element)) return;
      const parentWidth = cardElem.current.parentNode.getBoundingClientRect().width;
      const childWidth = cardElem.current.getBoundingClientRect().width;
      return direction === 'left' ? -parentWidth / 2 - childWidth / 2 : parentWidth / 2 + childWidth / 2;
    };

    if (direction.current && Math.abs(velocity.current) > min) {
      setConstrained(false);
      controls.start({
        x: flyAwayDistance(direction.current),
      });
    }
  };

  useEffect(() => {
    const unsubscribeX = x.onChange(() => {
      if (cardElem.current) {
        const childNode = cardElem.current;
        const parentNode = cardElem.current.parentNode as HTMLElement;
        if (parentNode instanceof HTMLElement) {
          const result = getVote(childNode, parentNode);
          result !== undefined && onVote(result);
        }
      }
    });

    return () => unsubscribeX();
  });

  const truncatedDescription =
    entity.description.split(' ').slice(0, 20).join(' ') + (entity.description.split(' ').length > 22 ? '...' : '');

  const entityTypeToBorderColor = {
    CHARACTER: 'border-pink-600',
    ITEM: 'border-orange-500',
    LOCATION: 'border-purple-500',
    EVENT: 'border-teal-500',
  };

  const entityTypeToTagColor = {
    CHARACTER: 'bg-pink-600 text-white',
    ITEM: 'bg-orange-500 text-white',
    LOCATION: 'bg-purple-500 text-white',
    EVENT: 'bg-teal-500 text-black',
  };

  const borderStyle = entityTypeToBorderColor[entity.type] || 'border-white';
  const tagStyle = entityTypeToTagColor[entity.type] || 'bg-white text-black';

  return (
    <motion.div
      drag={drag}
      animate={controls}
      dragConstraints={constrained && { left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      ref={cardElem}
      style={{ x, ...style }}
      onDrag={getTrajectory}
      onDragEnd={() => flyAway(350)}
      whileTap={{ scale: 1.1 }}
      className={cn(
        'absolute top-0 left-0 shrink-0 w-96 h-[42rem] rounded-xl',
        `border ${borderStyle}`,
        { 'drop-shadow-2xl': drag },
        className,
      )}
    >
      <div
        className={`absolute top-0 w-1/3 h-6 rounded-tl-xl rounded-br-xl font-black text-sm flex items-center justify-center ${tagStyle}`}
      >
        {entity.type}
      </div>
      <Image
        className="object-cover h-full rounded-xl aspect-9/16"
        src={entity.imageUrl}
        alt={`Generated image of ${entity.name}`}
        width={1792}
        height={1024}
        draggable={false}
      />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute w-full bottom-1/4 h-1/4 bg-gradient-to-t from-black/90 to-transparent" />
      <div className="absolute bottom-0 z-10 flex flex-col justify-between w-full h-36 py-3 px-5 mb-8 gap-y-2">
        <div className="text-3xl font-black text-center drop-shadow-lg text-white">{entity.name}</div>
        <div className="text-sm text-center text-neutral-400">{truncatedDescription}</div>
      </div>
    </motion.div>
  );
}
