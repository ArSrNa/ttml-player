// src/utils/lyric-utils.ts
import { XMLParser } from "fast-xml-parser";

// 时间格式转换："1:00.658" → 60.658 秒
export const timeStrToSeconds = (timeStr: string | number): number => {
    if (!timeStr && timeStr !== 0) return 0;
    const timeStrValue = String(timeStr);
    if (timeStrValue.includes(':')) {
        const [minPart, secPart] = timeStrValue.split(':');
        const minutes = parseFloat(minPart);
        const seconds = parseFloat(secPart);
        return minutes * 60 + seconds;
    }
    return parseFloat(timeStrValue);
};

// 核心类型定义
export interface LyricWord {
    text: string;
    begin: number;
    end: number;
    duration: number;
    isBackground?: boolean; // 是否为背景歌词
}

export interface LyricLine {
    lineId: string;
    begin: number;
    end: number;
    duration: number;
    words: LyricWord[];
    part: string;
    agent: string;
}

export interface LyricSection {
    part: string;
    begin: number;
    end: number;
    lines: LyricLine[];
}

export interface LyricMeta {
    artist: string;
    songwriters: string[];
    leadingSilence: number;
    totalDuration: number;
}

export interface AppleMusicLyric {
    meta: LyricMeta;
    sections: LyricSection[];
    allLines: LyricLine[];
    allWords: LyricWord[];
}

// TTML 解析核心函数
export const parseTTMLToAppleMusicLyric = (ttmlStr: string): AppleMusicLyric => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseAttributeValue: true,
        isArray: (tagName) => ['songwriter', 'div', 'p', 'span'].includes(tagName),
    });

    const xmlObj = parser.parse(ttmlStr);
    const tt = xmlObj.tt;
    const body = tt.body || {};
    const head = tt.head || {};

    // 解析元信息
    const meta: LyricMeta = {
        artist: head.metadata?.ttmagent?.ttmname || "Unknown",
        songwriters: head.metadata?.iTunesMetadata?.songwriters?.songwriter || [],
        leadingSilence: parseFloat(head.metadata?.iTunesMetadata?.leadingSilence || 0),
        totalDuration: timeStrToSeconds(body.dur || 0),
    };

    // 解析歌词内容
    const sections: LyricSection[] = [];
    const allLines: LyricLine[] = [];
    const allWords: LyricWord[] = [];

    const divs = Array.isArray(body.div) ? body.div : [body.div];
    divs.forEach(div => {
        if (!div || !div.p) return;
        const sectionPart = div.itunessongPart || "Unknown";
        const sectionBegin = timeStrToSeconds(div.begin);
        const sectionEnd = timeStrToSeconds(div.end);
        const sectionLines: LyricLine[] = [];

        const lines = Array.isArray(div.p) ? div.p : [div.p];
        lines.forEach(line => {
            if (!line || !line.span) return;
            const lineId = line.ituneskey || `line_${Math.random()}`;
            const lineBegin = timeStrToSeconds(line.begin);
            const lineEnd = timeStrToSeconds(line.end);
            const lineDuration = lineEnd - lineBegin;
            const lineAgent = line.ttmagent || meta.artist;
            const words: LyricWord[] = [];

            const spans = Array.isArray(line.span) ? line.span : [line.span];
            spans.forEach(span => {
                const role = span['ttm:role'] || span['role'] || span['ttmrole'];
                const isBgWrapper = role === 'x-bg';
                if (span.span) {
                    const nestedSpans = Array.isArray(span.span) ? span.span : [span.span];
                    nestedSpans.forEach(nestedSpan => {
                        const word = parseSpanToWord(nestedSpan, isBgWrapper);
                        if (word) {
                            words.push(word);
                            allWords.push(word);
                        }
                    });
                } else {
                    const word = parseSpanToWord(span, isBgWrapper);
                    if (word) {
                        words.push(word);
                        allWords.push(word);
                    }
                }
            });

            const lyricLine: LyricLine = {
                lineId,
                begin: lineBegin,
                end: lineEnd,
                duration: lineDuration,
                words,
                part: sectionPart,
                agent: lineAgent,
            };
            sectionLines.push(lyricLine);
            allLines.push(lyricLine);
        });

        sections.push({
            part: sectionPart,
            begin: sectionBegin,
            end: sectionEnd,
            lines: sectionLines,
        });
    });

    return { meta, sections, allLines, allWords };
};

// 解析 span 为单个字
const parseSpanToWord = (span: any, isBackground: boolean = false): LyricWord | null => {
    if (!span || !span["#text"] || !span.begin) return null;
    const begin = timeStrToSeconds(span.begin);
    const end = timeStrToSeconds(span.end);
    const text = span["#text"].trim();
    if (!text || begin >= end) return null;
    return { text, begin, end, duration: end - begin, isBackground };
};

// 根据当前时间匹配歌词
export const getCurrentLyric = (
    lyric: AppleMusicLyric,
    currentTime: number
) => {
    // 匹配当前行
    const currentLine = lyric.allLines.find(line =>
        currentTime >= line.begin && currentTime <= line.end
    ) || null;

    // 匹配当前字
    const currentWord = lyric.allWords.find(word =>
        currentTime >= word.begin && currentTime <= word.end
    ) || null;

    // 计算行内进度
    const progressInLine = currentLine
        ? Math.max(0, Math.min(1, (currentTime - currentLine.begin) / currentLine.duration))
        : 0;

    // 计算字内进度
    const progressInWord = currentWord
        ? Math.max(0, Math.min(1, (currentTime - currentWord.begin) / currentWord.duration))
        : 0;

    return { currentLine, currentWord, progressInLine, progressInWord };
};

export const randomStr = (l: number) => {
    return new Array(l).fill(0).map(m => Math.random().toString(36).substring(2, 3)).join('')
}
