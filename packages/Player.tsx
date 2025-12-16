// src/components/LyricPlayer.tsx
import React, { CSSProperties, PropsWithChildren } from 'react';
import { AppleMusicLyric, LyricWord, parseTTMLToAppleMusicLyric } from './utils';
import { useLyricPlayer } from './useLyricPlayer';
import './index.scss';

interface LyricPlayerProps {
    ttmlStr: string; // 原始 TTML 字符串
    isPlaying: boolean;
    currentTime: number;
    onTimeChange: (time: number) => void; // 通知播放器跳转时间
}

const LyricPlayer: React.FC<LyricPlayerProps> = ({
    ttmlStr,
    isPlaying,
    currentTime,
    onTimeChange
}) => {
    // 解析 TTML 歌词（只解析一次）
    const [lyric, setLyric] = React.useState<AppleMusicLyric | null>(null);
    React.useEffect(() => {
        try {
            const parsedLyric = parseTTMLToAppleMusicLyric(ttmlStr);
            setLyric(parsedLyric);
        } catch (e) {
            console.error('解析TTML失败:', e);
            setLyric(null);
        }
    }, [ttmlStr]);

    // 使用自定义Hook管理状态
    const {
        lyricContainerRef,
        currentLineRef,
        currentLine,
        currentWord,
        progressInWord,
        jumpToLine
    } = useLyricPlayer({
        lyric,
        isPlaying,
        currentTime
    });

    if (!lyric) return <div className="lyric-loading">加载歌词中...</div>;

    return (
        <div
            className="flex flex-col gap-3 h-100 overflow-y-scroll bg-gray-300"
            ref={lyricContainerRef}
        >
            <div
                className='flex flex-col'
            // onClick={() => jumpToLine(line, onTimeChange)} // 点击行跳转播放
            >
                {/* 逐字渲染（核心：Apple Music 逐字高亮） */}
                <div className="flex">
                    {currentLine?.words.filter(word => !word.isBackground).map((word, idx) => {
                        const isCurrentWord = currentWord?.begin === word.begin;
                        const isBeforeCurrent = currentWord && word.begin < currentWord.begin;
                        const isSung = isBeforeCurrent;
                        const text = word.text;

                        return (
                            <>
                                {/* <span
                                            key={`${line.lineId}-main-${idx}`}
                                            className={`
                                                lyric-word
                                                ${isSung && 'lyric-word--sung'
                                                }`}
                                            style={isCurrentWord ? {
                                                // 逐字高亮动画
                                                '--progress': `${(progressInWord) * 100}%`,
                                            } as CSSProperties : {
                                                "--progress": isBeforeCurrent ? '100%' : "0%"
                                            } as CSSProperties}
                                        >
                                            {text}
                                        </span> */}
                                <Word
                                    currentTime={currentTime}
                                    word={word}
                                    isSung={isSung}
                                    // isCurrentLine={isCurrentLine}
                                    // key={`${line.lineId}-main-${idx}`}
                                    progress={progressInWord * 100}
                                    isCurrentWord={isCurrentWord}
                                >{text}</Word>
                            </>
                        );
                    })}
                    {/* 背景歌词 - 只在当前行有背景歌词且该行激活时显示 */}
                    {/* {isCurrent && line.words.some(word => word.isBackground) && (
                                <div className="lyric-words-background">
                                    {line.words.filter(word => word.isBackground).map((word, idx) => {
                                        const isCurrentWord = currentWord?.begin === word.begin;
                                        const isBeforeCurrent = currentWord && word.begin < currentWord.begin;
                                        const isSung = isBeforeCurrent || (isCurrentWord && progressInWord > 0);

                                        return (
                                            <span
                                                key={`${line.lineId}-bg-${idx}`}
                                                className={`lyric-word lyric-word--background ${isCurrentWord ? 'lyric-word--active' : ''
                                                    } ${isSung ? 'lyric-word--sung' : ''
                                                    }`}
                                                style={{
                                                    backgroundSize: isCurrentWord ? `${progressInWord * 100}% 100%` : '0% 100%',
                                                    '--progress': isCurrentWord ? `${progressInWord * 100}%` : '0%'
                                                } as CSSProperties}
                                            >
                                                {word.text}
                                            </span>
                                        );
                                    })}
                                </div>
                            )} */}
                </div>
                {/* 段落标签（可选，如 Verse/Chorus） */}
            </div>
        </div>

    );
};


function Word({ children, progress, isCurrentWord, isSung, word, currentTime }: PropsWithChildren<{
    progress: number;
    isCurrentWord: boolean;
    className?: string;
    isSung: boolean;
    word: LyricWord;
    currentTime: number;
}>) {
    return <span className='relative inline-block'>
        <div className='absolute left-0 top-0 z-1 text-red-700 lyric-word'
            style={{
                // color: isCurrentLine ? 'red' : 'gray',
                '--progress': !isSung ? isCurrentWord ? `${progress}%` : '0%' : '100%'

            } as CSSProperties}
        >{children}</div>
        <span className='relative left-0 top-0 z-0'
            style={{
                // color: isCurrentLine ? 'white' : 'gray',
            }}
        >{children}</span>
    </span>
}
export default LyricPlayer;