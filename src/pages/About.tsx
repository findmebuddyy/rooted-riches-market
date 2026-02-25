import { Leaf, TreePine, Recycle, Heart } from 'lucide-react';

const About = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-4xl font-bold text-center">Our Mission</h1>
      <p className="mt-4 text-center text-lg text-muted-foreground">
        Turning an ecological challenge into sustainable opportunity
      </p>

      <div className="mt-12 space-y-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-primary/10 p-3">
            <TreePine className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">The Prosopis Challenge</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Prosopis juliflora, an invasive species, has spread across vast areas of land, displacing native vegetation and threatening local ecosystems. Rather than seeing it as just a problem, we see it as an opportunity for sustainable development.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-primary/10 p-3">
            <Recycle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Our Solution</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              We harvest invasive Prosopis wood and transform it into premium charcoal, bio-briquettes, handcrafted furniture, fencing poles, and activated carbon. Every product is a step towards ecological restoration.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-primary/10 p-3">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Community Impact</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Our work provides livelihoods for local communities while restoring degraded ecosystems. We employ local artisans and workers, creating a circular economy that benefits both people and the planet.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-primary/10 p-3">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Sustainability First</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Every stage of our production is designed to minimize environmental impact. From harvesting to processing to delivery, we ensure our carbon footprint remains as small as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
