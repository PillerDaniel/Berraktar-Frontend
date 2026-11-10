import { useState } from 'react';
import { FloppyDisk } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

const ProfileFieldRow = ({
    icon: Icon,
    label,
    fieldName,
    endpoint,
    bodyKey,
    currentValue,
    inputType = 'text',
    formatter,
    onSave,
}) => {
    const { t } = useTranslation();
    const [newValue, setNewValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        let val = e.target.value;
        if (inputType === 'number') {
            val = val.replace(/\D/g, '');
        }
        setNewValue(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = newValue.trim();
        if (!trimmed || trimmed === String(currentValue ?? '')) return;

        setSubmitting(true);
        const success = await onSave(endpoint, bodyKey, trimmed, fieldName);
        if (success) {
            setNewValue('');
        }
        setSubmitting(false);
    };

    const displayedCurrentValue =
        formatter && currentValue
            ? formatter(String(currentValue))
            : (currentValue ?? '');

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
        >
            <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D]">
                <Icon size={18} /> {label}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                <input
                    type="text"
                    disabled
                    value={displayedCurrentValue}
                    placeholder={t('profile.empty')}
                    className="w-full p-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg border border-gray-300 cursor-not-allowed select-none"
                />

                <input
                    type={inputType === 'number' ? 'text' : inputType}
                    inputMode={inputType === 'number' ? 'numeric' : 'text'}
                    value={newValue}
                    onChange={handleInputChange}
                    placeholder={t('profile.newPlaceholder')}
                    className="w-full p-2.5 bg-white text-[#27374D] text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none"
                />

                <button
                    type="submit"
                    disabled={submitting || !newValue.trim()}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {submitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <FloppyDisk size={18} weight="bold" />
                            {t('profile.save')}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileFieldRow;
