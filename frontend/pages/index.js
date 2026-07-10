import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsAPI, formatPrice } from '../lib/api';
import ProductCard from '../components/shop/ProductCard';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await productsAPI.getAll({ featured: 'true', limit: 8 });
                setFeaturedProducts(data.products);
            } catch (err) {
                console.error('Failed to load products:', err);
            }
            setLoading(false);
        }
        loadProducts();
    }, []);

    return (
        <div>
            {/* ===== HERO ===== */}
            <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
                <div className="absolute inset-0 bg-gray-100">
                    <img
                        src="/images/wall-lamp.jpg"
                        alt="Luxury interior"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20" />
                </div>
                <div className="relative h-full flex items-center section-container section-padding">
                    <div className="max-w-2xl animate-fade-in">
                        <p className="label-sm text-white text-opacity-80 mb-6">AURA — Luxury Living</p>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight tracking-tight">
                            Elevate Your Space.
                        </h1>
                        <p className="mt-6 text-lg text-white text-opacity-80 max-w-lg leading-relaxed">
                            Luxury lighting, bespoke interiors, and timeless living curated for modern homes.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link href="/shop" className="bg-white text-aura-text px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-opacity-90 transition-all duration-300">
                                Explore Collection
                            </Link>
                            <Link href="/custom-design" className="border border-white text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white hover:text-aura-text transition-all duration-300">
                                Book Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURED CATEGORIES ===== */}
            <section className="section-container section-padding py-24 md:py-32">
                <div className="text-center mb-16">
                    <p className="label-sm mb-4">Curated Collections</p>
                    <h2 className="heading-lg">Explore by Category</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Fancy Lighting',
                            desc: 'Designer lamps, pendants, and chandeliers',
                            image: 'https://images.unsplash.com/photo-1517999348451-5bfe9356039b?w=600',
                            href: '/shop?category=Fancy+Lighting',
                        },
                        {
                            title: 'Premium Appliances',
                            desc: 'Luxury home appliances and smart technology',
                            image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600',
                            href: '/shop?category=Premium+Home+Appliances',
                        },
                        {
                            title: 'Bespoke Interiors',
                            desc: 'Custom interior design and consultation',
                            image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600',
                            href: '/custom-design',
                        },
                    ].map((cat) => (
                        <Link key={cat.title} href={cat.href} className="group">
                            <div className="image-zoom bg-gray-50 rounded-xl aspect-[4/5] relative overflow-hidden">
                                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/40 to-transparent">
                                    <h3 className="text-white text-xl font-light">{cat.title}</h3>
                                    <p className="text-white text-opacity-80 text-sm mt-1">{cat.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="section-container section-padding pb-24 md:pb-32">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="label-sm mb-4">Featured Products</p>
                        <h2 className="heading-lg">New Arrivals</h2>
                    </div>
                    <Link href="/shop" className="btn-outline text-xs hidden md:inline-flex">
                        View All
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-100 rounded-xl aspect-[4/5]" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center md:hidden">
                    <Link href="/shop" className="btn-outline text-xs">
                        View All Products
                    </Link>
                </div>
            </section>

            {/* ===== ABOUT SECTION ===== */}
            <section className="border-t border-aura-border">
                <div className="section-container section-padding py-24 md:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="label-sm mb-4">About Aura</p>
                            <h2 className="heading-lg mb-8">
                                Crafting Spaces<br />That Inspire.
                            </h2>
                            <div className="space-y-4 text-aura-muted leading-relaxed">
                                <p>
                                    AURA is a Mumbai-based atelier specializing in luxury interior design, premium lighting, and curated home objects. We believe every space tells a story — and we're here to help you tell yours.
                                </p>
                                <p>
                                    Drawing from Scandinavian minimalism, Japanese wabi-sabi, and modern Indian craftsmanship, our team creates interiors that are both timeless and deeply personal.
                                </p>
                            </div>
                            <Link href="/about" className="btn-primary mt-8 inline-block">
                                Our Story
                            </Link>
                        </div>
                        <div className="bg-gray-50 rounded-xl aspect-[4/5] overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800"
                                alt="AURA interior design"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CUSTOM DESIGN SECTION ===== */}
            <section className="bg-aura-soft">
                <div className="section-container section-padding py-24 md:py-32">
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="label-sm mb-4">Bespoke Design</p>
                        <h2 className="heading-lg mb-6">
                            Your Vision,<br />Our Expertise.
                        </h2>
                        <p className="text-aura-muted leading-relaxed mb-10">
                            From concept to completion, our design team works closely with you to create interiors that reflect your personality and elevate your everyday living.
                        </p>
                        <Link href="/custom-design" className="btn-primary">
                            Start Your Project
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="section-container section-padding py-24 md:py-32">
                <div className="text-center mb-16">
                    <p className="label-sm mb-4">Testimonials</p>
                    <h2 className="heading-lg">What Our Clients Say</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: 'Ananya Mehta',
                            location: 'Mumbai',
                            rating: 5,
                            text: 'AURA transformed our home into a sanctuary. Every detail was considered with such care and precision. The lighting alone changed the entire atmosphere of our living space.',
                        },
                        {
                            name: 'Rohan Khanna',
                            location: 'New Delhi',
                            rating: 5,
                            text: 'The bespoke design service was exceptional. Our consultation felt more like a creative collaboration than a transaction. The result exceeded every expectation.',
                        },
                        {
                            name: 'Priya Singh',
                            location: 'Bangalore',
                            rating: 5,
                            text: 'I\'ve never experienced such a seamless design process. From the initial mood board to the final installation, the AURA team demonstrated unparalleled expertise and taste.',
                        },
                    ].map((testimonial) => (
                        <div key={testimonial.name} className="p-8 border border-aura-border rounded-xl">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm text-aura-muted leading-relaxed mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                            <div>
                                <p className="text-sm font-medium">{testimonial.name}</p>
                                <p className="text-xs text-aura-muted">{testimonial.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== JOURNAL ===== */}
            <section className="border-t border-aura-border">
                <div className="section-container section-padding py-24 md:py-32">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <p className="label-sm mb-4">Journal</p>
                            <h2 className="heading-lg">Design Stories</h2>
                        </div>
                        <Link href="/journal" className="btn-outline text-xs hidden md:inline-flex">
                            Read More
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'The Art of Layered Lighting',
                                category: 'Lighting Inspiration',
                                image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
                            },
                            {
                                title: 'Minimalist Living: Less is More',
                                category: 'Minimal Living',
                                image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600',
                            },
                            {
                                title: 'Interior Trends for 2025',
                                category: 'Interior Trends',
                                image: 'https://images.unsplash.com/photo-1517999348451-5bfe9356039b?w=600',
                            },
                            {
                                title: 'Bringing Nature Indoors',
                                category: 'Architecture',
                                image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600',
                            },
                        ].map((post) => (
                            <Link key={post.title} href="/journal" className="group">
                                <div className="image-zoom bg-gray-50 rounded-xl aspect-[4/5] overflow-hidden">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="mt-4">
                                    <p className="label-sm">{post.category}</p>
                                    <h3 className="text-sm font-medium mt-1 group-hover:text-aura-muted transition-colors">{post.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-8 text-center md:hidden">
                        <Link href="/journal" className="btn-outline text-xs">
                            Read More
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}