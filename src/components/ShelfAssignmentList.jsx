import { Snowflake, Cube } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

// Shelves have no label of their own, the first block of the id stands in.
const shelfCode = (shelfId) => `#${shelfId.slice(0, 8)}`;

// The shelves of a booking with the pallets on each, as warehouse staff see it.
const ShelfAssignmentList = ({ shelves }) => {
    const { t } = useTranslation();

    return (
        <ul className="flex flex-col gap-2">
            {shelves.map((shelf) => (
                <li
                    key={shelf.shelfId}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                >
                    <span className="flex items-center gap-2">
                        {shelf.type === 'refrigerated' ? (
                            <Snowflake size={18} weight="bold" />
                        ) : (
                            <Cube size={18} weight="bold" />
                        )}
                        <span
                            className="font-mono font-semibold"
                            title={shelf.shelfId}
                        >
                            {shelfCode(shelf.shelfId)}
                        </span>
                        <span className="text-gray-500">
                            {shelf.type === 'refrigerated'
                                ? t('booking.typeRefrigerated')
                                : t('booking.typeNone')}{' '}
                            ·{' '}
                            {t('inbound.capacity', { count: shelf.capacity })}
                        </span>
                    </span>
                    <span className="font-bold tabular-nums">
                        {t('booking.palletCount', {
                            count: shelf.assignedPallets,
                        })}
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default ShelfAssignmentList;
