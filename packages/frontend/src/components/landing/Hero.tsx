import { useNavigate } from 'react-router-dom';
import { ChevronsDown } from 'lucide-react';

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section id="hero" className="text-center max-w-7xl mx-auto pt-20 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
            <h1 className="text-5xl sm:text-6xl font-black mb-6 sm:mb-8 text-white leading-tight">
                Cloud Capital
                <span className="block text-accent text-3xl sm:text-4xl mt-3 sm:mt-4 leading-snug">
                    Donde el futuro se mina y se multiplica
                </span>
            </h1>
            <p className="text-lg sm:text-xl italic text-gray-400 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
                Gana más. Crece limpio. Invierte inteligente.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5 mt-8 sm:mt-10">
                <button
                    onClick={() => navigate('/login')}
                    className="bg-profit hover:bg-emerald-400 text-black font-extrabold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl shadow-xl shadow-profit/30 transition-all text-base sm:text-lg w-full sm:w-auto"
                >
                    Comenzar a invertir
                </button>
                <a
                    href="#plans-section"
                    className="border border-gray-400 bg-gray-700 hover:border-accent hover:text-accent text-white font-semibold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl transition-all text-base sm:text-lg flex items-center justify-center w-full sm:w-auto"
                >
                    <ChevronsDown className="w-5 h-5 mr-2" /> Explorar planes
                </a>
            </div>
        </section>
    );
};
