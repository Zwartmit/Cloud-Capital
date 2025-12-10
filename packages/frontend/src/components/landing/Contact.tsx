import { useEffect, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { contactService } from '../../services/contactService';
import { ScrollReveal } from '../common/ScrollReveal';

export const Contact: React.FC = () => {
    const [contactInfo, setContactInfo] = useState<{ email?: string | null; telegram?: string | null }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContactInfo = async () => {
            try {
                const data = await contactService.getContactInfo();
                setContactInfo(data);
            } catch (error) {
                console.error('Error loading contact info:', error);
            } finally {
                setLoading(false);
            }
        };
        loadContactInfo();
    }, []);

    // Don't render if no contact info is available
    if (!loading && !contactInfo.email && !contactInfo.telegram) {
        return null;
    }

    return (
        <ScrollReveal animation="fade-in">
            <section id="contact-section" className="max-w-4xl mx-auto mb-16 sm:mb-28 px-4 sm:px-6">
                <h2 className="text-3xl sm:text-5xl font-black text-center gradient-text-primary mb-3 sm:mb-4">
                    Contacto
                </h2>
                <p className="text-center text-gray-400 text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
                    ¿Tienes preguntas? Estamos aquí para ayudarte
                </p>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="skeleton h-32 w-full max-w-md rounded-2xl" />
                    </div>
                ) : (
                    <div className="card !bg-[#0B1120] p-6 sm:p-10 rounded-3xl border border-gray-800 shadow-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            {contactInfo.email && (
                                <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-accent transition-all duration-300 hover-lift">
                                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                                        <Mail className="w-8 h-8 text-accent" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                                    <a
                                        href={`mailto:${contactInfo.email}`}
                                        className="text-gray-400 hover:text-accent transition-colors break-all"
                                    >
                                        {contactInfo.email}
                                    </a>
                                </div>
                            )}

                            {contactInfo.telegram && (
                                <div className="flex flex-col items-center text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-accent transition-all duration-300 hover-lift">
                                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                                        <Send className="w-8 h-8 text-accent" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Telegram</h3>
                                    <a
                                        href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-accent transition-colors"
                                    >
                                        {contactInfo.telegram}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </ScrollReveal>
    );
};
