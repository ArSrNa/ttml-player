// src/components/LyricPlayer.tsx
import React, { CSSProperties } from 'react';
import { AppleMusicLyric, parseTTMLToAppleMusicLyric } from './utils';
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
        <div className="apple-music-lyric">
            {/* 元信息区域 */}
            <div className="lyric-meta">
                <h3 className="lyric-artist">{lyric.meta.artist}</h3>
                <p className="lyric-songwriters">
                    词曲：{lyric.meta.songwriters.join(', ')}
                </p>
            </div>

            {/* 歌词主体区域 */}
            <div
                className="lyric-container"
                ref={lyricContainerRef}
            >
                {/* 遍历所有行渲染 */}
                {lyric.allLines.map((line) => {
                    const isCurrent = line.lineId === currentLine?.lineId;
                    return (
                        <div
                            key={line.lineId}
                            className={`lyric-line ${isCurrent ? 'lyric-line--active' : ''}`}
                            ref={isCurrent ? currentLineRef : null}
                            onClick={() => jumpToLine(line, onTimeChange)} // 点击行跳转播放
                        >
                            {/* 逐字渲染（核心：Apple Music 逐字高亮） */}
                            <div className="lyric-words">
                                {/* 主歌词 */}
                                <div className="lyric-words-main">
                                    {line.words.filter(word => !word.isBackground).map((word, idx) => {
                                        const isCurrentWord = currentWord?.begin === word.begin;
                                        const isBeforeCurrent = currentWord && word.begin < currentWord.begin;
                                        const isSung = isBeforeCurrent || (isCurrentWord && progressInWord > 0);

                                        return (
                                            <span
                                                key={`${line.lineId}-main-${idx}`}
                                                className={`lyric-word ${isCurrentWord ? 'lyric-word--active' : ''
                                                    } ${isSung ? 'lyric-word--sung' : ''
                                                    }`}
                                                style={isCurrentWord ? {
                                                    // 逐字高亮动画
                                                    '--progress': `${(progressInWord) * 100}%`,
                                                } as CSSProperties : {
                                                    "--progress": "100%"
                                                } as CSSProperties}
                                            >
                                                {word.text}
                                                {word.text.trim() === '' && <span>&nbsp;</span>}
                                            </span>
                                        );
                                    })}
                                </div>
                                {/* 背景歌词 - 只在当前行有背景歌词且该行激活时显示 */}
                                {isCurrent && line.words.some(word => word.isBackground) && (
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
                                )}
                            </div>
                            {/* 段落标签（可选，如 Verse/Chorus） */}
                            {/* <span className="lyric-part-tag">{line.part}</span> */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LyricPlayer;