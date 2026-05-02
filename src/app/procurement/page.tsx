'use client';

import React, { useState } from 'react';
import { ShoppingCart, Package, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function Page() {
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: 'Raw Material A', quantity: 100, price: 5.5 },
    { id: '2', name: 'Packaging Box', quantity: 500, price: 0.8 },
  ]);

  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });

  const addItem = () => {
    if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
      setItems([...items, { ...newItem, id: Math.random().toString(36).substr(2, 9) }]);
      setNewItem({ name: '', quantity: 0, price: 0 });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalSpend = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          Procurement Management
        </h1>
        <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-600">Total Spend</p>
          <p className="text-2xl font-bold text-blue-900">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Place New Order</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</label>
            <input 
              type="text" 
              placeholder="e.g. Steel Pipe"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 w-full md:w-32">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</label>
            <input 
              type="number" 
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newItem.quantity || ''}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5 w-full md:w-32">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <button 
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={item.id} 
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.quantity} units</td>
                <td className="px-6 py-4 text-gray-600">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
