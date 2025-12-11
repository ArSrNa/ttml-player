import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReactNode, useEffect, useRef } from "react";
import { randomStr } from "./utils";
gsap.registerPlugin(useGSAP);

export function SpringEffect({ items, current }: {
    items: ReactNode[],
    current: number
}) {
    const prefix = randomStr(5)
    const className = (name: string) => `_${prefix}_${name}`;
    const currentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        currentRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }, [current])

    useGSAP(() => {
        items.forEach((m, i) => {
            const diff = i - current;
            const n = '.' + className(`bounce-item${i}`);
            gsap.from(n, {
                y: diff * 100
            })
            const tl = gsap.timeline()
            tl.to(n, {
                y: 0,
                duration: 1,
                ease: 'bounce'
            }, diff * 0.05);
        })
    }, [items, current]);

    return <div className="flex flex-col gap-10 h-150 overflow-auto">
        {items.map((m, i) => {
            const diff = Math.abs(i - current);
            return (<div
                ref={i === current ? currentRef : null}
                className={className(`bounce-item${i}`)}
                style={{
                    color: i === current ? 'black' : 'gray',
                    filter: `blur(${diff / 2}px)`,
                    visibility: i <= current - 1 ? 'hidden' : 'visible'
                }}
                key={`bounce_${i}`}>{m}</div>)
        })}
    </div>
}