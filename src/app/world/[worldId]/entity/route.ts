import db from '@/lib/db';
import { Entity, EntityType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';
const openai = new OpenAI();

async function createEntities(worldId: string, count: number) {
  const generations = [];
  for (let i = 0; i < count; i++) {
    generations.push(createEntity(worldId));
  }

  const results = await Promise.all(generations);

  return results.filter((result) => result) as Entity[];
}

async function createEntity(worldId: string) {
  const types = ['CHARACTER', 'ITEM', 'LOCATION', 'EVENT'];
  const type = types[Math.floor(Math.random() * types.length)];

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Generate a unique and random ${type.toLowerCase()} for a story, ensuring it can belong to any genre or time period. The entity must be described in YAML format. Emphasize its distinctiveness. Example:\n\ntype: CHARACTER\nname: Zaraq El-Amin\ndescription: Zaraq El-Amin is a time-traveling merchant from the distant future, known for trading artifacts that have not yet been invented.`,
      },
    ],
    model: 'gpt-4-turbo-preview',
  });
  if (!response.choices[0].message.content) {
    throw new Error('No entity generated');
  }

  const yamlContent = response.choices[0].message.content;
  const yamlLines = yamlContent.split('\n');
  const typeLine = yamlLines.find((line) => line.startsWith('type:'));
  const nameLine = yamlLines.find((line) => line.startsWith('name:'));
  const descriptionLine = yamlLines.find((line) => line.startsWith('description:'));
  if (!typeLine || !nameLine || !descriptionLine) {
    throw new Error('Invalid YAML format');
  }

  const entityType = typeLine.replace('type:', '').trim();
  const name = nameLine.replace('name:', '').trim();
  const description = descriptionLine.replace('description:', '').trim();

  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt:
      `Create a cinematic depiction of the ${type.toLowerCase()} described below.` +
      '\n\n' +
      'name: ' +
      name +
      '\n' +
      'description: ' +
      description,
    n: 1,
    size: '1024x1792',
    quality: 'hd',
  });

  if (!imageResponse.data) {
    throw new Error('No image generated');
  }

  const entity = await db.entity.create({
    data: {
      world: {
        connect: {
          id: worldId,
        },
      },
      type: entityType as 'CHARACTER' | 'ITEM' | 'LOCATION' | 'EVENT',
      name,
      description,
      imageUrl: imageResponse.data[0].url as string,
    },
  });

  console.log('Entity created:', entity);

  return entity;
}

export async function POST(request: NextRequest, { params }: { params: { worldId: string } }) {
  const { count } = await request.json();
  const worldId = params.worldId;

  try {
    const result = await createEntities(worldId, count);
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
