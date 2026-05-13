import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Search, ShoppingBag, Star, X } from 'lucide-react';
import { Card } from '../components/Components';

const categories = ['All', 'Beats', 'Mixing', 'Mastering', 'Artwork', 'Promotion'];

const listings = [
  { id: 1, title: 'Afrobeats Type Beat — "Lagos Nights"', seller: 'ProdByFlame', price: 25, category: 'Beats', color: 'from-orange-500 to-red-600', rating: 4.8, sold: 32, description: 'Hard-hitting Afrobeats instrumental with Amapiano influence. 140 BPM, Cm. Includes MP3 + WAV stems. Instant delivery after purchase.', tags: ['Afrobeats', 'Amapiano', '140 BPM'] },
  { id: 2, title: 'Professional Mix & Master', seller: 'SoundLabStudios', price: 80, category: 'Mixing', color: 'from-blue-500 to-indigo-600', rating: 4.9, sold: 105, description: 'Industry-standard mixing and mastering for your track. Includes 2 revisions, stem processing, and final WAV/MP3 delivery within 48 hours.', tags: ['Mixing', 'Mastering', '48hr Delivery'] },
  { id: 3, title: 'Custom Album Cover Art', seller: 'VisualVibes', price: 40, category: 'Artwork', color: 'from-pink-500 to-purple-600', rating: 4.7, sold: 78, description: 'Unique, eye-catching album/single artwork designed to stand out on DSPs. Delivered in 3000x3000px PNG + layered PSD. 1 revision included.', tags: ['Design', '3000px', 'Custom'] },
  { id: 4, title: 'Drill Type Beat — "Cold Streets"', seller: 'DarkSideBeats', price: 30, category: 'Beats', color: 'from-emerald-500 to-teal-600', rating: 4.6, sold: 19, description: 'Dark UK Drill beat with sliding 808s and eerie melodies. 145 BPM, Gm. MP3 lease + WAV trackout available.', tags: ['UK Drill', '145 BPM', 'Dark'] },
  { id: 5, title: 'Spotify Playlist Placement', seller: 'PlaylistPush', price: 50, category: 'Promotion', color: 'from-green-400 to-emerald-600', rating: 4.3, sold: 210, description: 'Get your song placed on curated Spotify playlists with 5K–50K followers. Guaranteed 30-day placement. Genre-matched for organic growth.', tags: ['Spotify', 'Playlists', 'Organic'] },
  { id: 6, title: 'Vocal Tuning & Editing', seller: 'TuneItUp', price: 35, category: 'Mixing', color: 'from-yellow-500 to-orange-600', rating: 4.5, sold: 44, description: 'Professional vocal tuning (Melodyne/AutoTune), timing correction, noise removal, and breath editing. 24-hour turnaround.', tags: ['Vocals', 'Tuning', '24hr'] },
  { id: 7, title: 'R&B Type Beat — "Midnight"', seller: 'VelvetBeats', price: 20, category: 'Beats', color: 'from-violet-500 to-purple-700', rating: 4.9, sold: 56, description: 'Smooth R&B/Soul beat with live guitar and warm keys. 90 BPM, Ab. Perfect for hooks and melodies. MP3 + WAV included.', tags: ['R&B', 'Soul', '90 BPM'] },
  { id: 8, title: 'Professional Mastering (Stem)', seller: 'MasterMindAudio', price: 60, category: 'Mastering', color: 'from-cyan-500 to-blue-600', rating: 4.8, sold: 88, description: 'Stem mastering for maximum clarity and loudness. Upload your stems and receive a polished, radio-ready master within 72 hours.', tags: ['Mastering', 'Stems', 'Radio-Ready'] },
];

