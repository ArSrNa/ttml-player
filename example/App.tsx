import { useEffect, useRef, useState } from 'react';
import Player from '../packages';
import './index.scss';


function App() {
  const [XML, setXML] = useState(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function onTimeChange() {
    setCurrentTime(audioRef.current.currentTime || 0);
    setIsPlaying(!audioRef.current.paused || false);
    requestAnimationFrame(onTimeChange);
  }

  useEffect(() => {
    fetch('/提瓦特民谣_星空版.xml')
      .then(res => res.text())
      .then(xml => {
        setXML(xml);
        onTimeChange();
      });
  }, []);

  return (
    <>
      {XML !== null && <Player
        ttmlStr={XML}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onTimeChange={console.log}
      />}

      <audio src="/鹿喑kana & 多多poi & Mace & 陶典 & 孙晔 & 花玲 - 提瓦特民谣 星空版.mp3" controls ref={audioRef} />
    </>
  );
}

export default App;
