import { useEffect, useRef } from 'react';

interface SaleItem {
  id: number;
  productId: number;
  qty: number;
  price: number;
  productName?: string;
}

interface Sale {
  id: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
  customer?: { name: string };
}

interface ReceiptProps {
  sale: Sale;
  onClose: () => void;
  getProductName: (id: number) => string;
}

export default function Receipt({ sale, onClose, getProductName }: ReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nota - #${sale.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin-bottom: 5px; }
          .info { margin-bottom: 15px; }
          .info p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          td { padding: 4px 0; vertical-align: top; }
          td:nth-child(2) { text-align: right; }
          .total-row { border-top: 1px dashed #000; font-weight: bold; padding-top: 8px !important; }
          .total-row td { border-top: 1px dashed #000; }
          .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Preview Nota</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div ref={printRef} className="p-4 bg-white text-black">
          <div className="header">
            <h2 className="text-xl font-bold">apotik</h2>
            <p className="text-sm">Jl. Apotik No. 1</p>
            <p className="text-sm">Telp: 021-1234567</p>
          </div>

          <div className="info">
            <p><strong>No:</strong> #{sale.id.toString().padStart(6, '0')}</p>
            <p><strong>Tanggal:</strong> {formatDate(sale.createdAt)}</p>
          </div>

          <table>
            <tbody>
              {sale.items.map((item, i) => (
                <tr key={i}>
                  <td>{getProductName(item.productId)}</td>
                  <td></td>
                </tr>
              ))}
              {sale.items.map((item, i) => (
                <tr key={`qty-${i}`}>
                  <td style={{ paddingLeft: '16px', fontSize: '11px' }}>{item.qty} x Rp {Number(item.price).toLocaleString()}</td>
                  <td>Rp {Number(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>TOTAL</td>
                <td>Rp {Number(sale.totalAmount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="footer">
            <p>Terima Kasih</p>
            <p className="mt-1">Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <div className="p-4 border-t flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Tutup</Button>
          <Button variant="primary" onClick={handlePrint} className="flex-1">Cetak</Button>
        </div>
      </div>
    </div>
  );
}

import Button from './Button';