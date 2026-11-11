import { useState } from 'react';
import { useApp, SEED_REVIEW_IDS, getRecordTimestamp } from '../../context/AppContext';
import { useSeoMeta } from '../seo/SeoMeta';
import { Star, Plus, Check, Loader2 } from 'lucide-react';

export default function ReviewsView() {
  const { reviews, phones, addReview, startGlobalLoading, stopGlobalLoading, showGlobalToast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState(phones[0]?.id || '');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedReviews = [...reviews]
    .filter((r) => r.status === 'approved')
    .sort((a, b) => {
      const isCustomA = !SEED_REVIEW_IDS.has(a.id);
      const isCustomB = !SEED_REVIEW_IDS.has(b.id);
      if (isCustomA && !isCustomB) return -1;
      if (!isCustomA && isCustomB) return 1;
      if (isCustomA && isCustomB) {
        const tsB = getRecordTimestamp(b);
        const tsA = getRecordTimestamp(a);
        if (tsB && tsA && tsB !== tsA) return tsB - tsA;
      }
      return 0;
    });
  const leadReviewedPhone = phones.find((p) => p.id === approvedReviews[0]?.phoneId) || phones[0];

  useSeoMeta({
    title: 'Smartphone User Reviews & Verified Owner Ratings | GsmScope',
    description:
      'Read verified hands-on smartphone user reviews covering real-world battery endurance, camera quality, gaming performance, and daily reliability.',
    image: leadReviewedPhone?.image,
    imageAlt: leadReviewedPhone ? `${leadReviewedPhone.name} user reviews on GsmScope` : 'GsmScope Smartphone User Reviews',
    type: 'website',
    canonicalPath: '/?tab=user-reviews',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const phone = phones.find(p => p.id === selectedPhoneId);
    if (!phone || !name.trim() || !comment.trim()) {
      showGlobalToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    startGlobalLoading();

    try {
      // Simulate real network request dispatch
      await new Promise(res => setTimeout(res, 600));

      addReview({
        phoneId: phone.id,
        phoneName: phone.name,
        userName: name.trim(),
        location: '',
        rating,
        title: '',
        comment: comment.trim(),
        pros: [],
        cons: []
      });

      setSubmitted(true);
      showGlobalToast('Review submitted! It will appear once approved.', 'success');
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setComment('');
      }, 2500);
    } catch {
      showGlobalToast('Failed to submit review. Please try again.', 'error');
    } finally {
      stopGlobalLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
            User Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Honest feedback from people who own and use these devices daily worldwide.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Submission Form Modal / Box */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 max-w-2xl mx-auto shadow-2xl">
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Space_Grotesk']">
            Share Your Hands-on Device Experience
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Reviews undergo moderator verification to ensure genuine buyer experiences.
          </p>

          {submitted ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 font-semibold text-center flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Thank you! Your review has been submitted for moderation.</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Phone</label>
                <select
                  value={selectedPhoneId}
                  onChange={(e) => setSelectedPhoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:border-emerald-500 outline-none"
                >
                  {phones.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:border-emerald-500 outline-none"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Subpar</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Detailed Review</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with battery endurance, cameras, performance, and daily usage..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:border-emerald-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
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
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="site-badge text-[9px] font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 px-1.5 py-px rounded">
                      Featured
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm sm:text-base">
                      {leadRev.phoneName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{leadRev.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: leadRev.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{leadRev.comment}"
                </p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <strong className="text-slate-900 dark:text-white">{leadRev.userName}</strong>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Verified Experience</span>
                </div>
              </div>
            );
          })()}

          {/* 2. Rest Reviews Beneath It */}
          {approvedReviews.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {approvedReviews.slice(1).map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rev.userName}</h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>on <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{rev.phoneName}</strong></span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{rev.date}</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">Verified community verdict</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Owner review</span>
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
