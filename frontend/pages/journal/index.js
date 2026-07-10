import Link from 'next/link';

const posts = [
    { title: 'The Art of Layered Lighting', category: 'Lighting Inspiration', excerpt: 'Discover how to create depth and atmosphere in your home through carefully layered lighting design.', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', date: 'Jun 12, 2025' },
    { title: 'Minimalist Living: Less is More', category: 'Minimal Living', excerpt: 'Explore the philosophy of minimalism and how it can transform your living space into a sanctuary of calm.', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800', date: 'Jun 8, 2025' },
    { title: 'Interior Trends for 2025', category: 'Interior Trends', excerpt: 'From warm neutrals to sculptural lighting, here are the interior design trends defining 2025.', image: 'https://images.unsplash.com/photo-1517999348451-5bfe9356039b?w=800', date: 'Jun 3, 2025' },
    { title: 'Bringing Nature Indoors', category: 'Architecture', excerpt: 'Biophilic design principles that connect your interior spaces with the natural world outside.', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800', date: 'May 28, 2025' },
    { title: 'The Perfect Reading Nook', category: 'Interior Design', excerpt: 'Create a cozy corner for your books with the right chair, lighting, and accessories.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800', date: 'May 22, 2025' },
    { title: 'Scandinavian Design Principles', category: 'Design Philosophy', excerpt: 'Understanding hygge, lagom, and the core tenets of Scandinavian interior design.', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', date: 'May 15, 2025' },
];

export default function Journal() {
    return (
        <div className="section-container section-padding py-12 md:py-16">
            <div className="mb-16">
                <p className="label-sm mb-4">Journal</p>
                <h1 className="heading-xl">Stories & Ideas</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {posts.map((post, i) => (
                    <Link key={i} href="/journal" className="group">
                        <div className="image-zoom bg-gray-50 rounded-xl aspect-[4/5] overflow-hidden mb-5">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <p className="label-sm mb-2">{post.category}</p>
                        <h3 className="text-lg font-medium mb-2 group-hover:text-aura-muted transition-colors">{post.title}</h3>
                        <p className="text-sm text-aura-muted leading-relaxed">{post.excerpt}</p>
                        <p className="text-xs text-aura-muted mt-4">{post.date}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}