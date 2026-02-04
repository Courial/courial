import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "AmyZett",
    role: "Verified Customer",
    content:
      "The customer service at Courial definitely gets 5 gold stars! Working with them takes me back to the good old days where a friendly voice greets me on the phone and goes above and beyond to help.",
    rating: 5,
  },
  {
    name: "Nina C.",
    location: "Florida",
    role: "Business Owner",
    content:
      "I cannot thank the Courial team enough for going above and beyond for me. I needed help obtaining a very important package in South Carolina, where I do not reside, and having it dropped off promptly.",
    rating: 5,
  },
  {
    name: "Michael R.",
    location: "New York",
    role: "Tech Executive",
    content:
      "We've integrated Courial's API into our e-commerce platform and the results have been incredible. Same-day delivery has increased our conversion rate by 40%.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Loved by thousands
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a community of people who trust Courial for their delivery needs.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full rounded-xl bg-muted/50 border border-border p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-muted-foreground/30 mb-4" />

                {/* Content */}
                <p className="text-foreground/80 mb-6 leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-foreground text-foreground"
                    />
                  ))}
                </div>

                {/* Author */}
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                    {testimonial.location && ` • ${testimonial.location}`}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* App Store Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="https://apps.apple.com/us/app/courial-delivery-errands/id1521638262"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Read more reviews on the App Store →
          </a>
        </motion.div>
      </div>
    </section>
  );
};