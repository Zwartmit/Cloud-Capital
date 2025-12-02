/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0A0A18',
                secondary: '#1F2937',
                accent: '#3B82F6',
                profit: '#10B981',
                danger: '#EF4444',
                admin: '#FBBF24',
                'super-admin': '#F97316',
                subadmin: '#8B5CF6',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
