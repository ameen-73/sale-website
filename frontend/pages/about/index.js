import Link from 'next/link';

export default function About() {
    return (
        <div>
            {/* Hero */}
            <section className="section-container section-padding py-16 md:py-24">
                <div className="max-w-3xl">
                    <p className="label-sm mb-4">About Aura</p>
                    <h1 className="heading-xl mb-8">
                        Crafting Timeless<br />Spaces Since 2018.
                    </h1>
                    <p className="text-lg text-aura-muted leading-relaxed max-w-2xl">
                        AURA is a Mumbai-based design atelier that bridges the gap between Scandinavian minimalism, Japanese wabi-sabi, and modern Indian craftsmanship. We create interiors that are both timeless and deeply personal.
                    </p>
                </div>
            </section>

            {/* Image */}
            <section className="section-container section-padding pb-16">
                <div className="bg-gray-50 rounded-xl aspect-[2/1] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1600" alt="AURA studio" className="w-full h-full object-cover" />
                </div>
            </section>

            {/* Story */}
            <section className="section-container section-padding py-16 md:py-24 border-t border-aura-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <p className="label-sm mb-4">Our Story</p>
                        <h2 className="heading-lg mb-8">Where Design<br />Meets Soul.</h2>
                    </div>
                    <div className="space-y-6 text-aura-muted leading-relaxed">
                        <p>
                            Founded in 2018 by architect and designer Anika Verma, AURA began as a small lighting studio in Mumbai's Kala Ghoda district. What started with a collection of handcrafted pendant lights has since evolved into a full-service luxury interior design atelier.
                        </p>
                        <p>
                            Our philosophy is rooted in the belief that great design is invisible — it doesn't shout, it whispers. Every piece we curate, every space we design, is guided by this principle of quiet elegance.
                        </p>
                        <p>
                            Today, AURA works with discerning clients across India, creating homes, offices, and commercial spaces that reflect a refined aesthetic — one that balances warmth with precision, tradition with modernity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-aura-soft">
                <div className="section-container section-padding py-24">
                    <div className="text-center mb-16">
                        <p className="label-sm mb-4">Our Values</p>
                        <h2 className="heading-lg">What We Stand For</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Craftsmanship', desc: 'Every piece is selected for its quality of making. We work with artisans who share our obsession with detail.' },
                            { title: 'Sustainability', desc: 'We believe in design that lasts. Our pieces are made to be cherished for generations, not discarded.' },
                            { title: 'Personalization', desc: 'No two spaces are alike. Every project is a unique collaboration between our team and your vision.' },
                        ].map((v) => (
                            <div key={v.title} className="text-center">
                                <h3 className="text-lg font-medium mb-3">{v.title}</h3>
                                <p className="text-sm text-aura-muted leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-container section-padding py-24 text-center">
                <h2 className="heading-lg mb-6">Let's Create Together</h2>
                <p className="text-aura-muted mb-8 max-w-md mx-auto">Ready to transform your space? Our team is here to bring your vision to life.</p>
                <Link href="/custom-design" className="btn-primary">Start Your Project</Link>
            </section>
        </div>
    );
}