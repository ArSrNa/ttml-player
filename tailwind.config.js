/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FF2D55", // Apple Music 红色
                lyric: {
                    normal: "rgba(255, 255, 255, 0.5)",
                    active: "#FFFFFF",
                    bg: "rgba(255, 255, 255, 0.15)",
                }
            },
            animation: {
                'bounce-scroll': 'bounceScroll 0.3s ease-out',
            },
            keyframes: {
                bounceScroll: {
                    '0%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(-8px)' },
                }
            }
        },
    },
    plugins: [],
}