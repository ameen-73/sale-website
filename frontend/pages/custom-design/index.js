import { useState } from 'react';
import { inquiriesAPI } from '../../lib/api';

export default function CustomDesign() {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', city: '', roomType: '',
        houseSize: '', budget: '', style: '', details: '', preferredDate: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await inquiriesAPI.create(formData);
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit inquiry:', err);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="section-container section-padding py-24 md:py-32">
                <div className="max-w-lg mx-auto text-center animate-fade-in">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="heading-lg mb-4">Thank You</h1>
                    <p className="text-aura-muted leading-relaxed mb-8">
                        Your design inquiry has been received. Our team will review your requirements and reach out within 24 hours to schedule a consultation.
                    </p>
                    <p className="text-sm text-aura-muted">We look forward to creating something beautiful together.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="section-container section-padding py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <p className="label-sm mb-4">Bespoke Design</p>
                    <h1 className="heading-lg mb-6">Begin Your Design Journey</h1>
                    <p className="text-aura-muted leading-relaxed max-w-xl mx-auto">
                        Tell us about your space and vision. Our design team will craft a personalized proposal tailored to your aesthetic and lifestyle.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Phone *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">City *</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Room Type *</label>
                            <select name="roomType" value={formData.roomType} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors bg-white">
                                <option value="">Select room type</option>
                                <option>Living Room</option>
                                <option>Bedroom</option>
                                <option>Dining Room</option>
                                <option>Kitchen</option>
                                <option>Home Office</option>
                                <option>Entire Home</option>
                                <option>Commercial Space</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">House Size</label>
                            <input type="text" name="houseSize" value={formData.houseSize} onChange={handleChange} placeholder="e.g. 2000 sq ft"
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Budget Range *</label>
                            <select name="budget" value={formData.budget} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors bg-white">
                                <option value="">Select budget</option>
                                <option>₹1,00,000 - ₹3,00,000</option>
                                <option>₹3,00,000 - ₹5,00,000</option>
                                <option>₹5,00,000 - ₹10,00,000</option>
                                <option>₹10,00,000 - ₹20,00,000</option>
                                <option>₹20,00,000+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-aura-muted mb-2">Preferred Style *</label>
                            <select name="style" value={formData.style} onChange={handleChange} required
                                className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors bg-white">
                                <option value="">Select style</option>
                                <option>Scandinavian Minimalist</option>
                                <option>Contemporary Luxury</option>
                                <option>Japanese Wabi-Sabi</option>
                                <option>Mid-Century Modern</option>
                                <option>Industrial Loft</option>
                                <option>Indo-Western Fusion</option>
                                <option>Art Deco</option>
                                <option>Custom / Mixed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-aura-muted mb-2">Project Details *</label>
                        <textarea name="details" value={formData.details} onChange={handleChange} required rows={4}
                            className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors resize-none"
                            placeholder="Describe your vision, requirements, and any inspiration..." />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-aura-muted mb-2">Preferred Consultation Date</label>
                        <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange}
                            className="w-full px-4 py-3 border border-aura-border rounded-xl text-sm outline-none focus:border-aura-text transition-colors" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                        {loading ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                </form>
            </div>
        </div>
    );
}