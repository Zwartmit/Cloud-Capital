import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, X } from 'lucide-react';

interface CollaboratorProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (proof: File, reference: string) => void;
    taskType: string;
    taskAmount: number;
}

export const CollaboratorProofModal: React.FC<CollaboratorProofModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    taskType,
    taskAmount
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [reference, setReference] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo no debe superar 5MB');
            return;
        }

        setError('');
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!reference.trim()) {
            setError('Debes ingresar el número de referencia');
            return;
        }

        if (!selectedFile) {
            setError('Debes adjuntar un comprobante');
            return;
        }

        onSubmit(selectedFile, reference);
        handleClose();
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setReference('');
        setError('');
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Comprobante de gestión">
            <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                        <strong>Tipo:</strong> {taskType === 'DEPOSIT_MANUAL' ? 'Depósito' : 'Retiro'}
                    </p>
                    <p className="text-sm text-blue-400">
                        <strong>Monto:</strong> ${taskAmount.toFixed(2)} USDT
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Número de referencia *
                    </label>
                    <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                        placeholder="Ingrese el número de referencia"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Adjuntar comprobante *
                    </label>
                    <p className="text-xs text-gray-500">
                        Sube una captura de la conversación de WhatsApp
                    </p>

                    {!selectedFile ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-400">
                                    <span className="font-semibold">Click para subir</span> o arrastra aquí
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    ) : (
                        <div className="relative">
                            <div className="border border-gray-700 rounded-lg p-2 bg-gray-800">
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-48 object-contain rounded"
                                    />
                                )}
                                <p className="text-xs text-gray-400 mt-2 text-center">{selectedFile.name}</p>
                            </div>
                            <button
                                onClick={removeFile}
                                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-500 rounded-full text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFile || !reference.trim()}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                    >
                        Aprobar con comprobante
                    </button>
                </div>
            </div>
        </Modal>
    );
};
