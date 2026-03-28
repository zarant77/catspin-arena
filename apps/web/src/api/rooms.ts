import type { MathProfileId, MathProfileOption } from '@catspin/core';

export type CreateRoomRequest = {
  readonly mathProfileId?: MathProfileId;
};

export type CreateRoomResponse = {
  readonly roomId: string;
};

export type GetMathProfilesResponse = {
  readonly profiles: readonly MathProfileOption[];
};

export async function getMathProfiles(): Promise<readonly MathProfileOption[]> {
  const response = await fetch('/math-profiles', {
    method: 'GET',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load math profiles: ${response.status} ${text}`);
  }

  const data = (await response.json()) as GetMathProfilesResponse;

  return data.profiles;
}

export async function createRoom(request?: CreateRoomRequest): Promise<CreateRoomResponse> {
  const response = await fetch('/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request ?? {}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create room: ${response.status} ${text}`);
  }

  return (await response.json()) as CreateRoomResponse;
}
