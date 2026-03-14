import React from 'react';
import { Package, Clock, ArrowUpRight } from 'lucide-react';
import { SalesOrder } from '../../types';

interface OutgoingGoodsProps {
  pendingSOs: SalesOrder[];
  onShip: (so: SalesOrder) => void;
}

const OutgoingGoods: React.FC<OutgoingGoodsProps> = ({ pendingSOs, onShip }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
      <div className="p-6 border-b border-black/5">
        <h3 className="font-serif font-bold text-lg text-black">Pending Shipments</h3>
      </div>
      <div className="divide-y divide-black/5">
        {pendingSOs.length === 0 ? (
          <div className="p-12 text-center text-black/30 italic">No pending sales orders to ship</div>
        ) : (
          pendingSOs.map(so => (
            <div key={so.id} className="p-6 hover:bg-black/5 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[#5A5A40]">SO #{so.id.slice(0, 8)}</p>
                  <h4 className="font-bold text-black">{so.outletName}</h4>
                  <p className="text-xs text-black/40 flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    {new Date(so.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Items</p>
                  <p className="font-bold text-black">{so.items.length} types</p>
                </div>
                <button 
                  onClick={() => onShip(so)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <ArrowUpRight size={16} />
                  <span>Ship Items</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OutgoingGoods;
