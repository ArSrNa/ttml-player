// src/hooks/useLyricPlayer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppleMusicLyric, getCurrentLyric, LyricWord } from './utils';
import { LyricLine } from './utils';

interface UseLyricPlayerProps {
    lyric: AppleMusicLyric | null; // 解析后的歌词数据
    isPlaying: boolean; // 是否正在播放
    currentTime: number; // 播放器当前时间（秒）
}

export const useLyricPlayer = ({ lyric, isPlaying, currentTime }: UseLyricPlayerProps) => {
    // 核心状态
    const [currentLine, setCurrentLine] = useState<LyricLine | null>(null);
    const [currentWord, setCurrentWord] = useState<LyricWord | null>(null);
    const [progressInWord, setProgressInWord] = useState(0);

    // 歌词容器Ref（用于滚动到当前行）
    const lyricContainerRef = useRef<HTMLDivElement>(null);
    const currentLineRef = useRef<HTMLDivElement>(null);

    // 匹配当前歌词（缓存函数避免重复渲染）
    const matchCurrentLyric = useCallback(() => {
        if (!lyric) return;
        const result = getCurrentLyric(lyric, currentTime);
        setCurrentLine(result.currentLine);
        setCurrentWord(result.currentWord);
        setProgressInWord(result.progressInWord);
    }, [lyric, currentTime]);

    // 监听时间变化，匹配歌词
    useEffect(() => {
        if (!isPlaying || !lyric) return;
        matchCurrentLyric();
    }, [currentTime, isPlaying, lyric, matchCurrentLyric]);

    // 滚动到当前行（Apple Music 居中效果）
    useEffect(() => {
        if (currentLineRef.current && lyricContainerRef.current) {
            const container = lyricContainerRef.current;
            const line = currentLineRef.current;
            // 计算滚动位置：让当前行居中
            const scrollTop = line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2;
            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth' // 平滑滚动
            });
        }
    }, [currentLine]);

    // 手动跳转到指定行
    const jumpToLine = useCallback((line: LyricLine, onJump: (time: number) => void) => {
        setCurrentLine(line);
        onJump(line.begin); // 通知播放器跳转时间
    }, []);

    return {
        lyricContainerRef,
        currentLineRef,
        currentLine,
        currentWord,
        progressInWord,
        jumpToLine
    };
};