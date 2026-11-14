import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Receipt, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const invoiceStatusStyles = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    refunded: 'bg-gray-200 text-gray-700',
};

// Receipt of one booking, built from the data GET /booking already returns.
const ReceiptModal = ({ booking, buyerEmail, onClose }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith('hu') ? 'hu-HU' : 'en-GB';

    if (!booking?.invoice) return null;

    const { invoice, warehouse } = booking;

    const days = Math.round(
        (new Date(`${booking.endDate}T00:00:00Z`) -
            new Date(`${booking.startDate}T00:00:00Z`)) /
            MS_PER_DAY
    );
    // a booking has a single storage type, so the daily pallet price follows
    // from the paid total
    const pricePerPalletPerDay =
        invoice.amount / (booking.totalPallets * days);

    const formatMoney = (amount) =>
        `${new Intl.NumberFormat(locale).format(amount)} Ft`;
    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    const typeLabel =
        booking.type === 'refrigerated'
            ? t('booking.typeRefrigerated')
            : t('booking.typeNone');

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />

            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 text-sm text-[#27374D]">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#27374D] p-2 rounded-lg text-white">
                                <Receipt size={24} weight="fill" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    {t('booking.receipt.title')}
                                </DialogTitle>
                                <p className="text-xs text-gray-500 break-all">
                                    {t('booking.receipt.number')}: {invoice.id}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('booking.receipt.close')}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
                        <dt className="text-gray-500">
                            {t('booking.receipt.issuedAt')}
                        </dt>
                        <dd className="text-right">
                            {new Date(invoice.issuedAt).toLocaleString(locale)}
                        </dd>

                        <dt className="text-gray-500">
                            {t('booking.receipt.buyer')}
                        </dt>
                        <dd className="text-right break-all">{buyerEmail}</dd>

                        {warehouse && (
                            <>
                                <dt className="text-gray-500">
                                    {t('booking.warehouse')}
                                </dt>
                                <dd className="text-right">
                                    {warehouse.city}, {warehouse.address}
                                </dd>
                            </>
                        )}

                        <dt className="text-gray-500">
                            {t('booking.period')}
                        </dt>
                        <dd className="text-right">
                            {formatDate(booking.startDate)} –{' '}
                            {formatDate(booking.endDate)}
                        </dd>

                        <dt className="text-gray-500">
                            {t('booking.receipt.paymentMethod')}
                        </dt>
                        <dd className="text-right">
                            {t('booking.receipt.wallet')}
                        </dd>
                    </dl>

                    <h4 className="font-bold mt-5 mb-2">
                        {t('booking.receipt.items')}
                    </h4>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-baseline justify-between gap-4">
                            <span>
                                {t('booking.receipt.storage', {
                                    type: typeLabel,
                                })}
                            </span>
                            <span className="font-semibold tabular-nums whitespace-nowrap">
                                {formatMoney(invoice.amount)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 tabular-nums mt-1">
                            {t('booking.palletCount', {
                                count: booking.totalPallets,
                            })}{' '}
                            × {formatMoney(pricePerPalletPerDay)} ×{' '}
                            {t('booking.days', { count: days })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('booking.receipt.shelves', {
                                count: booking.shelves.length,
                            })}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-200">
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${invoiceStatusStyles[invoice.status] ?? invoiceStatusStyles.pending}`}
                        >
                            {t(`booking.receipt.status.${invoice.status}`)}
                        </span>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                {t('booking.receipt.total')}
                            </p>
                            <p className="text-xl font-bold tabular-nums">
                                {formatMoney(invoice.amount)}
                            </p>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ReceiptModal;
