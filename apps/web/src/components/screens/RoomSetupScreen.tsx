import type { MathProfileId } from '@catspin/core';

import { Button } from '../common/Button';
import { Section } from '../layout/Section';

type MathProfileOption = {
  readonly id: MathProfileId;
  readonly label: string;
};

type RoomSetupScreenProps = {
  readonly roomInput: string;
  readonly selectedMathProfileId: MathProfileId;
  readonly mathProfileOptions: readonly MathProfileOption[];
  readonly onRoomInputChange: (value: string) => void;
  readonly onMathProfileChange: (value: MathProfileId) => void;
  readonly onCreateRoom: () => void;
  readonly onJoinRoom: () => void;
  readonly canCreate: boolean;
  readonly canJoin: boolean;
};

export function RoomSetupScreen(props: RoomSetupScreenProps) {
  const {
    roomInput,
    selectedMathProfileId,
    mathProfileOptions,
    onRoomInputChange,
    onMathProfileChange,
    onCreateRoom,
    onJoinRoom,
    canCreate,
    canJoin,
  } = props;

  return (
    <Section title="Create or join room" className="room-setup">
      <div className="create-row">
        <select
          value={selectedMathProfileId}
          onChange={(event) => onMathProfileChange(event.target.value as MathProfileId)}
        >
          {mathProfileOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <Button type="button" onClick={onCreateRoom} sound="click" disabled={!canCreate}>
          Create room
        </Button>
      </div>

      <div className="join-row">
        <input
          value={roomInput}
          onChange={(event) => onRoomInputChange(event.target.value)}
          placeholder="Room ID"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && canJoin) {
              onJoinRoom();
            }
          }}
        />

        <Button type="button" onClick={onJoinRoom} sound="click" disabled={!canJoin}>
          Join room
        </Button>
      </div>
    </Section>
  );
}
