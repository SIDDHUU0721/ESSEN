import React, { useState } from 'react';
import { Plus, Minus, Star, Sparkles, Flame, Heart, ShoppingBag } from 'lucide-react';
import { getFoodImage } from '../../utils/foodImages';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { FoodCustomizationModal } from './FoodCustomizationModal';

interface FoodCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, restaurantId, restaurantName }) => {
  const { addToCart, decrementItem, getItemQuantity } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const foodImageUrl = getFoodImage(item.name, item.cuisine, item.image);

  const orderedCount = getItemQuantity(item._id) || getItemQuantity(item.name);

  const handleAddClick = () => {
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      setModalOpen(true);
    } else {
      addToCart(item, restaurantId, restaurantName, 1);
    }
  };

  return (
    <>
      <div className={`glass-card glass-card-hover rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group ${
        orderedCount > 0 ? 'border-brand-500/60 ring-1 ring-brand-500/30 bg-slate-900/80 shadow-lg shadow-brand-500/10' : 'border-slate-800 bg-slate-900/60'
      }`}>
        {/* Food Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img
            src={foodImageUrl}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.src = getFoodImage(item.name, item.cuisine);
            }}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Dietary Indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span
              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                item.foodType === 'vegetarian'
                  ? 'border-emerald-500 bg-emerald-950/80'
                  : item.foodType === 'vegan'
                  ? 'border-green-400 bg-green-950/80'
                  : 'border-rose-500 bg-rose-950/80'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.foodType === 'vegetarian'
                    ? 'bg-emerald-500'
                    : item.foodType === 'vegan'
                    ? 'bg-green-400'
                    : 'bg-rose-500'
                }`}
              />
            </span>

            {item.tasteProfile === 'spicy' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5" /> Spicy
              </span>
            )}
          </div>

          {/* Ordered Badge if already in cart */}
          {orderedCount > 0 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-brand-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-lg shadow-brand-500/50 backdrop-blur-md z-10 animate-in fade-in zoom-in-95">
              <ShoppingBag className="w-3 h-3" />
              <span>{orderedCount} Ordered</span>
            </div>
          )}

          {/* Rating & Calories */}
          <div className={`absolute bottom-3 ${orderedCount > 0 ? 'left-3' : 'right-3'} flex items-center gap-1.5 z-10`}>
            {item.calories && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>{item.calories} kcal</span>
              </span>
            )}
            <div className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{item.rating?.toFixed(1) || '4.8'}</span>
            </div>
          </div>

          {/* Sold Out Overlay if unavailable */}
          {(item.isAvailable === false || item.stockCount === 0) && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-rose-500/30">
                Sold Out Today
              </span>
            </div>
          )}
        </div>

        {/* Details & Action */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-white text-sm leading-snug group-hover:text-brand-400 transition-colors">
                {item.name}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>

            {/* Dietary Tags & Allergen Strip */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {item.dietaryTags && item.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold"
                >
                  {tag}
                </span>
              ))}

              {item.allergens && item.allergens.length > 0 && (
                <span className="text-[9px] text-slate-400 bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded-md">
                  Contains: {item.allergens.join(', ')}
                </span>
              )}

              {item.stockCount && item.stockCount > 0 && item.stockCount <= 5 && item.isAvailable !== false && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[9px] border border-amber-500/30 animate-pulse">
                  Only {item.stockCount} left!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-500">Price</span>
              <span className="text-base font-extrabold text-white">₹{item.price}</span>
            </div>

            {item.isAvailable === false || item.stockCount === 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed">
                Sold Out
              </span>
            ) : orderedCount > 0 ? (
              <div className="flex items-center gap-1 bg-slate-950 border border-brand-500/60 rounded-xl p-1 shadow-lg shadow-brand-500/10">
                <button
                  onClick={() => decrementItem(item._id || item.name)}
                  className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
                  aria-label="Decrease quantity"
                  title="Remove one"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-extrabold text-xs text-brand-400">
                  {orderedCount}
                </span>
                <button
                  onClick={handleAddClick}
                  className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition active:scale-95"
                  aria-label="Increase quantity"
                  title={item.customizationGroups?.length ? "Customize another" : "Add one more"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-brand-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{item.customizationGroups?.length ? 'Customize' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {modalOpen && (
        <FoodCustomizationModal
          item={item}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
