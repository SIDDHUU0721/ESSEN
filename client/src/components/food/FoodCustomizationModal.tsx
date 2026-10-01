import React, { useState } from 'react';
import { X, Check, Plus, Minus, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { getFoodImage } from '../../utils/foodImages';

interface FoodCustomizationModalProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodCustomizationModal: React.FC<FoodCustomizationModalProps> = ({
  item,
  restaurantId,
  restaurantName,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    Array<{ groupName: string; optionName: string; price: number }>
  >([]);

  if (!isOpen) return null;

  const foodImageUrl = getFoodImage(item.name, item.cuisine, item.image);

  const handleOptionToggle = (groupName: string, optionName: string, price: number, type: 'single' | 'multiple') => {
    if (type === 'single') {
      setSelectedCustomizations((prev) => [
        ...prev.filter((c) => c.groupName !== groupName),
        { groupName, optionName, price },
      ]);
    } else {
      const exists = selectedCustomizations.find((c) => c.groupName === groupName && c.optionName === optionName);
      if (exists) {
        setSelectedCustomizations((prev) =>
          prev.filter((c) => !(c.groupName === groupName && c.optionName === optionName))
        );
      } else {
        setSelectedCustomizations((prev) => [...prev, { groupName, optionName, price }]);
      }
    }
  };

  const extraCost = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
  const calculatedUnitPrice = item.price + extraCost;
  const totalPrice = calculatedUnitPrice * quantity;

  const handleConfirm = () => {
    addToCart(item, restaurantId, restaurantName, quantity, selectedCustomizations, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img
            src={foodImageUrl}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.src = getFoodImage(item.name, item.cuisine);
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            <p className="text-xs text-brand-400 font-semibold">Base Price: ₹{item.price}</p>
          </div>
        </div>

        {/* Scrollable Customization Groups */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {item.customizationGroups?.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{group.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">
                  {group.type === 'single' ? 'Select 1 option' : 'Optional Multi-select'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {group.options.map((opt, oIdx) => {
                  const isSelected = selectedCustomizations.some(
                    (c) => c.groupName === group.name && c.optionName === opt.name
                  );
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleOptionToggle(group.name, opt.name, opt.price, group.type)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className="font-medium">{opt.name}</span>
                      </div>
                      <span className="text-brand-400 font-bold">
                        {opt.price === 0 ? 'Free' : `+ ₹${opt.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Cooking Instructions */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-bold text-white text-xs">Special Instructions</label>
            <input
              type="text"
              placeholder="e.g. Less oil, extra crispy, no onion..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Footer with Quantity and Total Price */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold px-2 text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-between px-4 transition-all active:scale-95"
          >
            <span>Add Customized Item</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
