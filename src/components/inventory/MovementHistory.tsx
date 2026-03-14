import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { GRN, DeliveryNote, RawMaterial, Product } from '../../types';

interface MovementHistoryProps {
  grns: GRN[];
  deliveryNotes: DeliveryNote[];
  materials: RawMaterial[];
  products: Product[];
  getUnitName: (id: string) => string;
}

const MovementHistory: React.FC<MovementHistoryProps> = ({
  grns,
  deliveryNotes,
  materials,
  products,
  getUnitName
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-black">Recent Receipts (GRNs)</h3>
            <ArrowDownLeft size={20} className="text-emerald-600" />
          </div>
          <div className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
            {grns.length === 0 ? (
              <div className="p-12 text-center text-black/30 italic">No receipt history</div>
            ) : (
              grns.map(grn => (
                <div key={grn.id} className="p-4 hover:bg-black/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#5A5A40]">GRN #{grn.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-black">{getUnitName(grn.warehouseId)}</p>
                    </div>
                    <span className="text-[10px] text-black/40">{new Date(grn.receivedAt).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    {grn.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-black/60">{materials.find(m => m.id === item.itemId)?.name || 'Unknown Item'}</span>
                        <span className="font-bold text-emerald-600">+{item.quantityReceived}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-black">Recent Shipments (DNs)</h3>
            <ArrowUpRight size={20} className="text-indigo-600" />
          </div>
          <div className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
            {deliveryNotes.length === 0 ? (
              <div className="p-12 text-center text-black/30 italic">No shipment history</div>
            ) : (
              deliveryNotes.map(dn => (
                <div key={dn.id} className="p-4 hover:bg-black/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#5A5A40]">DN #{dn.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-black">{getUnitName(dn.warehouseId)}</p>
                    </div>
                    <span className="text-[10px] text-black/40">{new Date(dn.shippedAt).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    {dn.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-black/60">{products.find(p => p.id === item.productId)?.name || 'Unknown Product'}</span>
                        <span className="font-bold text-indigo-600">-{item.quantityShipped}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementHistory;
