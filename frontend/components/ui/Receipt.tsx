import { useEffect, useRef } from 'react';
import Button from './Button';

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const subtotal = (item: SaleItem) => item.qty * item.price;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nota #${sale.id.toString().padStart(6, '0')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-width: 280px;
            margin: 0 auto;
            padding: 16px;
          }
          .dashed { border-top: 1px dashed #333; margin: 8px 0; }
          .header { text-align: center; padding-bottom: 8px; }
          .header h1 { font-size: 18px; margin-bottom: 4px; }
          .header p { font-size: 11px; color: #555; }
          .info { margin: 12px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          td { padding: 3px 0; vertical-align: top; }
          .item-name { font-weight: 500; }
          .item-detail { padding-left: 12px; font-size: 11px; color: #444; }
          .item-price { text-align: right; }
          .total-section { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #333; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
          .footer { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #333; }
          .footer p { font-size: 11px; color: #555; margin-top: 4px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>apotik</h1>
          <p>Jl. Apotik No. 1, Jakarta</p>
          <p>Telp: 021-1234567</p>
        </div>

        <div class="dashed"></div>

        <div class="info">
          <div class="info-row">
            <span class="info-label">No. Transaksi:</span>
            <span>#${sale.id.toString().padStart(6, '0')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tanggal:</span>
            <span>${formatDate(sale.createdAt)}</span>
          </div>
        </div>

        <div class="dashed"></div>

        <table>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td colspan="2" class="item-name">${getProductName(item.productId)}</td>
              </tr>
              <tr>
                <td class="item-detail">${item.qty} x Rp ${Number(item.price).toLocaleString('id-ID')}</td>
                <td class="item-price">Rp ${Number(subtotal(item)).toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>TOTAL</span>
            <span>Rp ${Number(sale.totalAmount).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div class="footer">
          <p>================================</p>
          <p>Terima Kasih atas Kunjungan Anda</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-lg text-gray-800">Preview Nota</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div ref={printRef} className="p-5 bg-white text-black font-mono">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold">apotik</h1>
            <p className="text-xs text-gray-600 mt-1">Jl. Apotik No. 1, Jakarta</p>
            <p className="text-xs text-gray-600">Telp: 021-1234567</p>
          </div>

          <div className="border-dashed border-t border-b border-gray-400 py-3 my-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold">No:</span>
              <span>#{sale.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-bold">Tanggal:</span>
              <span>{formatDate(sale.createdAt)}</span>
            </div>
          </div>

          <div className="my-4">
            {sale.items.map((item, i) => (
              <div key={i} className="mb-3">
                <div className="font-bold text-sm">{getProductName(item.productId)}</div>
                <div className="flex justify-between text-xs text-gray-700 pl-4">
                  <span>{item.qty} x Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  <span>Rp {Number(subtotal(item)).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 pt-3 mt-4">
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span>Rp {Number(sale.totalAmount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="text-center mt-6 pt-3 border-t border-dashed border-gray-400">
            <p className="text-[10px] text-gray-500">================================</p>
            <p className="font-bold text-sm mt-2">Terima Kasih</p>
            <p className="text-[10px] text-gray-500 mt-2">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 bg-gray-50 rounded-b-lg">
          <Button variant="secondary" onClick={onClose} className="flex-1">Tutup</Button>
          <Button variant="primary" onClick={handlePrint} className="flex-1">Cetak</Button>
        </div>
      </div>
    </div>
  );
}