export function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<typeof listings[0] | null>(null);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [sellerSubmitted, setSellerSubmitted] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState<typeof listings[0] | null>(null);
  const [purchased, setPurchased] = useState<number[]>([]);

  const query = searchQuery.trim().toLowerCase();
  const filtered = listings.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !query || item.title.toLowerCase().includes(query) || item.seller.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  // ── Listing Detail View ──
  if (selectedListing) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedListing(null)} className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </button>

        <div className={`h-48 sm:h-64 rounded-3xl bg-gradient-to-br ${selectedListing.color} flex items-end p-6`}>
          <span className="rounded-full bg-black/50 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">{selectedListing.category}</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">{selectedListing.title}</h1>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/5"></div>
            <span className="text-sm font-bold text-white/80">{selectedListing.seller}</span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-bold">{selectedListing.rating}</span>
            </div>
            <span className="text-xs text-white/40">{selectedListing.sold} sold</span>
          </div>
        </div>

        <Card className="space-y-4">
          <h2 className="font-bold text-white">Description</h2>
          <p className="text-sm text-white/70 leading-relaxed">{selectedListing.description}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedListing.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">{tag}</span>
            ))}
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 font-bold">Price</p>
            <p className="text-3xl font-bold text-white mt-1">£{selectedListing.price}</p>
          </div>
          {purchased.includes(selectedListing.id) ? (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="h-5 w-5" /> Purchased
            </div>
          ) : (
            <button
              onClick={() => setPurchaseModal(selectedListing)}
              className="rounded-2xl bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-500 transition"
            >
              Buy Now
            </button>
          )}
        </Card>
      </div>
    );
  }

  // ── Seller Application Form ──
  if (showSellerForm) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setShowSellerForm(false); setSellerSubmitted(false); }} className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </button>

        <h1 className="text-2xl font-bold text-white">Apply as a Seller</h1>
        <p className="text-sm text-white/60">Fill out the form below to apply. Our team will review your application within 48 hours.</p>

        {sellerSubmitted ? (
          <Card className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 grid place-items-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
            <p className="text-sm text-white/60">We'll review your application and get back to you within 48 hours via email.</p>
            <button onClick={() => { setShowSellerForm(false); setSellerSubmitted(false); }} className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition">
              Return to Marketplace
            </button>
          </Card>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSellerSubmitted(true); }} className="space-y-5">
            <Card className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Your Name / Brand</label>
                <input required type="text" placeholder="e.g. ProdByFlame" className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Email Address</label>
                <input required type="email" placeholder="you@example.com" className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Category</label>
                <select required className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/20 transition">
                  <option value="">Select a category</option>
                  <option>Beats</option>
                  <option>Mixing</option>
                  <option>Mastering</option>
                  <option>Artwork</option>
                  <option>Promotion</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Portfolio / Website Link</label>
                <input type="url" placeholder="https://yourportfolio.com" className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">Tell us about your services</label>
                <textarea required rows={4} placeholder="Describe what you offer, your experience, and pricing..." className="w-full rounded-2xl bg-black/25 border border-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20 transition resize-none" />
              </div>
            </Card>

            <button type="submit" className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white hover:bg-red-500 transition">
              Submit Application
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Main Marketplace Grid ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Marketplace</h1>
      </div>

      {/* Search */}
      <Card className="flex items-center gap-3 p-3">
        <Search className="h-5 w-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search beats, services, artwork..."
          className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white">
            <X className="h-3 w-3" />
          </button>
        )}
      </Card>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:text-white border border-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(query || activeCategory !== 'All') && (
        <p className="text-xs font-bold text-white/40">{filtered.length} result{filtered.length !== 1 ? 's' : ''}{query ? ` for "${searchQuery}"` : ''}{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}</p>
      )}

      {/* Listings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {filtered.map((item) => (
          <Card key={item.id} className="group overflow-hidden hover:border-white/20 transition cursor-pointer p-0" onClick={() => setSelectedListing(item)}>
            {/* Gradient cover */}
            <div className={`h-32 bg-gradient-to-br ${item.color} flex items-end justify-between p-4`}>
              <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">{item.category}</span>
              <div className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-bold text-white">{item.rating}</span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white text-sm leading-tight truncate">{item.title}</h3>
              <p className="mt-1 text-xs text-white/50">{item.seller} · {item.sold} sold</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-white">£{item.price}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  View
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-12">
          <ShoppingBag className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/50">No listings found. Try a different search or category.</p>
        </Card>
      )}

      {/* Apply as seller CTA */}
      <Card className="text-center mt-4">
        <p className="text-sm text-white/50">More listings coming soon. Want to sell on the marketplace?</p>
        <button onClick={() => setShowSellerForm(true)} className="mt-3 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition">
          Apply as a Seller
        </button>
      </Card>

      {/* Purchase Confirmation Modal */}
      {purchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setPurchaseModal(null)}>
          <div className="w-full max-w-md rounded-3xl bg-[#1a1a1a] border border-white/10 p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Confirm Purchase</h2>
              <button onClick={() => setPurchaseModal(null)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`h-24 rounded-2xl bg-gradient-to-br ${purchaseModal.color}`}></div>

            <div>
              <p className="font-bold text-white">{purchaseModal.title}</p>
              <p className="text-xs text-white/50 mt-1">by {purchaseModal.seller}</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-4">
              <span className="text-sm text-white/60">Total</span>
              <span className="text-2xl font-bold text-white">£{purchaseModal.price}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPurchaseModal(null)} className="rounded-2xl bg-white/10 py-3 text-sm font-bold text-white hover:bg-white/20 transition">
                Cancel
              </button>
              <button
                onClick={() => {
                  setPurchased((prev) => [...prev, purchaseModal.id]);
                  setPurchaseModal(null);
                  setSelectedListing(purchaseModal);
                }}
                className="rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Pay £{purchaseModal.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
