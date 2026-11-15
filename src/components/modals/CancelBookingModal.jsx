import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

// Asks for confirmation before a booking is cancelled and refunded.
const CancelBookingModal = ({ booking, cancelling, onClose, onConfirm }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith('hu') ? 'hu-HU' : 'en-GB';

    if (!booking) return null;

    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />

            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-sm text-[#27374D]">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="bg-red-700 p-2 rounded-lg text-white">
                            <Trash size={24} weight="fill" />
                        </div>
                        <DialogTitle className="text-xl font-bold">
                            {t('booking.cancel.title')}
                        </DialogTitle>
                    </div>

                    <p className="font-semibold">
                        {formatDate(booking.startDate)} –{' '}
                        {formatDate(booking.endDate)} ·{' '}
                        {t('booking.palletCount', {
                            count: booking.totalPallets,
                        })}
                    </p>
                    <p className="text-gray-500 mt-2">
                        {t('booking.cancel.text', {
                            amount: `${new Intl.NumberFormat(locale).format(booking.totalAmount ?? 0)} Ft`,
                        })}
                    </p>

                    <div className="flex flex-wrap justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={cancelling}
                            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            {t('booking.cancel.keep')}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={cancelling}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {cancelling ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t('booking.cancel.confirm')
                            )}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default CancelBookingModal;
