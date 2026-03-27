import { useEffect, useState } from 'react';

type AvatarProps = {
  readonly value: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly mood?: 'neutral' | 'win' | 'lose';
};

const PATH = '/assets/avatars';

const SUFFIX = {
  neutral: 'n',
  win: 'w',
  lose: 'l',
};

export function Avatar({ value, size = 'sm', mood = 'neutral' }: AvatarProps) {
  const [currentMood, setCurrentMood] = useState(mood);

  useEffect(() => {
    if (mood === 'neutral') {
      setCurrentMood('neutral');
      return;
    }

    let isAlt = false;

    const interval = setInterval(() => {
      isAlt = !isAlt;
      setCurrentMood(isAlt ? mood : 'neutral');
    }, 400);

    return () => clearInterval(interval);
  }, [mood]);

  const suffix = SUFFIX[currentMood];
  const src = `${PATH}/${value}-${suffix}.png`;

  return (
    <div className={`avatar ${size}`}>
      <img
        src={src}
        alt={value}
        draggable={false}
        onError={(event) => {
          event.currentTarget.src = `${PATH}/default-${suffix}.png`;
        }}
      />
    </div>
  );
}
