import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SocialShareBar from '../common/SocialShareBar';
import { Star, MessageSquare, MapPin, Plus, Check } from 'lucide-react';

export default function ReviewsView() {
  const { reviews, phones, addReview } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState(phones[0]?.id || '');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = phones.find(p => p.id === selectedPhoneId);
    if (!phone || !name || !title || !comment) return;

    addReview({
      phoneId: phone.id,
      phoneName: phone.name,
      userName: name,
      location,
      rating,
      title,
      comment,
      pros: pros ? pros.split(',').map(s => s.trim()).filter(Boolean) : [],
      cons: cons ? cons.split(',').map(s => s.trim()).filter(Boolean) : []
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setTitle('');
      setComment('');
      setPros('');
      setCons('');
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            User Reviews
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Honest feedback from people who own and use these devices daily in Nigeria.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SocialShareBar 
            title="User Reviews - Real Smartphone Experiences in Nigeria" 
            summary="Read hands-on reviews and verdicts from Nigerian smartphone owners."
            layout="compact"
            showLabel={true}
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form Modal / Box */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 max-w-2xl mx-auto shadow-2xl">
          <h3 className="font-bold text-white text-base font-['Space_Grotesk']">
            Share Your Hands-on Device Experience
          </h3>
          <p className="text-xs text-slate-400">
            Reviews undergo moderator verification to ensure genuine Nigerian buyer experiences.
          </p>

          {submitted ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 font-semibold text-center flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Thank you! Your review has been submitted for moderation.</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Select Phone</label>
                <select
                  value={selectedPhoneId}
                  onChange={(e) => setSelectedPhoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                >
                  {phones.map((p) => (
                    <option key={p.id} value={p.id}>{p.brand} {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chinedu Okeke"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Location in Nigeria</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lekki, Lagos"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Subpar</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Incredible battery life and fast charging"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Detailed Review</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other buyers about battery endurance during power cuts, network stability, cameras, and heating."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Pros (comma separated)</label>
                  <input
                    type="text"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="Fast charging, bright screen"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Cons (comma separated)</label>
                  <input
                    type="text"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="Gets warm, heavy body"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Reviews List Grid - One Big Grid Display + Rest Beneath It */}
      {approvedReviews.length > 0 && (
        <div className="space-y-6">
          {/* 1. ONE BIG Grid Display (Featured Lead Review) */}
          {(() => {
            const leadRev = approvedReviews[0];
            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">
                      Featured Review
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm sm:text-base">
                      {leadRev.phoneName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{leadRev.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: leadRev.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h3 className="font-extrabold text-white text-lg sm:text-xl font-['Space_Grotesk']">
                    &ldquo;{leadRev.title}&rdquo;
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {leadRev.comment}
                </p>

                {(leadRev.pros.length > 0 || leadRev.cons.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {leadRev.pros.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                        <span className="font-bold text-emerald-400 block mb-1">PROS</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {leadRev.pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {leadRev.cons.length > 0 && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
                        <span className="font-bold text-rose-400 block mb-1">CONS</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {leadRev.cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Buyer: <strong>{leadRev.userName}</strong> ({leadRev.location})</span>
                  </div>
                  <SocialShareBar 
                    title={`Review of ${leadRev.phoneName}: "${leadRev.title}" - GsmScope`}
                    summary={leadRev.comment}
                    layout="compact"
                    showLabel={false}
                  />
                </div>
              </div>
            );
          })()}

          {/* 2. Rest Reviews Beneath It */}
          {approvedReviews.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {approvedReviews.slice(1).map((rev) => (
          <div key={rev.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{rev.userName}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{rev.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>on <strong className="text-emerald-400 font-semibold">{rev.phoneName}</strong></span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h4 className="font-semibold text-xs text-white">
                  &ldquo;{rev.title}&rdquo;
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {rev.comment}
              </p>
            </div>

            {/* Pros & Cons */}
            {(rev.pros.length > 0 || rev.cons.length > 0) && (
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px]">
                {rev.pros.length > 0 && (
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">PROS:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {rev.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rev.cons.length > 0 && (
                  <div>
                    <span className="font-bold text-rose-400 block mb-1">CONS:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {rev.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Verified community verdict</span>
              <SocialShareBar 
                title={`Review of ${rev.phoneName}: "${rev.title}" - GsmScope`}
                summary={rev.comment}
                layout="compact"
                showLabel={false}
              />
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
    </div>
  );
}
