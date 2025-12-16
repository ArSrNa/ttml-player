import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReactNode, useRef, useLayoutEffect, useMemo } from "react";
import { randomStr } from "./utils";

gsap.registerPlugin(useGSAP);

export function SpringEffect({
    items,
    current
}: {
    items: ReactNode[];
    current: number;
}) {
    const prefix = useMemo(() => randomStr(5), []);

    const className = useMemo(() => (name: string) => `_${prefix}_${name}`, [prefix]);

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
            duration: 0.3,
            // ease: "elastic.out(1, 0.45)",
            ease: 'power2.out',
            overwrite: "auto"
        });
    }, [current]);

    useGSAP(() => {
        const lines = lineRefs.current;
        lines.forEach((el) => gsap.killTweensOf(el));
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
        lines.forEach((el, i) => {
            if (!el) return;
            const distance = i - current;
            if (distance < 0) {
                const compress = Math.min(12, (-distance) * LINE_HEIGHT * 0.15);
                tl.to(el, { y: -compress, opacity: 0.8, duration: 0.15, ease: "power2.out" }, 0);
                tl.to(el, { y: 0, opacity: 0.3, duration: 0.35, ease: "back.out(1.2)" }, 0.12);
            } else {
                const fromY = distance * LINE_HEIGHT * 0.5;
                const delay = distance * 0.03;
                tl.fromTo(
                    el,
                    { y: fromY, opacity: distance === 0 ? 1 : 0.7 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "elastic.out(0.2, 0.4)" },
                    delay
                );
            }
        });
    }, [current]);

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
                        className={className(`bounce-item${i}`) + ' transform-origin-[0%_0%]'}
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
