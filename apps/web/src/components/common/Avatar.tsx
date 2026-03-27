import { useEffect, useState } from 'react';

type AvatarProps = {
  readonly value: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly isWin?: boolean;
};

const PATH = '/assets/avatars';

export function Avatar({ value, size = 'sm', isWin = false }: AvatarProps) {
  const [showWin, setShowWin] = useState(isWin);

  useEffect(() => {
    if (!isWin) {
      setShowWin(false);
      return;
    }

    let isAlt = false;

    const interval = setInterval(() => {
      isAlt = !isAlt;
      setShowWin(isAlt);
    }, 400);

    return () => clearInterval(interval);
  }, [isWin]);

  const suffix = showWin ? 'w' : 'n';
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
