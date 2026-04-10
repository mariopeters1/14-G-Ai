import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Gastronomic AI';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141922',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFC01E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="300" height="300">
          <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589c-1.036 0-1.942.502-2.483 1.258-.2-.047-.406-.07-.61-.07a5 5 0 1 0-4.633 6.94A1 1 0 0 0 9 14.65V20a1 1 0 0 0 1 1h7Z" />
          <path d="M9 17h8" />
          <path d="M9 13h8" />
        </svg>
        <div
          style={{
            marginTop: 40,
            fontSize: 60,
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '0.05em',
            fontFamily: 'sans-serif',
          }}
        >
          Gastronomic AI
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
