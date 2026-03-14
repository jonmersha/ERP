import React from 'react';
import { Truck, Clock, ArrowDownLeft } from 'lucide-react';
import { PurchaseOrder } from '../../types';

interface IncomingGoodsProps {
  pendingPOs: PurchaseOrder[];
  onReceive: (po: PurchaseOrder) => void;
}

const IncomingGoods: React.FC<IncomingGoodsProps> = ({ pendingPOs, onReceive }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
      <div className="p-6 border-b border-black/5">
        <h3 className="font-serif font-bold text-lg text-black">Pending Receipts</h3>
      </div>
      <div className="divide-y divide-black/5">
        {pendingPOs.length === 0 ? (
          <div className="p-12 text-center text-black/30 italic">No pending purchase orders to receive</div>
        ) : (
          pendingPOs.map(po => (
            <div key={po.id} className="p-6 hover:bg-black/5 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[#5A5A40]">PO #{po.id.slice(0, 8)}</p>
                  <h4 className="font-bold text-black">{po.supplierName}</h4>
                  <p className="text-xs text-black/40 flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    {new Date(po.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Items</p>
                  <p className="font-bold text-black">{po.items.length} types</p>
                </div>
                <button 
                  onClick={() => onReceive(po)}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <ArrowDownLeft size={16} />
                  <span>Receive Items</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncomingGoods;
