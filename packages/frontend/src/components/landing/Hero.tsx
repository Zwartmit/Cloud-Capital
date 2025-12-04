import { useNavigate } from 'react-router-dom';
import { ChevronsDown } from 'lucide-react';

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section id="hero" className="text-center max-w-7xl mx-auto pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white leading-tight">
                Cloud Capital
                <span className="block text-accent text-2xl sm:text-4xl lg:text-5xl mt-2">Donde el futuro se mina y se multiplica</span>
            </h1>
            <p className="text-base sm:text-lg italic text-gray-400 mb-6 sm:mb-10 max-w-4xl mx-auto">
                Gana más. Crece limpio. Invierte inteligente.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5 mt-6 sm:mt-10">
                <button
                    onClick={() => navigate('/login')}
                    className="bg-profit hover:bg-emerald-400 text-black font-extrabold py-3 sm:py-4 px-8 sm:px-10 rounded-xl shadow-xl shadow-profit/30 transition-all text-base sm:text-lg"
                >
                    Comenzar a invertir
                </button>
                <a
                    href="#plans-section"
                    className="border border-gray-400 hover:border-accent hover:text-accent text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-xl transition-all text-base sm:text-lg flex items-center justify-center"
                >
                    <ChevronsDown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Explorar planes
                </a>
            </div>
        </section>
    );
};
