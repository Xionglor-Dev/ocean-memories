"use client";

import { motion } from "framer-motion";

type MemoryNoteStickerProps = {
  memoryId: string;
  shouldReduceMotion: boolean | null;
};

type StickerDrawingProps = {
  className?: string;
};

const stickerDrawings = [
  FloatingHeartsSticker,
  BunnyFlowerSticker,
  WingHeartSticker,
  BunnyBalloonSticker,
  SparkleHeartsSticker,
  BunnyTinyLoveSticker,
  HappyTinyCharacterSticker,
  SleepyTinyCharacterSticker,
  CryingTinyCharacterSticker,
  SadTinyCharacterSticker,
  AngryTinyCharacterSticker,
];

const stickerRotations = [-6, 4, -4, 5, -5, 3];

export function MemoryNoteSticker({
  memoryId,
  shouldReduceMotion,
}: MemoryNoteStickerProps) {
  const seed = hashMemoryId(memoryId);
  const StickerDrawing = stickerDrawings[seed % stickerDrawings.length];
  const rotate = stickerRotations[seed % stickerRotations.length];
  const driftDuration = 7 + (hashMemoryId(`${memoryId}-drift`) % 5);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute right-1 top-2 z-20 h-20 w-28 drop-shadow-[0_12px_20px_rgba(145,65,84,0.16)] sm:right-4 sm:top-4 sm:h-24 sm:w-32"
      style={{ rotate: `${rotate}deg` }}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              y: [0, -4, 0],
              rotate: [`${rotate}deg`, `${rotate + 2}deg`, `${rotate}deg`],
            }
      }
      transition={{
        duration: driftDuration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <StickerDrawing className="h-full w-full" />
    </motion.div>
  );
}

function FloatingHeartsSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <HeartPath
        d="M23 29C17 18 4 24 7 36C10 48 25 51 31 61C38 51 54 48 56 36C58 23 43 18 36 29L30 38L23 29Z"
        fill="#FFD5E0"
      />
      <HeartPath
        d="M88 19C83 11 73 16 75 25C77 34 89 36 94 44C99 36 111 34 113 25C115 15 104 11 99 19L94 27L88 19Z"
        fill="#FFE9F0"
      />
      <HeartPath
        d="M103 58C98 50 87 54 89 64C91 73 103 75 108 84C114 75 126 73 128 64C130 54 119 50 113 58L108 67L103 58Z"
        fill="#FFF3B8"
      />
      <path
        d="M20 73C35 67 47 68 60 74C75 82 94 82 113 72"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="72" cy="27" r="3" fill="#C2576E" />
      <circle cx="121" cy="16" r="3" fill="#C2576E" />
      <path
        d="M64 15V24M59 20H69"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BunnyFlowerSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M45 20C45 9 52 5 57 12C61 18 59 30 55 38M70 20C72 9 80 6 84 14C87 22 81 33 74 39"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 52C38 33 52 23 68 27C83 31 91 45 87 62C83 78 68 87 53 82C43 79 38 68 38 52Z"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
      />
      <circle cx="59" cy="51" r="3" fill="#C2576E" />
      <circle cx="73" cy="51" r="3" fill="#C2576E" />
      <path d="M63 62C66 65 70 65 73 62" stroke="#C2576E" strokeWidth="3" strokeLinecap="round" />
      <path d="M31 48C20 42 14 34 10 25" stroke="#C2576E" strokeWidth="4" strokeLinecap="round" />
      <HeartPath
        d="M18 23C14 15 5 19 7 27C9 35 18 37 22 43C27 37 37 35 38 27C40 18 30 15 25 23L22 29L18 23Z"
        fill="#FFD5E0"
      />
      <path
        d="M28 49C23 52 20 57 19 64M28 49C20 49 14 51 9 56"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M96 28C101 25 105 25 110 28M101 22C103 27 103 32 101 37"
        stroke="#FF9DB4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WingHeartSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <HeartPath
        d="M42 34C35 21 19 28 22 43C25 57 43 61 51 73C59 61 78 57 81 43C84 28 67 21 60 34L51 46L42 34Z"
        fill="#FFD5E0"
      />
      <path
        d="M15 42C6 44 4 52 11 57C18 62 29 58 39 48M88 48C98 58 110 62 117 57C124 52 122 44 113 42"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 43C23 43 30 46 38 51M113 43C105 43 98 46 90 51"
        stroke="#FFB8C9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <HeartPath
        d="M91 15C87 8 78 12 80 20C82 28 91 29 95 36C99 29 109 28 110 20C112 12 102 8 98 15L95 21L91 15Z"
        fill="#FFE9F0"
      />
      <HeartPath
        d="M55 13C51 6 42 10 44 18C46 26 56 27 60 34C64 27 74 26 76 18C78 10 68 6 64 13L60 19L55 13Z"
        fill="#FFF7F8"
      />
      <HeartPath
        d="M83 62C78 53 66 58 69 68C71 78 84 81 89 89C95 81 108 78 110 68C113 58 100 53 94 62L89 70L83 62Z"
        fill="#C2576E"
      />
    </svg>
  );
}

function BunnyBalloonSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <HeartPath
        d="M41 17C35 6 21 12 24 25C27 38 42 40 49 50C56 40 72 38 74 25C77 12 62 6 55 17L49 27L41 17Z"
        fill="#FFD5E0"
      />
      <path d="M51 51C52 59 56 65 63 70" stroke="#C2576E" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M65 35C65 24 72 20 77 27C81 34 78 44 73 51M88 35C90 24 98 21 101 29C104 38 98 48 92 53"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 65C58 49 70 41 84 44C98 47 105 60 101 74C97 87 84 92 71 87C62 84 58 75 58 65Z"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
      />
      <circle cx="78" cy="66" r="3" fill="#C2576E" />
      <circle cx="91" cy="66" r="3" fill="#C2576E" />
      <path d="M82 76C85 78 89 78 92 76" stroke="#C2576E" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 76C48 76 42 72 38 66" stroke="#C2576E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="55" r="3" fill="#FFB8C9" />
      <path
        d="M16 31C12 36 12 41 16 46M109 25C116 28 120 33 121 41"
        stroke="#FF9DB4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkleHeartsSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <HeartPath
        d="M54 31C47 18 30 25 33 40C36 55 55 58 63 71C72 58 91 55 94 40C97 25 79 18 71 31L63 43L54 31Z"
        fill="#FFD5E0"
      />
      <HeartPath
        d="M100 19C95 9 82 15 85 26C87 36 100 39 105 47C111 39 124 36 126 26C129 15 116 9 110 19L105 27L100 19Z"
        fill="#FFE9F0"
      />
      <HeartPath
        d="M28 61C23 52 11 57 13 68C16 78 28 80 34 89C40 80 53 78 55 68C58 57 45 52 39 61L34 69L28 61Z"
        fill="#FFE9F0"
      />
      <HeartPath
        d="M14 24C10 17 1 20 3 29C5 37 14 39 18 45C23 39 33 37 34 29C36 20 26 17 22 24L18 30L14 24Z"
        fill="#FFF7F8"
      />
      <circle cx="109" cy="65" r="4" fill="#FFF3B8" stroke="#C2576E" strokeWidth="3" />
      <path
        d="M20 10V19M15 14H24M78 12V22M73 17H83M113 78V88M108 83H118"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="120" cy="10" r="3" fill="#C2576E" />
    </svg>
  );
}

function BunnyTinyLoveSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M47 22C47 11 54 7 59 14C63 21 60 32 55 39M70 22C72 11 80 8 83 16C86 24 80 34 74 40"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M39 54C39 36 53 28 68 31C82 34 90 48 86 64C82 79 68 86 54 81C44 78 39 67 39 54Z"
        fill="#FFF7F8"
        stroke="#C2576E"
        strokeWidth="4"
      />
      <circle cx="59" cy="54" r="3" fill="#C2576E" />
      <circle cx="73" cy="54" r="3" fill="#C2576E" />
      <path d="M63 65C66 68 70 68 73 65" stroke="#C2576E" strokeWidth="3" strokeLinecap="round" />
      <HeartPath
        d="M22 53C17 43 5 48 8 59C10 69 23 72 28 80C34 72 47 69 49 59C52 48 39 43 33 53L28 61L22 53Z"
        fill="#FFD5E0"
      />
      <path
        d="M49 67C43 68 37 71 31 77M20 23C27 20 33 21 39 26M92 34C100 31 107 33 112 40"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="104" cy="58" r="3" fill="#FFB8C9" />
    </svg>
  );
}

function HappyTinyCharacterSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 74C39 73 30 62 30 49C30 29 45 16 64 16C84 16 99 30 99 50C99 62 91 72 80 75V84C80 87 78 89 75 89H70C67 89 65 87 65 84V79H62V84C62 87 60 89 57 89H53C50 89 48 87 48 84V75L50 74Z"
        fill="#FFFDFB"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M49 42L56 49L49 56M80 42L73 49L80 56"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57 60C62 67 72 67 77 60"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="43" cy="59" r="5" fill="#FFB8C9" opacity="0.72" />
      <circle cx="87" cy="59" r="5" fill="#FFB8C9" opacity="0.72" />
      <path
        d="M19 52L24 43L29 52L24 61L19 52ZM104 62L109 53L114 62L109 71L104 62Z"
        fill="#FFD66B"
        stroke="#FFA82E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M21 25C28 19 36 18 43 23M91 24C100 18 109 19 116 26"
        stroke="#FF9DB4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SleepyTinyCharacterSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M48 75C38 72 31 62 31 49C31 29 47 16 66 16C86 16 101 30 101 50C101 66 89 78 74 80C70 87 61 90 51 86C45 84 43 78 48 75Z"
        fill="#FFFDFB"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M52 48H61M78 48H87"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M56 64C61 61 68 61 73 64"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M89 51C97 58 97 69 88 75C80 69 80 58 89 51Z"
        fill="#7CCBFF"
        stroke="#3A91C7"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="45" cy="59" r="4" fill="#FFB8C9" opacity="0.7" />
      <path
        d="M42 84C34 89 22 88 17 80M52 87C45 93 33 94 25 89"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 29C33 24 40 24 46 28"
        stroke="#FF9DB4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CryingTinyCharacterSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38 61C35 42 46 24 64 21C84 18 101 32 102 52C103 67 94 78 81 82H49C43 78 39 72 38 61Z"
        fill="#FFFDFB"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M54 47H61M76 47H83"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M64 57C66 64 66 72 63 79M78 56C81 64 81 72 78 80"
        stroke="#36B8E8"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M58 76C67 83 78 83 87 76"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 82C47 87 64 88 99 82"
        stroke="#66DDF5"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M44 16C37 18 32 22 29 29M87 16C94 18 99 23 102 31"
        stroke="#30343B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 8"
      />
      <circle cx="47" cy="57" r="4" fill="#FFB8C9" opacity="0.65" />
      <circle cx="90" cy="57" r="4" fill="#FFB8C9" opacity="0.65" />
    </svg>
  );
}

function SadTinyCharacterSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 74C39 72 31 62 31 49C31 29 47 16 66 16C86 16 101 31 101 51C101 65 92 76 79 80V84C79 87 77 89 74 89H70C67 89 65 87 65 84V81H62V84C62 87 60 89 57 89H53C50 89 48 87 48 84V75L50 74Z"
        fill="#FFFDFB"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M52 46H59M79 46H86"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M57 66C63 58 74 58 81 66"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="44" cy="58" r="5" fill="#FFB8C9" opacity="0.72" />
      <circle cx="90" cy="58" r="5" fill="#FFB8C9" opacity="0.72" />
      <path
        d="M23 55C17 49 18 40 26 38C33 36 39 42 38 50"
        stroke="#FF9DB4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M24 56C31 58 36 62 40 69"
        stroke="#FF9DB4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M107 26C113 28 117 32 119 38M111 43C116 40 120 40 124 43"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AngryTinyCharacterSticker({ className }: StickerDrawingProps) {
  return (
    <svg
      viewBox="0 0 132 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M42 47C42 27 57 14 76 17C94 20 106 35 103 55C101 71 90 82 75 83C59 84 46 75 42 60V47Z"
        fill="#FFFDFB"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M51 19C63 13 80 14 91 22C98 27 101 34 103 43C85 42 69 36 51 19Z"
        fill="#FF9DB4"
        stroke="#C2576E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M58 50L65 57L58 64M89 50L82 57L89 64"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68 71C73 67 80 67 85 71"
        stroke="#30343B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="52" cy="65" r="5" fill="#FFB8C9" opacity="0.72" />
      <path
        d="M109 54C116 49 123 52 125 60C119 58 115 61 113 68C108 63 105 59 109 54Z"
        fill="#FFD5E0"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M117 52L120 47M122 57L128 55M116 65L119 70"
        stroke="#C2576E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M34 26C28 29 25 34 24 41M27 51C20 49 15 51 11 56"
        stroke="#30343B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 8"
      />
    </svg>
  );
}

function HeartPath({
  d,
  fill,
}: {
  d: string;
  fill: string;
}) {
  return (
    <path
      d={d}
      fill={fill}
      stroke="#C2576E"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

function hashMemoryId(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
