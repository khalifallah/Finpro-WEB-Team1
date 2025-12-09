'use client';

import Modal from '@/components/common/Modal';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface StockJournal {
  id: number;
  quantityChange: number;
  reason: string;
  createdAt: string;
}

interface StockJournalModalProps {
  isOpen: boolean;
  productName: string;
  journals: StockJournal[];
  onClose: () => void;
}

export default function StockJournalModal({
  isOpen,
  productName,
  journals,
  onClose,
}: StockJournalModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock History - ${productName}`}
      size="md"
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {journals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No history found</p>
          </div>
        ) : (
          journals.map((journal, index) => (
            <div
              key={journal.id || index}
              className={`p-4 rounded-lg border-l-4 ${
                journal.quantityChange > 0
                  ? 'border-l-success bg-success/5'
                  : 'border-l-error bg-error/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {journal.quantityChange > 0 ? (
                      <FiArrowUp className="w-4 h-4 text-success" />
                    ) : (
                      <FiArrowDown className="w-4 h-4 text-error" />
                    )}
                    <span
                      className={`font-bold ${
                        journal.quantityChange > 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {journal.quantityChange > 0 ? '+' : ''}
                      {journal.quantityChange} units
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{journal.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(journal.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span
                  className={`badge badge-sm ${
                    journal.quantityChange > 0 ? 'badge-success' : 'badge-error'
                  }`}
                >
                  {journal.quantityChange > 0 ? 'IN' : 'OUT'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}