import { useEffect, useRef } from 'react';

const AD_SCRIPT_SRC =
  'https://curoax.com/na/waWQiOjEyMzE5MzksInNpZCI6MTc5NTE0OSwid2lkIjo3NDQ0NDgsInNyYyI6Mn0=eyJ.js';

interface NativeAdBannerProps {
  className?: string;
}

export default function NativeAdBanner({ className = '' }: NativeAdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container.querySelector('script[data-native-ad]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = AD_SCRIPT_SRC;
    script.setAttribute('data-native-ad', 'true');
    container.appendChild(script);

    return () => {
      script.remove();
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
