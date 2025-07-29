module.exports = {
    content: ["./src/templates/**/*.{njk,html}", "./content/**/*.md"],
    theme: {
        extend: {
            colors: {
                primary: "#3B82F6", // 主色调
                secondary: "#10B981", // 辅助色
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["Fira Code", "monospace"],
            },
        },
    },
    plugins: [],
};