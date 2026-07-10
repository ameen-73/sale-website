import Link from 'next/link';

export default function Contact() {
    return (
        <div className="section-container section-padding py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <p className="label-sm mb-4">Contact</p>
                    <h1 className="heading-lg mb-6">Get in Touch</h1>
                    <p className="text-aura-muted leading-relaxed max-w-xl mx-auto">
                        We'd love to hear from you. Whether you have a question about our products, need design advice, or want to start a project.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { label: 'Email', value: 'hello@aura.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                        { label: 'Phone', value: '+91 1800 123 4567', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                        { label: 'Studio', value: 'Mumbai, India', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                    ].map((item) => (
                        <div key={item.label} className="text-center p-8 border border-aura-border rounded-xl">
                            <svg className="w-8 h-8 text-aura-text mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                            </svg>
                            <h3 className="text-sm font-medium mb-1">{item.label}</h3>
                            <p className="text-sm text-aura-muted">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-sm text-aura-muted mb-4">Follow our journey</p>
                    <div className="flex items-center justify-center gap-6">
                        {['Instagram', 'Pinterest', 'Facebook'].map((s) => (
                            <a key={s} href="#" className="text-sm text-aura-muted hover:text-aura-text transition-colors">{s}</a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}