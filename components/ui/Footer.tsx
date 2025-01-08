import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="container mx-auto my-5 flex h-16 flex-col items-center justify-between space-y-3 border-t px-3 pt-4 text-center sm:h-20 sm:flex-row sm:pt-2 md:text-lg">
      <div className='text-black'>
        Made with{' '}
        <a
          href=""
          target="_blank"
          className="font-bold transition hover:text-white/50"
        >
          🎧 {' '}
        </a>
        <a
          href=""
          target="_blank"
          className="font-bold transition hover:text-white/50"
        >
          and
        </a>
        , ❤️ {' '}
        <a
          href=""
          target="_blank"
          className="font-bold transition hover:text-white/50"
        >
          in kampala. ©️
        </a>
      </div>
    </footer>
  );
}
