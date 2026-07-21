import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    category: "Insurance Professionals",
    title: "How AI Is Streamlining Temporary Housing Placements for Adjusters",
    date: "June 12, 2025",
    excerpt: "Discover how automated claim processing reduces placement times from days to hours, keeping families happier and reducing carrier costs."
  },
  {
    id: 2,
    category: "Insurance Professionals",
    title: "What to Look for in a Housing Coordinator for Large-Loss Claims",
    date: "May 28, 2025",
    excerpt: "When the worst happens, you need a coordinator with the network and experience to handle complex placement requirements seamlessly."
  },
  {
    id: 3,
    category: "Displaced Families",
    title: "What to Expect When Your Insurer Places You in Temporary Housing",
    date: "May 14, 2025",
    excerpt: "Losing your home is stressful enough. Here is a step-by-step guide on what the transition to temporary furnished housing looks like."
  },
  {
    id: 4,
    category: "Displaced Families",
    title: "Bringing Pets to Temporary Housing: What You Need to Know",
    date: "April 30, 2025",
    excerpt: "Don't leave your furry family members behind. Learn how to navigate pet policies and find pet-friendly temporary homes during a claim."
  },
  {
    id: 5,
    category: "Property Owners",
    title: "How to List Your Furnished Property with Nova Havens",
    date: "April 15, 2025",
    excerpt: "Join our network of premium furnished homes and start hosting families who need a safe place to land during home repairs."
  },
  {
    id: 6,
    category: "Property Owners",
    title: "What Insurance Housing Coordinators Look for in a Property",
    date: "March 22, 2025",
    excerpt: "From fast Wi-Fi to comfortable bedding, learn the specific amenities that make a property perfect for displaced families."
  },
  {
    id: 7,
    category: "Company News",
    title: "Nova Havens Expands to 48 States",
    date: "March 8, 2025",
    excerpt: "We are proud to announce our nationwide expansion, bringing our compassionate housing coordination to families across the contiguous US."
  },
  {
    id: 8,
    category: "Company News",
    title: "Introducing Automated Claim Processing at Nova Havens",
    date: "February 19, 2025",
    excerpt: "Our new agentic AI technology allows us to process incoming claims and generate housing options faster than ever before."
  }
];

const FILTERS = ["All", "Insurance Professionals", "Displaced Families", "Property Owners", "Company News"];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    document.title = "Blog | Nova Havens";
  }, []);

  const filteredPosts = POSTS.filter(post => 
    activeFilter === "All" || post.category === activeFilter
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1200px] w-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6" data-testid="heading-blog-hero">
            Insights & Resources
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-blog-subtitle">
            Industry knowledge for insurance professionals, displaced families, and property owners.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeFilter === filter 
                  ? 'bg-primary text-[#0A0C10] border-primary hover:brightness-105' 
                  : 'bg-transparent text-muted-foreground border-white/10 hover:border-white/20'
              }`}
              data-testid={`btn-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-card rounded-[16px] border border-white/5 p-6 md:p-8 flex flex-col hover:border-white/10 transition-colors"
              data-testid={`card-post-${post.id}`}
            >
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F2CD6B]/10 text-[#F2CD6B]" data-testid={`tag-category-${post.id}`}>
                  {post.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 leading-tight" data-testid={`heading-post-${post.id}`}>
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1" data-testid={`text-excerpt-${post.id}`}>
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <span className="text-xs text-muted-foreground" data-testid={`text-date-${post.id}`}>{post.date}</span>
                <Link href={`#post-${post.id}`} className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1" data-testid={`link-read-more-${post.id}`}>
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No posts found for this category.
          </div>
        )}
      </section>
    </div>
  );
}
