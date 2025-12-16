import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReactNode, useRef, useLayoutEffect } from "react";
import { randomStr } from "./utils";

gsap.registerPlugin(useGSAP);

export function SpringEffect({
    items,
    current
}: {
    items: ReactNode[];
    current: number;
}) {
    const prefix = randomStr(5);
    const className = (name: string) => `_${prefix}_${name}`;

    const viewportRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<HTMLDivElement[]>([]);

    const LINE_HEIGHT = 48; // 每行高度，可根据实际调整
    const ANCHOR_RATIO = 0.45; // 当前行锚点在 viewport 的比例

    /* ===============================
     * 核心：整体容器滚动
     * =============================== */
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;
        const currentLine = lineRefs.current[current];
        if (!viewport || !inner || !currentLine) return;

        const anchorY = viewport.clientHeight * ANCHOR_RATIO;
        const targetY = -(currentLine.offsetTop - anchorY);

        gsap.to(inner, {
            y: targetY,
            duration: 0.2,
            // ease: "elastic.out(1, 0.45)",
            ease: 'power2.out',
            overwrite: "auto"
        });
    }, [current]);

    /* ===============================
     * 当前行 + 未来歌词弹性 + 上方歌词 fade
     * =============================== */
    useGSAP(() => {
        lineRefs.current.forEach((el, i) => {
            if (!el) return;

            const distance = i - current;

            // 上方已唱歌词：只做淡出，固定位置
            if (distance < 0) {
                gsap.to(el, { opacity: 0.3, scale: 1, duration: 0.3, ease: "elastic.out(1, 0.45)" });
                gsap.set(el, { y: 0 });
                return;
            }

            // 当前行或未来歌词：从下方弹上
            const fromY = distance * LINE_HEIGHT * 0.9; // 初始位移
            const delay = distance * 0.05; // 弹性延迟

            gsap.fromTo(
                el,
                { y: fromY, opacity: distance === 0 ? 1 : 0.6, scale: distance === 0 ? 1 : 1 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.9,
                    delay,
                    ease: "elastic.out(0.9, 0.45)",
                    overwrite: "auto"
                }
            );
        });
    }, [items, current]);

    /* ===============================
     * 渲染
     * =============================== */
    return (
        <div
            ref={viewportRef}
            className="h-150 overflow-hidden relative"
        >
            <div
                ref={innerRef}
                className="flex flex-col gap-10 will-change-transform"
            >
                {items.map((m, i) => (
                    <div
                        key={`bounce_${i}`}
                        ref={(el) => {
                            if (el) lineRefs.current[i] = el;
                        }}
                        className={className(`bounce-item${i}`)}
                        style={{
                            color: i === current ? "black" : "gray",
                        }}
                    >
                        {m}
                    </div>
                ))}
            </div>
        </div>
    );
}
